from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, ConfigDict
from uuid import UUID


class UserCreate(BaseModel):
    nome: str
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: UUID
    nome: str
    email: str
    ativo: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class PasswordChangeRequest(BaseModel):
    nova_senha: str
    confirmar_senha: str


class ProfileCreate(BaseModel):
    avatar: Optional[str] = None
    biografia: Optional[str] = None
    interesses_pessoais: Optional[str] = None
    data_aniversario: Optional[datetime] = None


class ProfileResponse(BaseModel):
    id: UUID
    user_id: UUID
    avatar: Optional[str] = None
    biografia: Optional[str] = None
    interesses_pessoais: Optional[str] = None
    data_aniversario: Optional[datetime] = None
    user: Optional[UserResponse] = None

    model_config = ConfigDict(from_attributes=True)


class TrailCreate(BaseModel):
    nome: str
    nome_social: Optional[str] = None
    trail_type_id: UUID
    descricao: Optional[str] = None
    latitude: float
    longitude: float
    dificuldade: str = "moderado"
    distancia_km: Optional[float] = None
    elevacao_m: Optional[float] = None
    duracao_estimada: Optional[str] = None
    condicoes: str = "aberta"


class TrailResponse(BaseModel):
    id: UUID
    nome: str
    nome_social: Optional[str] = None
    trail_type_id: UUID
    descricao: Optional[str] = None
    latitude: float
    longitude: float
    dificuldade: str
    distancia_km: Optional[float] = None
    elevacao_m: Optional[float] = None
    duracao_estimada: Optional[str] = None
    condicoes: str
    created_by: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class PivotCreate(BaseModel):
    trail_id: UUID
    pivot_type_id: UUID
    descricao: Optional[str] = None
    latitude: float
    longitude: float


class PivotResponse(BaseModel):
    id: UUID
    trail_id: UUID
    user_id: UUID
    pivot_type_id: UUID
    descricao: Optional[str] = None
    latitude: float
    longitude: float
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class PivotTypeResponse(BaseModel):
    id: UUID
    nome: str

    model_config = ConfigDict(from_attributes=True)


class TrailTypeResponse(BaseModel):
    id: UUID
    nome: str

    model_config = ConfigDict(from_attributes=True)


class MessageResponse(BaseModel):
    mensagem: str
