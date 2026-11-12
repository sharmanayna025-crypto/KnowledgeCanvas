"""Validates the JWT issued by the Spring backend (HS256, subject = email)."""
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.config import AUTH_REQUIRED, JWT_SECRET

_bearer = HTTPBearer(auto_error=False)

LOCAL_USER = "local@documind.dev"


def current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> str:
    if not AUTH_REQUIRED:
        return LOCAL_USER

    if credentials is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Sign in to use documents.")

    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED, "Your session has expired. Sign in again."
        )
    except jwt.PyJWTError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid session token.")

    email = payload.get("sub")
    if not email:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid session token.")
    return email
