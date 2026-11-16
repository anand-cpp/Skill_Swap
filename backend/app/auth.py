"""Cryptographic session token authentication and verification for SkillSwap."""

import base64
import hashlib
import hmac
import json
import time
from typing import Optional
from fastapi import Header, HTTPException, status

from .config import get_settings
from .db import get_conn


def _b64_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode("utf-8").rstrip("=")


def _b64_decode(s: str) -> bytes:
    padding = 4 - (len(s) % 4)
    if padding and padding != 4:
        s += "=" * padding
    return base64.urlsafe_b64decode(s.encode("utf-8"))


def create_session_token(student_id: int, expires_in: int = 86400) -> str:
    """Generate an HMAC-SHA256 signed bearer token for student_id."""
    settings = get_settings()
    now = int(time.time())
    payload = {
        "sub": student_id,
        "iat": now,
        "exp": now + expires_in,
        "iss": "skillswap",
    }
    payload_bytes = json.dumps(payload, separators=(",", ":")).encode("utf-8")
    payload_b64 = _b64_encode(payload_bytes)

    key = settings.session_secret.encode("utf-8")
    sig = hmac.new(key, payload_b64.encode("utf-8"), hashlib.sha256).digest()
    sig_b64 = _b64_encode(sig)

    return f"v1.{payload_b64}.{sig_b64}"


def verify_session_token(token: str) -> dict:
    """Verify cryptographic signature and expiry of session token.

    Raises HTTPException on invalid or expired token.
    """
    settings = get_settings()
    parts = token.split(".")
    if len(parts) != 3 or parts[0] != "v1":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Malformed authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    version, payload_b64, sig_b64 = parts
    key = settings.session_secret.encode("utf-8")
    expected_sig = hmac.new(key, payload_b64.encode("utf-8"), hashlib.sha256).digest()
    expected_sig_b64 = _b64_encode(expected_sig)

    if not hmac.compare_digest(sig_b64, expected_sig_b64):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token signature",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        payload_bytes = _b64_decode(payload_b64)
        payload = json.loads(payload_bytes.decode("utf-8"))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Corrupted token payload",
            headers={"WWW-Authenticate": "Bearer"},
        )

    now = int(time.time())
    if payload.get("exp", 0) < now:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return payload


def get_current_student_optional(
    authorization: Optional[str] = Header(None, alias="Authorization"),
) -> Optional[dict]:
    """Extract authenticated student payload from Authorization header if present."""
    if not authorization:
        return None

    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header must follow 'Bearer <token>' format",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return verify_session_token(parts[1])
