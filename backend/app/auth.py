import base64
import binascii
import hashlib
import hmac
import json
import time

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.config import settings

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
