from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, File, Query, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession

from src.application.schemas import (
    AttentionPointCreate,
    AttentionPointResponse,
    CommentCreate,
    CommentResponse,
    LoginRequest,
    MessageResponse,
    OfflineDownloadRequest,
    PasswordUpdateRequest,
    PivotCreate,
    PivotResponse,
    PivotUpdate,
    ProfileResponse,
    ProfileUpdate,
    RegisterRequest,
    TokenResponse,
    UserPublic,
    VehicleCreate,
    VehicleResponse,
    VehicleUpdate,
    VoteRequest,
)
from src.application.services import AuthService, PivotService, ProfileService, VehicleService
from src.domain.enums import TipoPino
from src.infrastructure.database import get_db
from src.infrastructure.models import UserModel
from src.infrastructure.security import get_current_user, get_current_user_optional
from src.infrastructure.storage import resolve_storage_path, save_upload

router = APIRouter()
auth_router = APIRouter(prefix="/auth", tags=["auth"])
protected = APIRouter(dependencies=[Depends(get_current_user)])


@router.get("/health")
async def health():
    return {"status": "ok"}


@auth_router.post("/register", response_model=UserPublic, status_code=201)
async def register(data: RegisterRequest, db: AsyncSession = Depends(get_db)):
    user = await AuthService(db).register(data)
    return user


@auth_router.post("/token", response_model=TokenResponse)
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    token = await AuthService(db).login(data.email, data.password)
    return TokenResponse(access_token=token)


@auth_router.put("/password", response_model=MessageResponse)
async def update_password(
    data: PasswordUpdateRequest,
    user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await AuthService(db).update_password(user, data)
    return MessageResponse(mensagem="Senha alterada com sucesso")


@protected.get("/me", response_model=UserPublic, tags=["auth"])
async def me(user: UserModel = Depends(get_current_user)):
    return user


@protected.get("/perfil", response_model=ProfileResponse, tags=["perfil"])
async def get_perfil(user: UserModel = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await ProfileService(db).get_mine(user)


@protected.put("/perfil", response_model=ProfileResponse, tags=["perfil"])
async def update_perfil(
    data: ProfileUpdate,
    user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await ProfileService(db).update_mine(user, data)


@protected.post("/perfil/avatar", response_model=ProfileResponse, tags=["perfil"])
async def upload_avatar(
    file: UploadFile = File(...),
    user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    path = await save_upload(user.id, file, "avatar")
    return await ProfileService(db).set_avatar(user, path)


@protected.get("/veiculos", response_model=list[VehicleResponse], tags=["veiculos"])
async def list_veiculos(user: UserModel = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await VehicleService(db).list_mine(user)


@protected.post("/veiculos", response_model=VehicleResponse, status_code=201, tags=["veiculos"])
async def create_veiculo(
    data: VehicleCreate,
    user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await VehicleService(db).create(user, data)


@protected.put("/veiculos/{vehicle_id}", response_model=VehicleResponse, tags=["veiculos"])
async def update_veiculo(
    vehicle_id: UUID,
    data: VehicleUpdate,
    user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await VehicleService(db).update(user, vehicle_id, data)


@protected.delete("/veiculos/{vehicle_id}", status_code=204, tags=["veiculos"])
async def delete_veiculo(
    vehicle_id: UUID,
    user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await VehicleService(db).delete(user, vehicle_id)


@protected.post("/veiculos/{vehicle_id}/foto", response_model=VehicleResponse, tags=["veiculos"])
async def upload_vehicle_foto(
    vehicle_id: UUID,
    file: UploadFile = File(...),
    user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    path = await save_upload(vehicle_id, file, "foto")
    return await VehicleService(db).set_foto(user, vehicle_id, path)


@protected.get("/pivots", response_model=list[PivotResponse], tags=["pivots"])
async def list_pivots(
    q: Optional[str] = Query(default=None),
    regiao: Optional[str] = Query(default=None),
    tipo: Optional[TipoPino] = Query(default=None),
    min_lat: Optional[float] = Query(default=None),
    max_lat: Optional[float] = Query(default=None),
    min_lng: Optional[float] = Query(default=None),
    max_lng: Optional[float] = Query(default=None),
    user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    _ = user
    return await PivotService(db).list_all(q, regiao, tipo, min_lat, max_lat, min_lng, max_lng)


@protected.post("/pivots", response_model=PivotResponse, status_code=201, tags=["pivots"])
async def create_pivot(
    data: PivotCreate,
    user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await PivotService(db).create(user, data)


@protected.post("/pivots/offline", tags=["pivots"])
async def offline_download(
    data: OfflineDownloadRequest,
    user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    _ = user
    return await PivotService(db).offline_download(data)


@protected.get("/pivots/{pivot_id}", response_model=PivotResponse, tags=["pivots"])
async def get_pivot(
    pivot_id: UUID,
    user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    _ = user
    return await PivotService(db).get(pivot_id)


@protected.put("/pivots/{pivot_id}", response_model=PivotResponse, tags=["pivots"])
async def update_pivot(
    pivot_id: UUID,
    data: PivotUpdate,
    user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await PivotService(db).update(user, pivot_id, data)


@protected.delete("/pivots/{pivot_id}", status_code=204, tags=["pivots"])
async def delete_pivot(
    pivot_id: UUID,
    user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await PivotService(db).delete(user, pivot_id)


@protected.post("/pivots/{pivot_id}/foto", response_model=PivotResponse, tags=["pivots"])
async def upload_pivot_foto(
    pivot_id: UUID,
    file: UploadFile = File(...),
    user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    path = await save_upload(pivot_id, file, "foto")
    return await PivotService(db).set_foto(user, pivot_id, path)


@protected.post("/pivots/{pivot_id}/votos", response_model=PivotResponse, tags=["pivots"])
async def vote_pivot(
    pivot_id: UUID,
    data: VoteRequest,
    user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await PivotService(db).vote(user, pivot_id, data)


@protected.get("/pivots/{pivot_id}/comentarios", response_model=list[CommentResponse], tags=["pivots"])
async def list_comments(
    pivot_id: UUID,
    user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    _ = user
    return await PivotService(db).list_comments(pivot_id)


@protected.post(
    "/pivots/{pivot_id}/comentarios",
    response_model=CommentResponse,
    status_code=201,
    tags=["pivots"],
)
async def add_comment(
    pivot_id: UUID,
    data: CommentCreate,
    user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await PivotService(db).add_comment(user, pivot_id, data)


@protected.get(
    "/pivots/{pivot_id}/atencao",
    response_model=list[AttentionPointResponse],
    tags=["pivots"],
)
async def list_attention(
    pivot_id: UUID,
    user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    _ = user
    return await PivotService(db).list_attention(pivot_id)


@protected.post(
    "/pivots/{pivot_id}/atencao",
    response_model=AttentionPointResponse,
    status_code=201,
    tags=["pivots"],
)
async def add_attention(
    pivot_id: UUID,
    data: AttentionPointCreate,
    user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await PivotService(db).add_attention(user, pivot_id, data)


@router.get("/files/{path:path}", tags=["files"])
async def get_file(
    path: str,
    token: Optional[str] = Query(default=None),
    db: AsyncSession = Depends(get_db),
    user: UserModel | None = Depends(get_current_user_optional),
):
    if user is None and token:
        from src.infrastructure.security import decode_token
        from sqlalchemy import select
        from src.infrastructure.models import UserModel as UM

        payload = decode_token(token)
        sub = payload.get("sub")
        if sub:
            result = await db.execute(select(UM).where(UM.id == UUID(sub)))
            user = result.scalar_one_or_none()
    if user is None or not user.ativo:
        from fastapi import HTTPException, status

        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Não autenticado")
    file_path = resolve_storage_path(path)
    return FileResponse(file_path)
