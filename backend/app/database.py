import time
import logging
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from .config import settings

logger = logging.getLogger("api-sentinel.db")

url = settings.DATABASE_URL

# Some providers hand out "postgres://" URLs; SQLAlchemy 2.x wants "postgresql://".
if url.startswith("postgres://"):
    url = url.replace("postgres://", "postgresql://", 1)

if url.startswith("sqlite"):
    # SQLite needs this flag when used from several threads (scheduler + requests).
    engine = create_engine(url, connect_args={"check_same_thread": False})
else:
    # Neon (serverless Postgres) closes idle connections and sleeps after a few
    # minutes. pool_pre_ping tests a connection before using it, and
    # pool_recycle replaces connections before Neon would drop them.
    engine = create_engine(url, pool_pre_ping=True, pool_recycle=280, pool_size=5, max_overflow=5)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db(attempts: int = 6, wait_seconds: int = 5) -> bool:
    """Create tables, retrying if the database is still waking up.

    v2 created tables at import time, so if the database was unreachable the
    whole server crashed ("Exited with status 1"). Now we retry a few times and,
    if it still fails, keep the API running and report the problem via /health.
    """
    for attempt in range(1, attempts + 1):
        try:
            Base.metadata.create_all(bind=engine)
            logger.info("Database ready")
            return True
        except Exception as exc:  # noqa: BLE001 - any DB error should be retried
            logger.warning(f"Database not ready (attempt {attempt}/{attempts}): {exc}")
            time.sleep(wait_seconds)
    logger.error("Database unavailable after retries; API will keep running")
    return False


def database_is_up() -> bool:
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except Exception:  # noqa: BLE001
        return False
