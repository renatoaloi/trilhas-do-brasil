from functools import lru_cache
from pathlib import Path

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


def normalize_database_url(url: str) -> str:
    """Force async drivers — hosts often give postgresql:// (defaults to psycopg2)."""
    if url.startswith("postgres://"):
        url = "postgresql://" + url.removeprefix("postgres://")
    replacements = (
        ("postgresql+psycopg2://", "postgresql+asyncpg://"),
        ("postgresql+psycopg://", "postgresql+asyncpg://"),
        ("postgresql://", "postgresql+asyncpg://"),
        ("sqlite://", "sqlite+aiosqlite://"),
    )
    for old, new in replacements:
        if url.startswith(old):
            return new + url.removeprefix(old)
    return url


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    database_url: str = "sqlite+aiosqlite:///./storage/app.db"
    jwt_secret: str = "dev-secret-change-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expiry: int = 3600
    storage_path: str = "./storage"
    cors_origins: str = "http://localhost:5173,http://localhost:8080"
    backend_port: int = 8000
    rate_limit: str = "20/minute"

    @field_validator("database_url", mode="before")
    @classmethod
    def _normalize_database_url(cls, v: object) -> object:
        if isinstance(v, str):
            return normalize_database_url(v)
        return v

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


def ensure_storage_dirs(database_url: str | None = None, storage_path: str | None = None) -> None:
    settings = get_settings()
    path = storage_path or settings.storage_path
    Path(path).mkdir(parents=True, exist_ok=True)

    url = database_url or settings.database_url
    if "sqlite" in url:
        # sqlite+aiosqlite:///./storage/app.db or sqlite+aiosqlite:////storage/app.db
        raw = url.split(":///", 1)[-1] if ":///" in url else url.split("://", 1)[-1]
        db_path = Path(raw)
        if not db_path.is_absolute():
            db_path = Path.cwd() / db_path
        db_path.parent.mkdir(parents=True, exist_ok=True)
