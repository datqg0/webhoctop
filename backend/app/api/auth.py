import hmac

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.auth import create_admin_token
from app.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])


class AdminLogin(BaseModel):
    username: str
    password: str


@router.post("/admin/login")
def admin_login(credentials: AdminLogin):
    if not settings.ADMIN_USERNAME or not settings.ADMIN_PASSWORD or not settings.ADMIN_TOKEN_SECRET:
        raise HTTPException(status_code=503, detail="Tài khoản quản trị chưa được cấu hình trên máy chủ")

    username_ok = hmac.compare_digest(credentials.username.encode(), settings.ADMIN_USERNAME.encode())
    password_ok = hmac.compare_digest(credentials.password.encode(), settings.ADMIN_PASSWORD.encode())
    if not username_ok or not password_ok:
        raise HTTPException(status_code=401, detail="Tên đăng nhập hoặc mật khẩu không đúng")

    return {"access_token": create_admin_token(), "token_type": "bearer", "expires_in": 43200}
