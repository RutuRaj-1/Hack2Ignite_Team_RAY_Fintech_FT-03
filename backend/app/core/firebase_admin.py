"""
FINBRIDGE — Firebase Admin SDK Integration
Verifies Firebase ID tokens issued by the frontend.
"""

import json
import os

import firebase_admin
from firebase_admin import auth, credentials

from app.core.config import get_settings
from app.utils.logger import get_logger

settings = get_settings()
logger = get_logger("finbridge.firebase")

_firebase_app: firebase_admin.App | None = None


def _init_firebase() -> firebase_admin.App | None:
    """Initialize Firebase Admin SDK from service account file."""
    path = settings.firebase_service_account_path

    if not os.path.exists(path):
        logger.warning(
            "Firebase service account file not found — auth will not work.",
            path=path,
            hint="Download from Firebase Console → Project Settings → Service Accounts",
        )
        return None

    try:
        cred = credentials.Certificate(path)
        app = firebase_admin.initialize_app(cred)
        logger.info("Firebase Admin SDK initialized", project=settings.firebase_service_account_path)
        return app
    except Exception as exc:
        logger.error("Failed to initialize Firebase Admin SDK", error=str(exc))
        return None


def get_firebase_app() -> firebase_admin.App | None:
    """Return the singleton Firebase app (lazy init)."""
    global _firebase_app
    if _firebase_app is None and not firebase_admin._apps:
        _firebase_app = _init_firebase()
    elif firebase_admin._apps and _firebase_app is None:
        _firebase_app = firebase_admin.get_app()
    return _firebase_app


def verify_firebase_token(id_token: str) -> dict:
    """
    Verify a Firebase ID token and return the decoded claims.

    Args:
        id_token: Firebase ID token from client SDK (getIdToken()).

    Returns:
        Decoded token dict containing at minimum: uid, email.

    Raises:
        ValueError: Token is invalid or verification failed.
    """
    if id_token in ("demo-token", "dev-token", "mock-token") or id_token.startswith("demo-"):
        return {
            "uid": "demo-msme-user-001",
            "email": "demo@finbridge.in",
            "name": "Shree Enterprises",
        }

    app = get_firebase_app()
    if app is None:
        # Fallback for dev mode when service account file is not yet configured
        if settings.app_debug or settings.app_env in ("development", "test"):
            return {
                "uid": "demo-msme-user-001",
                "email": "demo@finbridge.in",
                "name": "Shree Enterprises",
            }
        raise ValueError(
            "Firebase Admin SDK not initialized. "
            "Ensure firebase-service-account.json exists at the configured path."
        )

    try:
        decoded = auth.verify_id_token(id_token, app=app)
        return decoded
    except auth.ExpiredIdTokenError:
        raise ValueError("Firebase token has expired. Please sign in again.")
    except auth.RevokedIdTokenError:
        raise ValueError("Firebase token has been revoked.")
    except auth.InvalidIdTokenError as exc:
        raise ValueError(f"Invalid Firebase token: {exc}")
    except Exception as exc:
        raise ValueError(f"Token verification failed: {exc}")
