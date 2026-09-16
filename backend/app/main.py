"""
FINBRIDGE — FastAPI Application Factory
Entry point for the FINBRIDGE backend API.

Start with:
    uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
"""

from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1.router import api_router
from app.core.config import get_settings
from app.utils.logger import configure_logging, get_logger

settings = get_settings()
configure_logging()
logger = get_logger("finbridge.main")


# ---------------------------------------------------------------------------
# Lifespan — startup / shutdown hooks
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Manage application startup and shutdown lifecycle."""
    logger.info(
        "FINBRIDGE API starting",
        environment=settings.app_env,
        version=settings.app_version,
    )
    yield
    logger.info("FINBRIDGE API shutting down")


# ---------------------------------------------------------------------------
# Application Factory
# ---------------------------------------------------------------------------

def create_application() -> FastAPI:
    """Create and configure the FastAPI application instance."""
    application = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description=(
            "FINBRIDGE: AI-Powered Inclusive Micro-Lending & "
            "Financial Intelligence Platform. "
            "Core: FT-03 Secure Micro-Lending with Alternative Credit Assessment."
        ),
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        lifespan=lifespan,
        debug=settings.app_debug,
    )

    # --- CORS ---
    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # --- Routers ---
    application.include_router(api_router)

    # --- Root health alias (top-level convenience) ---
    @application.get("/health", tags=["health"], include_in_schema=False)
    async def root_health() -> dict[str, str]:
        return {"status": "ok", "service": "finbridge-api"}

    return application


# ---------------------------------------------------------------------------
# Global Exception Handlers
# ---------------------------------------------------------------------------

app = create_application()


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Catch-all exception handler — prevents leaking stack traces in production."""
    logger.error(
        "Unhandled exception",
        path=str(request.url),
        method=request.method,
        error=str(exc),
        exc_info=not settings.is_production,
    )
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "message": "An internal server error occurred.",
            "errors": None,
        },
    )


@app.exception_handler(404)
async def not_found_handler(request: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={
            "success": False,
            "message": f"Route not found: {request.url.path}",
            "errors": None,
        },
    )
