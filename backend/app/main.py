import threading
import logging
from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import OperationalError, InterfaceError
from sqlalchemy.orm import Session

from . import models, schemas, crud  # noqa: F401  (models registers the tables)
from .database import get_db, init_db, database_is_up
from .config import settings
from .scheduler import start_scheduler, shutdown_scheduler, check_endpoint

logger = logging.getLogger("api-sentinel")

app = FastAPI(
    title="API Sentinel",
    version="3.0.0",
    description="Real-time API reliability monitoring: uptime, latency and failure-rate tracking.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _boot():
    """Runs in a background thread so the web server opens its port immediately.
    Keeps retrying until the database answers, then starts the 60-second scheduler."""
    while not init_db():
        logger.warning("Retrying database connection in 30s")
        threading.Event().wait(30)
    start_scheduler()


@app.on_event("startup")
def on_startup():
    threading.Thread(target=_boot, daemon=True).start()


@app.on_event("shutdown")
def on_shutdown():
    shutdown_scheduler()


@app.exception_handler(OperationalError)
@app.exception_handler(InterfaceError)
def database_unavailable(request: Request, exc: Exception):
    """If the database is asleep or unreachable, answer 503 instead of crashing."""
    return JSONResponse(status_code=503, content={"detail": "Database unavailable, retrying"})


@app.get("/")
def root():
    return {"name": "API Sentinel", "version": "3.0.0", "docs": "/docs", "health": "/health"}


@app.get("/health")
def health():
    """Render pings this to know the server is alive (always 200).
    The frontend also reads "database" to show a helpful message."""
    return {"status": "ok", "database": "ok" if database_is_up() else "unavailable"}


@app.post("/apis", response_model=schemas.EndpointOut, status_code=201)
def create_api(data: schemas.EndpointCreate, db: Session = Depends(get_db)):
    endpoint = crud.create_endpoint(db, data)
    check_endpoint(endpoint.id)  # immediate check so the UI doesn't sit at "pending"
    return endpoint


@app.get("/apis", response_model=list[schemas.EndpointStatus])
def list_apis(db: Session = Depends(get_db)):
    endpoints = crud.get_endpoints(db)
    return [crud.build_status(db, e) for e in endpoints]


@app.get("/apis/summary", response_model=schemas.SummaryOut)
def apis_summary(db: Session = Depends(get_db)):
    endpoints = crud.get_endpoints(db)
    statuses = [crud.build_status(db, e) for e in endpoints]
    return crud.build_summary(statuses)


@app.get("/apis/{endpoint_id}", response_model=schemas.EndpointStatus)
def get_api(endpoint_id: int, db: Session = Depends(get_db)):
    endpoint = crud.get_endpoint(db, endpoint_id)
    if not endpoint:
        raise HTTPException(status_code=404, detail="Endpoint not found")
    return crud.build_status(db, endpoint)


@app.patch("/apis/{endpoint_id}", response_model=schemas.EndpointOut)
def update_api(endpoint_id: int, data: schemas.EndpointUpdate, db: Session = Depends(get_db)):
    endpoint = crud.get_endpoint(db, endpoint_id)
    if not endpoint:
        raise HTTPException(status_code=404, detail="Endpoint not found")
    return crud.update_endpoint(db, endpoint, data)


@app.delete("/apis/{endpoint_id}")
def delete_api(endpoint_id: int, db: Session = Depends(get_db)):
    endpoint = crud.get_endpoint(db, endpoint_id)
    if not endpoint:
        raise HTTPException(status_code=404, detail="Endpoint not found")
    crud.delete_endpoint(db, endpoint)
    return {"detail": "deleted"}


@app.get("/apis/{endpoint_id}/history", response_model=list[schemas.HealthCheckOut])
def api_history(endpoint_id: int, limit: int = 100, db: Session = Depends(get_db)):
    endpoint = crud.get_endpoint(db, endpoint_id)
    if not endpoint:
        raise HTTPException(status_code=404, detail="Endpoint not found")
    return crud.get_history(db, endpoint_id, limit)


@app.post("/apis/{endpoint_id}/check-now", response_model=schemas.EndpointStatus)
def force_check(endpoint_id: int, db: Session = Depends(get_db)):
    endpoint = crud.get_endpoint(db, endpoint_id)
    if not endpoint:
        raise HTTPException(status_code=404, detail="Endpoint not found")
    check_endpoint(endpoint_id)
    db.refresh(endpoint)
    return crud.build_status(db, endpoint)
