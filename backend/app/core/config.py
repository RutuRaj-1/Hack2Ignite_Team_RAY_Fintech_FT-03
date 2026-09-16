"""
FINBRIDGE — Application Configuration (Part 02)
Added: Firebase service account path, SQLite dev default.
"""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # --- Application ---
    app_name: str = "FINBRIDGE API"
    app_version: str = "0.1.0"
    app_env: str = "development"
    app_debug: bool = True
    app_secret_key: str = "CHANGE_ME"

    # --- Server ---
    host: str = "0.0.0.0"
    port: int = 8000

    # --- Database ---
    # Default to SQLite for zero-setup local development.
    # Switch to postgresql+asyncpg://... for production/Supabase.
    database_url: str = "sqlite+aiosqlite:///./finbridge.db"

    # --- Supabase (optional) ---
    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_service_role_key: str = ""

    # --- Firebase Admin ---
    # Path to Firebase service account JSON (never commit this file).
    firebase_service_account_path: str = "./firebase-service-account.json"

    # --- CORS ---
    allowed_origins: str = "http://localhost:3000,http://127.0.0.1:3000"

    # --- ML ---
    ml_models_path: str = "./data/models"

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.allowed_origins.split(",")]

    @property
    def is_production(self) -> bool:
        return self.app_env == "production"

    @property
    def is_sqlite(self) -> bool:
        return self.database_url.startswith("sqlite")


@lru_cache
def get_settings() -> Settings:
    """Return cached application settings (singleton)."""
    return Settings()
