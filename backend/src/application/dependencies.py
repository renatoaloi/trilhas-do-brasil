from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from src.infrastructure.database import get_db
from src.infrastructure.repositories import (
    UserRepository,
    TrailRepository,
    PivotRepository,
    ProfileRepository,
    PivotTypeRepository,
    TrailTypeRepository,
)
from src.application.services import (
    AuthService,
    TrailService,
    PivotService,
    ProfileService,
)
from src.infrastructure.security import decode_access_token
from src.domain.entities import User

security_scheme = HTTPBearer()


def get_user_repo(db: Session = Depends(get_db)) -> UserRepository:
    return UserRepository(db)


def get_trail_repo(db: Session = Depends(get_db)) -> TrailRepository:
    return TrailRepository(db)


def get_pivot_repo(db: Session = Depends(get_db)) -> PivotRepository:
    return PivotRepository(db)


def get_profile_repo(db: Session = Depends(get_db)) -> ProfileRepository:
    return ProfileRepository(db)


def get_auth_service(
    repo: UserRepository = Depends(get_user_repo),
) -> AuthService:
    return AuthService(repo)


def get_trail_service(
    repo: TrailRepository = Depends(get_trail_repo),
) -> TrailService:
    return TrailService(repo)


def get_pivot_service(
    repo: PivotRepository = Depends(get_pivot_repo),
) -> PivotService:
    return PivotService(repo)


def get_profile_service(
    repo: ProfileRepository = Depends(get_profile_repo),
) -> ProfileService:
    return ProfileService(repo)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
    db: Session = Depends(get_db),
) -> User:
    token = credentials.credentials
    try:
        payload = decode_access_token(token)
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=401, detail="Token inválido"
            )
    except Exception:
        raise HTTPException(
            status_code=401, detail="Token inválido ou expirado"
        )
    repo = UserRepository(db)
    user = repo.get_by_id(user_id)
    if user is None or not user.ativo:
        raise HTTPException(
            status_code=401, detail="Usuário não encontrado ou inativo"
        )
    return user
