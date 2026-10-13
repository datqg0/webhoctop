import base64
import binascii
import hashlib
import hmac
import json
import time

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models import User

bearer_scheme = HTTPBearer(auto_error=False)
TOKEN_TTL_SECONDS = 12 * 60 * 60


def _encode(value: bytes) -> str:
    return base64.urlsafe_b64encode(value).decode("ascii").rstrip("=")


def _decode(value: str) -> bytes:
    return base64.urlsafe_b64decode(value + "=" * (-len(value) % 4))


def create_admin_token() -> str:
    payload = _encode(json.dumps({"sub": settings.ADMIN_USERNAME, "exp": int(time.time()) + TOKEN_TTL_SECONDS}, separators=(",", ":")).encode())
    signature = _encode(hmac.new(settings.ADMIN_TOKEN_SECRET.encode(), payload.encode(), hashlib.sha256).digest())
    return f"{payload}.{signature}"


def create_user_token(user_id: str) -> str:
    payload = _encode(json.dumps({
        "sub": user_id,
        "role": "student",
        "exp": int(time.time()) + TOKEN_TTL_SECONDS,
    }, separators=(",", ":")).encode())
    signature = _encode(hmac.new(settings.ADMIN_TOKEN_SECRET.encode(), payload.encode(), hashlib.sha256).digest())
    return f"{payload}.{signature}"


def _decode_token(credentials: HTTPAuthorizationCredentials):
    if not credentials or not settings.ADMIN_TOKEN_SECRET:
        raise HTTPException(status_code=401, detail="Authentication required")

    try:
        payload, signature = credentials.credentials.split(".", 1)
        expected = _encode(hmac.new(settings.ADMIN_TOKEN_SECRET.encode(), payload.encode(), hashlib.sha256).digest())
        if not hmac.compare_digest(signature, expected):
            raise ValueError("Invalid signature")
        claims = json.loads(_decode(payload))
        if claims.get("exp", 0) < time.time():
            raise ValueError("Expired token")
        return claims
    except (ValueError, TypeError, binascii.Error, json.JSONDecodeError):
        raise HTTPException(status_code=401, detail="Session is invalid or expired")


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    claims = _decode_token(credentials)
    if claims.get("role") != "student" or not claims.get("sub"):
        raise HTTPException(status_code=401, detail="Student sign-in required")
    user = db.query(User).filter(User.id == claims["sub"]).first()
    if not user:
        raise HTTPException(status_code=401, detail="User account not found")
    return user


def get_optional_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
):
    if not credentials:
        return None
    return get_current_user(credentials=credentials, db=db)


def verify_google_credential(credential: str):
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=503, detail="Google sign-in is not configured")

    try:
        from google.auth.transport import requests
        from google.oauth2 import id_token

        claims = id_token.verify_oauth2_token(
            credential,
            requests.Request(),
            settings.GOOGLE_CLIENT_ID,
        )
    except ValueError:
        raise HTTPException(status_code=401, detail="Google credential is invalid or expired")
    except Exception:
        raise HTTPException(status_code=503, detail="Google verification is temporarily unavailable")

    if claims.get("email_verified") is not True or not isinstance(claims.get("email"), str):
        raise HTTPException(status_code=401, detail="A verified Google email is required")
    return claims


def require_admin(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)):
    if not credentials or not settings.ADMIN_USERNAME or not settings.ADMIN_TOKEN_SECRET:
        raise HTTPException(status_code=401, detail="Cần đăng nhập bằng tài khoản quản trị")

    try:
        payload, signature = credentials.credentials.split(".", 1)
        expected = _encode(hmac.new(settings.ADMIN_TOKEN_SECRET.encode(), payload.encode(), hashlib.sha256).digest())
        if not hmac.compare_digest(signature, expected):
            raise ValueError("Invalid signature")
        claims = json.loads(_decode(payload))
        if claims.get("sub") != settings.ADMIN_USERNAME or claims.get("exp", 0) < time.time():
            raise ValueError("Invalid or expired token")
    except (ValueError, TypeError, binascii.Error, json.JSONDecodeError):
        raise HTTPException(status_code=401, detail="Phiên đăng nhập không hợp lệ hoặc đã hết hạn")

    return claims["sub"]
