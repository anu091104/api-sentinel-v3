import os
from dotenv import load_dotenv

# Reads backend/.env when you run locally. On Render the values come from the
# dashboard instead, and this line simply finds nothing to load.
load_dotenv()


def _split_origins(raw: str) -> list[str]:
    return [o.strip().rstrip("/") for o in raw.split(",") if o.strip()]


class Settings:
    """Everything that changes between your laptop and the cloud lives here,
    read from environment variables, so deploying never needs a code change."""

    # Local default: a SQLite file. In production: your Neon PostgreSQL URL.
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./sentinel.db").strip()

    # Comma-separated list, e.g. "https://my-app.vercel.app,http://localhost:5173"
    CORS_ORIGINS: list[str] = _split_origins(os.getenv("CORS_ORIGINS", "*"))

    SWEEP_INTERVAL_SECONDS: int = int(os.getenv("SWEEP_INTERVAL_SECONDS", "60"))
    REQUEST_TIMEOUT_SECONDS: int = int(os.getenv("REQUEST_TIMEOUT_SECONDS", "10"))


settings = Settings()
