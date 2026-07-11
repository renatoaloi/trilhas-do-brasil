import uuid
from typing import List, Optional
from fastapi import HTTPException, status
from src.infrastructure.repositories import (
    UserRepository,
    TrailRepository,
    PivotRepository,
    ProfileRepository,
)
from src.domain.entities import (
    User,
    Trail,
    Pivot,
    Profile,
    PivotType,
    TrailType,
)
from src.domain.enums import DificuldadeEnum, CondicoesEnum
from src.infrastructure.security import (
    hash_password,
    verify_password,
    create_access_token,
)
from src.application.dto import (
    UserCreate,
    LoginRequest,
    PasswordChangeRequest,
    TrailCreate,
    PivotCreate,
    ProfileCreate,
)


class AuthService:
    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo

    def register(self, data: UserCreate) -> User:
        existing = self.user_repo.get_by_email(data.email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email já cadastrado",
            )
        user = User(
            nome=data.nome,
            email=data.email,
            password_hash=hash_password(data.password),
        )
        return self.user_repo.create(user)

    def login(self, data: LoginRequest) -> dict:
        user = self.user_repo.get_by_email(data.email)
        if not user or not verify_password(data.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email ou senha inválidos",
            )
        if not user.ativo:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuário inativo",
            )
        token = create_access_token(str(user.id), user.email)
        return {"access_token": token, "token_type": "bearer"}

    def change_password(
        self, user: User, data: PasswordChangeRequest
    ) -> dict:
        if data.nova_senha != data.confirmar_senha:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Senhas não conferem",
            )
        user.password_hash = hash_password(data.nova_senha)
        self.user_repo.update(user)
        return {"mensagem": "Senha alterada com sucesso"}


class TrailService:
    def __init__(self, trail_repo: TrailRepository):
        self.trail_repo = trail_repo

    def get_all(self, skip: int = 0, limit: int = 100) -> List[Trail]:
        return self.trail_repo.get_all(skip=skip, limit=limit)

    def get_by_id(self, trail_id: str) -> Trail:
        trail = self.trail_repo.get_by_id(trail_id)
        if not trail:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Trilha não encontrada",
            )
        return trail

    def search(self, q: str) -> List[Trail]:
        return self.trail_repo.get_by_name(q)

    def search_by_region(
        self, latitude: float, longitude: float, radius_km: float = 50
    ) -> List[Trail]:
        return self.trail_repo.get_by_region(latitude, longitude, radius_km)

    def _parse_dificuldade(self, value: str) -> DificuldadeEnum:
        for member in DificuldadeEnum:
            if member.value == value or member.name == value:
                return member
        return DificuldadeEnum.MODERADO

    def _parse_condicoes(self, value: str) -> CondicoesEnum:
        for member in CondicoesEnum:
            if member.value == value or member.name == value:
                return member
        return CondicoesEnum.ABERTA

    def create(self, data: TrailCreate, user_id: str) -> Trail:
        trail = Trail(
            nome=data.nome,
            nome_social=data.nome_social,
            trail_type_id=uuid.UUID(data.trail_type_id) if isinstance(data.trail_type_id, str) else data.trail_type_id,
            descricao=data.descricao,
            latitude=data.latitude,
            longitude=data.longitude,
            dificuldade=self._parse_dificuldade(data.dificuldade),
            distancia_km=data.distancia_km,
            elevacao_m=data.elevacao_m,
            duracao_estimada=data.duracao_estimada,
            condicoes=self._parse_condicoes(data.condicoes),
            created_by=uuid.UUID(user_id) if isinstance(user_id, str) else user_id,
        )
        return self.trail_repo.create(trail)

    def update(self, trail_id: str, data: TrailCreate, user_id: str) -> Trail:
        trail = self.get_by_id(trail_id)
        if str(trail.created_by) != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Você não tem permissão para editar esta trilha",
            )
        trail.nome = data.nome
        trail.nome_social = data.nome_social
        trail.trail_type_id = uuid.UUID(data.trail_type_id) if isinstance(data.trail_type_id, str) else data.trail_type_id
        trail.descricao = data.descricao
        trail.latitude = data.latitude
        trail.longitude = data.longitude
        trail.dificuldade = self._parse_dificuldade(data.dificuldade)
        trail.distancia_km = data.distancia_km
        trail.elevacao_m = data.elevacao_m
        trail.duracao_estimada = data.duracao_estimada
        trail.condicoes = self._parse_condicoes(data.condicoes)
        return self.trail_repo.update(trail)

    def delete(self, trail_id: str, user_id: str) -> None:
        trail = self.get_by_id(trail_id)
        if str(trail.created_by) != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Você não tem permissão para excluir esta trilha",
            )
        self.trail_repo.delete(trail_id)


class PivotService:
    def __init__(self, pivot_repo: PivotRepository):
        self.pivot_repo = pivot_repo

    def get_by_trail(self, trail_id: str) -> List[Pivot]:
        return self.pivot_repo.get_by_trail(trail_id)

    def create(self, data: PivotCreate, user_id: str) -> Pivot:
        pivot = Pivot(
            trail_id=uuid.UUID(data.trail_id) if isinstance(data.trail_id, str) else data.trail_id,
            user_id=uuid.UUID(user_id) if isinstance(user_id, str) else user_id,
            pivot_type_id=uuid.UUID(data.pivot_type_id) if isinstance(data.pivot_type_id, str) else data.pivot_type_id,
            descricao=data.descricao,
            latitude=data.latitude,
            longitude=data.longitude,
        )
        return self.pivot_repo.create(pivot)

    def delete(self, pivot_id: str, user_id: str) -> None:
        pivot = self.pivot_repo.get_by_id(pivot_id)
        if not pivot:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pivot não encontrado",
            )
        if str(pivot.user_id) != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Você não tem permissão para excluir este pivot",
            )
        self.pivot_repo.delete(pivot_id)


class ProfileService:
    def __init__(self, profile_repo: ProfileRepository):
        self.profile_repo = profile_repo

    def get_by_user_id(self, user_id: str) -> Optional[Profile]:
        profile = self.profile_repo.get_by_user_id(user_id)
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Perfil não encontrado",
            )
        return profile

    def upsert(self, user_id: str, data: ProfileCreate) -> Profile:
        existing = self.profile_repo.get_by_user_id(user_id)
        if existing:
            existing.avatar = data.avatar
            existing.biografia = data.biografia
            existing.interesses_pessoais = data.interesses_pessoais
            existing.data_aniversario = data.data_aniversario
            return self.profile_repo.update(existing)
        profile = Profile(
            user_id=uuid.UUID(user_id) if isinstance(user_id, str) else user_id,
            avatar=data.avatar,
            biografia=data.biografia,
            interesses_pessoais=data.interesses_pessoais,
            data_aniversario=data.data_aniversario,
        )
        return self.profile_repo.create(profile)
