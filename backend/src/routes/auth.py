from fastapi import APIRouter, Depends, status, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from src.application.dto import (
    UserCreate,
    UserResponse,
    TokenResponse,
    LoginRequest,
    PasswordChangeRequest,
    MessageResponse,
)
from src.application.services import AuthService
from src.application.dependencies import (
    get_auth_service,
    get_current_user,
)
from src.domain.entities import User

router = APIRouter(prefix="/auth", tags=["auth"])
limiter = Limiter(key_func=get_remote_address)


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
@limiter.limit("5/minute")
async def register(
    request: Request,
    data: UserCreate,
    auth_service: AuthService = Depends(get_auth_service),
):
    return auth_service.register(data)


@router.post("/token", response_model=TokenResponse)
@limiter.limit("10/minute")
async def token(
    request: Request,
    data: LoginRequest,
    auth_service: AuthService = Depends(get_auth_service),
):
    return auth_service.login(data)


@router.put("/password", response_model=MessageResponse)
async def change_password(
    data: PasswordChangeRequest,
    current_user: User = Depends(get_current_user),
    auth_service: AuthService = Depends(get_auth_service),
):
    return auth_service.change_password(current_user, data)
