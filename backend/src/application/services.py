import math
import uuid
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy import and_, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.application.schemas import (
    AttentionPointCreate,
    CommentCreate,
    OfflineDownloadRequest,
    PasswordUpdateRequest,
    PivotCreate,
    PivotUpdate,
    ProfileUpdate,
    RegisterRequest,
    VehicleCreate,
    VehicleUpdate,
    VoteRequest,
)
from src.domain.enums import TipoPino, TipoVoto
from src.infrastructure.models import (
    AttentionPointModel,
    CommentModel,
    PivotModel,
    ProfileModel,
    UserModel,
    VehicleModel,
    VoteModel,
)
from src.infrastructure.security import create_access_token, hash_password, verify_password


def _pivot_response_data(pivot: PivotModel) -> dict:
    pos = sum(1 for v in (pivot.votes or []) if v.tipo == TipoVoto.POSITIVO.value)
    neg = sum(1 for v in (pivot.votes or []) if v.tipo == TipoVoto.NEGATIVO.value)
    score = pos - neg
    total = pos + neg
    if total == 0:
        cor = "neutro"
    elif score >= 3:
        cor = "verde"
    elif score <= -3:
        cor = "vermelho"
    elif score > 0:
        cor = "verde_claro"
    elif score < 0:
        cor = "laranja"
    else:
        cor = "neutro"
    return {
        "id": pivot.id,
        "user_id": pivot.user_id,
        "nome": pivot.nome,
        "descricao": pivot.descricao,
        "latitude": pivot.latitude,
        "longitude": pivot.longitude,
        "foto": pivot.foto,
        "tipo": pivot.tipo,
        "regiao": pivot.regiao,
        "votos_positivos": pos,
        "votos_negativos": neg,
        "reputacao_score": score,
        "reputacao_cor": cor,
        "created_at": pivot.created_at,
    }


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    r = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlmb = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dlmb / 2) ** 2
    return 2 * r * math.asin(math.sqrt(a))


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def register(self, data: RegisterRequest) -> UserModel:
        existing = await self.db.execute(select(UserModel).where(UserModel.email == data.email.lower()))
        if existing.scalar_one_or_none():
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email já cadastrado")

        user = UserModel(
            id=uuid.uuid4(),
            email=data.email.lower(),
            password_hash=hash_password(data.password),
            nome=data.nome.strip(),
            ativo=True,
        )
        self.db.add(user)
        profile = ProfileModel(id=uuid.uuid4(), user_id=user.id)
        self.db.add(profile)
        await self.db.flush()
        await self.db.refresh(user)
        return user

    async def login(self, email: str, password: str) -> str:
        result = await self.db.execute(select(UserModel).where(UserModel.email == email.lower()))
        user = result.scalar_one_or_none()
        if user is None or not verify_password(password, user.password_hash):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciais inválidas")
        if not user.ativo:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuário inativo")
        return create_access_token(user.id, user.email)

    async def update_password(self, user: UserModel, data: PasswordUpdateRequest) -> None:
        if data.nova_senha != data.confirmar_senha:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Senhas não conferem")
        user.password_hash = hash_password(data.nova_senha)
        await self.db.flush()


class ProfileService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_mine(self, user: UserModel) -> dict:
        result = await self.db.execute(select(ProfileModel).where(ProfileModel.user_id == user.id))
        profile = result.scalar_one_or_none()
        if profile is None:
            profile = ProfileModel(id=uuid.uuid4(), user_id=user.id)
            self.db.add(profile)
            await self.db.flush()
            await self.db.refresh(profile)
        return {
            "id": profile.id,
            "user_id": profile.user_id,
            "avatar": profile.avatar,
            "biografia": profile.biografia,
            "interesses": profile.interesses,
            "data_aniversario": profile.data_aniversario,
            "nome": user.nome,
            "email": user.email,
        }

    async def update_mine(self, user: UserModel, data: ProfileUpdate) -> dict:
        result = await self.db.execute(select(ProfileModel).where(ProfileModel.user_id == user.id))
        profile = result.scalar_one_or_none()
        if profile is None:
            profile = ProfileModel(id=uuid.uuid4(), user_id=user.id)
            self.db.add(profile)
        if data.biografia is not None:
            profile.biografia = data.biografia
        if data.interesses is not None:
            profile.interesses = data.interesses
        if data.data_aniversario is not None:
            profile.data_aniversario = data.data_aniversario
        await self.db.flush()
        return await self.get_mine(user)

    async def set_avatar(self, user: UserModel, path: str) -> dict:
        result = await self.db.execute(select(ProfileModel).where(ProfileModel.user_id == user.id))
        profile = result.scalar_one_or_none()
        if profile is None:
            profile = ProfileModel(id=uuid.uuid4(), user_id=user.id)
            self.db.add(profile)
        profile.avatar = path
        await self.db.flush()
        return await self.get_mine(user)


class VehicleService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_mine(self, user: UserModel) -> list[VehicleModel]:
        result = await self.db.execute(
            select(VehicleModel).where(VehicleModel.user_id == user.id).order_by(VehicleModel.created_at.desc())
        )
        return list(result.scalars().all())

    async def create(self, user: UserModel, data: VehicleCreate) -> VehicleModel:
        vehicle = VehicleModel(
            id=uuid.uuid4(),
            user_id=user.id,
            marca=data.marca.strip(),
            modelo=data.modelo.strip(),
            descricao=data.descricao,
            tipo=data.tipo.value,
        )
        self.db.add(vehicle)
        await self.db.flush()
        await self.db.refresh(vehicle)
        return vehicle

    async def update(self, user: UserModel, vehicle_id: uuid.UUID, data: VehicleUpdate) -> VehicleModel:
        vehicle = await self._get_owned(user, vehicle_id)
        if data.marca is not None:
            vehicle.marca = data.marca.strip()
        if data.modelo is not None:
            vehicle.modelo = data.modelo.strip()
        if data.descricao is not None:
            vehicle.descricao = data.descricao
        if data.tipo is not None:
            vehicle.tipo = data.tipo.value
        await self.db.flush()
        await self.db.refresh(vehicle)
        return vehicle

    async def delete(self, user: UserModel, vehicle_id: uuid.UUID) -> None:
        vehicle = await self._get_owned(user, vehicle_id)
        await self.db.delete(vehicle)
        await self.db.flush()

    async def _get_owned(self, user: UserModel, vehicle_id: uuid.UUID) -> VehicleModel:
        result = await self.db.execute(select(VehicleModel).where(VehicleModel.id == vehicle_id))
        vehicle = result.scalar_one_or_none()
        if vehicle is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Veículo não encontrado")
        if vehicle.user_id != user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Sem permissão")
        return vehicle


class PivotService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def _load_pivot(self, pivot_id: uuid.UUID) -> PivotModel:
        result = await self.db.execute(
            select(PivotModel)
            .options(selectinload(PivotModel.votes), selectinload(PivotModel.comments))
            .where(PivotModel.id == pivot_id)
        )
        pivot = result.scalar_one_or_none()
        if pivot is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pino não encontrado")
        return pivot

    async def list_all(
        self,
        q: Optional[str] = None,
        regiao: Optional[str] = None,
        tipo: Optional[TipoPino] = None,
        min_lat: Optional[float] = None,
        max_lat: Optional[float] = None,
        min_lng: Optional[float] = None,
        max_lng: Optional[float] = None,
    ) -> list[dict]:
        stmt = select(PivotModel).options(selectinload(PivotModel.votes))
        filters = []
        if q:
            like = f"%{q}%"
            filters.append(or_(PivotModel.nome.ilike(like), PivotModel.regiao.ilike(like)))
        if regiao:
            filters.append(PivotModel.regiao.ilike(f"%{regiao}%"))
        if tipo:
            filters.append(PivotModel.tipo == tipo.value)
        if None not in (min_lat, max_lat, min_lng, max_lng):
            filters.append(
                and_(
                    PivotModel.latitude >= min_lat,
                    PivotModel.latitude <= max_lat,
                    PivotModel.longitude >= min_lng,
                    PivotModel.longitude <= max_lng,
                )
            )
        if filters:
            stmt = stmt.where(and_(*filters))
        stmt = stmt.order_by(PivotModel.created_at.desc())
        result = await self.db.execute(stmt)
        return [_pivot_response_data(p) for p in result.scalars().all()]

    async def get(self, pivot_id: uuid.UUID) -> dict:
        pivot = await self._load_pivot(pivot_id)
        return _pivot_response_data(pivot)

    async def create(self, user: UserModel, data: PivotCreate) -> dict:
        pivot = PivotModel(
            id=uuid.uuid4(),
            user_id=user.id,
            nome=data.nome.strip(),
            descricao=data.descricao,
            latitude=data.latitude,
            longitude=data.longitude,
            tipo=data.tipo.value,
            regiao=data.regiao,
        )
        self.db.add(pivot)
        await self.db.flush()
        pivot = await self._load_pivot(pivot.id)
        return _pivot_response_data(pivot)

    async def update(self, user: UserModel, pivot_id: uuid.UUID, data: PivotUpdate) -> dict:
        pivot = await self._load_pivot(pivot_id)
        if pivot.user_id != user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Sem permissão")
        if data.nome is not None:
            pivot.nome = data.nome.strip()
        if data.descricao is not None:
            pivot.descricao = data.descricao
        if data.latitude is not None:
            pivot.latitude = data.latitude
        if data.longitude is not None:
            pivot.longitude = data.longitude
        if data.tipo is not None:
            pivot.tipo = data.tipo.value
        if data.regiao is not None:
            pivot.regiao = data.regiao
        await self.db.flush()
        pivot = await self._load_pivot(pivot_id)
        return _pivot_response_data(pivot)

    async def delete(self, user: UserModel, pivot_id: uuid.UUID) -> None:
        pivot = await self._load_pivot(pivot_id)
        if pivot.user_id != user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Sem permissão")
        await self.db.delete(pivot)
        await self.db.flush()

    async def set_foto(self, user: UserModel, pivot_id: uuid.UUID, path: str) -> dict:
        pivot = await self._load_pivot(pivot_id)
        if pivot.user_id != user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Sem permissão")
        pivot.foto = path
        await self.db.flush()
        pivot = await self._load_pivot(pivot_id)
        return _pivot_response_data(pivot)

    async def vote(self, user: UserModel, pivot_id: uuid.UUID, data: VoteRequest) -> dict:
        pivot = await self._load_pivot(pivot_id)
        result = await self.db.execute(
            select(VoteModel).where(and_(VoteModel.pivot_id == pivot_id, VoteModel.user_id == user.id))
        )
        existing = result.scalar_one_or_none()
        if existing:
            existing.tipo = data.tipo.value
        else:
            self.db.add(
                VoteModel(id=uuid.uuid4(), pivot_id=pivot_id, user_id=user.id, tipo=data.tipo.value)
            )
        await self.db.flush()
        self.db.expire(pivot, ["votes"])
        pivot = await self._load_pivot(pivot_id)
        return _pivot_response_data(pivot)

    async def add_comment(self, user: UserModel, pivot_id: uuid.UUID, data: CommentCreate) -> dict:
        await self._load_pivot(pivot_id)
        comment = CommentModel(
            id=uuid.uuid4(),
            pivot_id=pivot_id,
            user_id=user.id,
            texto=data.texto.strip(),
        )
        self.db.add(comment)
        await self.db.flush()
        return {
            "id": comment.id,
            "pivot_id": comment.pivot_id,
            "user_id": comment.user_id,
            "texto": comment.texto,
            "autor_nome": user.nome,
            "created_at": comment.created_at,
        }

    async def list_comments(self, pivot_id: uuid.UUID) -> list[dict]:
        await self._load_pivot(pivot_id)
        result = await self.db.execute(
            select(CommentModel, UserModel.nome)
            .join(UserModel, UserModel.id == CommentModel.user_id)
            .where(CommentModel.pivot_id == pivot_id)
            .order_by(CommentModel.created_at.desc())
        )
        items = []
        for comment, nome in result.all():
            items.append(
                {
                    "id": comment.id,
                    "pivot_id": comment.pivot_id,
                    "user_id": comment.user_id,
                    "texto": comment.texto,
                    "autor_nome": nome,
                    "created_at": comment.created_at,
                }
            )
        return items

    async def add_attention(self, user: UserModel, pivot_id: uuid.UUID, data: AttentionPointCreate) -> AttentionPointModel:
        await self._load_pivot(pivot_id)
        point = AttentionPointModel(
            id=uuid.uuid4(),
            pivot_id=pivot_id,
            user_id=user.id,
            nome=data.nome.strip(),
            descricao=data.descricao,
            tipo=data.tipo.value,
        )
        self.db.add(point)
        await self.db.flush()
        await self.db.refresh(point)
        return point

    async def list_attention(self, pivot_id: uuid.UUID) -> list[AttentionPointModel]:
        await self._load_pivot(pivot_id)
        result = await self.db.execute(
            select(AttentionPointModel)
            .where(AttentionPointModel.pivot_id == pivot_id)
            .order_by(AttentionPointModel.created_at.desc())
        )
        return list(result.scalars().all())

    async def offline_download(self, data: OfflineDownloadRequest) -> list[dict]:
        # Bounding box pre-filter then haversine
        deg = data.raio_km / 111.0
        stmt = (
            select(PivotModel)
            .options(selectinload(PivotModel.votes), selectinload(PivotModel.attention_points))
            .where(
                and_(
                    PivotModel.latitude.between(data.latitude - deg, data.latitude + deg),
                    PivotModel.longitude.between(data.longitude - deg, data.longitude + deg),
                )
            )
        )
        result = await self.db.execute(stmt)
        pivots = []
        for p in result.scalars().all():
            dist = haversine_km(data.latitude, data.longitude, p.latitude, p.longitude)
            if dist <= data.raio_km:
                item = _pivot_response_data(p)
                item["distancia_km"] = round(dist, 2)
                item["pontos_atencao"] = [
                    {
                        "id": a.id,
                        "pivot_id": a.pivot_id,
                        "user_id": a.user_id,
                        "nome": a.nome,
                        "descricao": a.descricao,
                        "tipo": a.tipo,
                        "created_at": a.created_at,
                    }
                    for a in (p.attention_points or [])
                ]
                pivots.append(item)
        pivots.sort(key=lambda x: x["distancia_km"])
        return pivots
