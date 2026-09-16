"""
FINBRIDGE — Application Configuration
Loaded from environment variables via Pydantic BaseSettings.
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
    database_url: str = "postgresql+asyncpg://postgres:password@localhost:5432/finbridge"

    # --- Supabase (optional) ---
    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_service_role_key: str = ""

    # --- JWT ---
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 30
    jwt_refresh_token_expire_days: int = 7

    # --- CORS ---
    allowed_origins: str = "http://localhost:3000"

    # --- ML ---
    ml_models_path: str = "./data/models"

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.allowed_origins.split(",")]

    @property
    def is_production(self) -> bool:
        return self.app_env == "production"


@lru_cache
def get_settings() -> Settings:
    """Return cached application settings (singleton)."""
    return Settings()
