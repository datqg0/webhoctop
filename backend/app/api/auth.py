import hmac

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import Depends

from app.auth import create_admin_token, create_user_token, verify_google_credential
from app.config import settings
from app.database import get_db
from app.models import User

router = APIRouter(prefix="/auth", tags=["Authentication"])


class AdminLogin(BaseModel):
    username: str
    password: str


class GoogleAdminLogin(BaseModel):
    credential: str


class GoogleUserLogin(BaseModel):
    credential: str


@router.post("/admin/login")
def admin_login(credentials: AdminLogin):
    if not settings.ADMIN_USERNAME or not settings.ADMIN_PASSWORD or not settings.ADMIN_TOKEN_SECRET:
        raise HTTPException(status_code=503, detail="Tài khoản quản trị chưa được cấu hình trên máy chủ")

    username_ok = hmac.compare_digest(credentials.username.encode(), settings.ADMIN_USERNAME.encode())
    password_ok = hmac.compare_digest(credentials.password.encode(), settings.ADMIN_PASSWORD.encode())
    if not username_ok or not password_ok:
        raise HTTPException(status_code=401, detail="Tên đăng nhập hoặc mật khẩu không đúng")

    return {"access_token": create_admin_token(), "token_type": "bearer", "expires_in": 43200}


@router.post("/google")
def google_user_login(credentials: GoogleUserLogin, db: Session = Depends(get_db)):
    if not settings.ADMIN_TOKEN_SECRET:
        raise HTTPException(status_code=503, detail="User sign-in is not configured")

    claims = verify_google_credential(credentials.credential)
    user = db.query(User).filter(User.google_sub == claims["sub"]).first()
    email = claims["email"].strip().lower()
    if user is None:
        full_name = (claims.get("name") or email.split("@", 1)[0]).strip()[:100]
        user = User(google_sub=claims["sub"], email=email, full_name=full_name)
        db.add(user)
    else:
        user.email = email

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        user = db.query(User).filter(User.google_sub == claims["sub"]).first()
        if user is None:
            raise HTTPException(status_code=409, detail="Could not create user account")
    db.refresh(user)
    return {"access_token": create_user_token(user.id), "token_type": "bearer", "expires_in": 43200}


@router.post("/admin/google")
def admin_google_login(credentials: GoogleAdminLogin):
    if not all((settings.ADMIN_USERNAME, settings.ADMIN_TOKEN_SECRET,
                settings.GOOGLE_CLIENT_ID, settings.ADMIN_GOOGLE_EMAIL)):
        raise HTTPException(status_code=503, detail="Google admin sign-in is not configured")

    claims = verify_google_credential(credentials.credential)

    google_email = claims.get("email", "")
    allowed_email = settings.ADMIN_GOOGLE_EMAIL.strip()
    if not isinstance(google_email, str) or claims.get("email_verified") is not True or not hmac.compare_digest(
        google_email.casefold().encode(), allowed_email.casefold().encode()
    ):
        raise HTTPException(status_code=403, detail="This Google account is not authorized as an admin")

    return {"access_token": create_admin_token(), "token_type": "bearer", "expires_in": 43200}
