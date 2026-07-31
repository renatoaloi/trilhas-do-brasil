from datetime import date, datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from src.domain.enums import TipoAtencao, TipoPino, TipoVeiculo, TipoVoto


class RegisterRequest(BaseModel):
    nome: str = Field(min_length=2, max_length=150)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class PasswordUpdateRequest(BaseModel):
    nova_senha: str = Field(min_length=6, max_length=128)
    confirmar_senha: str = Field(min_length=6, max_length=128)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    nome: str
    email: EmailStr


class MessageResponse(BaseModel):
    mensagem: str


class ProfileUpdate(BaseModel):
    biografia: Optional[str] = Field(default=None, max_length=5000)
    interesses: Optional[str] = Field(default=None, max_length=2000)
    data_aniversario: Optional[date] = None


class ProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    avatar: Optional[str] = None
    biografia: Optional[str] = None
    interesses: Optional[str] = None
    data_aniversario: Optional[date] = None
    nome: Optional[str] = None
    email: Optional[str] = None


class VehicleCreate(BaseModel):
    marca: str = Field(min_length=1, max_length=100)
    modelo: str = Field(min_length=1, max_length=100)
    descricao: Optional[str] = Field(default=None, max_length=2000)
    tipo: TipoVeiculo = TipoVeiculo.OUTROS


class VehicleUpdate(BaseModel):
    marca: Optional[str] = Field(default=None, min_length=1, max_length=100)
    modelo: Optional[str] = Field(default=None, min_length=1, max_length=100)
    descricao: Optional[str] = Field(default=None, max_length=2000)
    tipo: Optional[TipoVeiculo] = None


class VehicleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    marca: str
    modelo: str
    descricao: Optional[str] = None
    tipo: str
    created_at: Optional[datetime] = None


class PivotCreate(BaseModel):
    nome: str = Field(min_length=1, max_length=200)
    descricao: Optional[str] = Field(default=None, max_length=10000)
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    tipo: TipoPino = TipoPino.A_PE
    regiao: Optional[str] = Field(default=None, max_length=200)


class PivotUpdate(BaseModel):
    nome: Optional[str] = Field(default=None, min_length=1, max_length=200)
    descricao: Optional[str] = Field(default=None, max_length=10000)
    latitude: Optional[float] = Field(default=None, ge=-90, le=90)
    longitude: Optional[float] = Field(default=None, ge=-180, le=180)
    tipo: Optional[TipoPino] = None
    regiao: Optional[str] = Field(default=None, max_length=200)


class PivotResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    nome: str
    descricao: Optional[str] = None
    latitude: float
    longitude: float
    foto: Optional[str] = None
    tipo: str
    regiao: Optional[str] = None
    votos_positivos: int = 0
    votos_negativos: int = 0
    reputacao_score: int = 0
    reputacao_cor: str = "neutro"
    created_at: Optional[datetime] = None


class AttentionPointCreate(BaseModel):
    nome: str = Field(min_length=1, max_length=200)
    descricao: Optional[str] = Field(default=None, max_length=2000)
    tipo: TipoAtencao = TipoAtencao.PERIGO


class AttentionPointResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    pivot_id: UUID
    user_id: UUID
    nome: str
    descricao: Optional[str] = None
    tipo: str
    created_at: Optional[datetime] = None


class VoteRequest(BaseModel):
    tipo: TipoVoto


class VoteResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    pivot_id: UUID
    user_id: UUID
    tipo: str


class CommentCreate(BaseModel):
    texto: str = Field(min_length=1, max_length=2000)


class CommentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    pivot_id: UUID
    user_id: UUID
    texto: str
    autor_nome: Optional[str] = None
    created_at: Optional[datetime] = None


class OfflineDownloadRequest(BaseModel):
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    raio_km: float = Field(gt=0, le=200)

    @field_validator("raio_km")
    @classmethod
    def validate_radius(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("Raio deve ser positivo")
        return v


class BoundsQuery(BaseModel):
    min_lat: float
    max_lat: float
    min_lng: float
    max_lng: float
    tipo: Optional[TipoPino] = None
