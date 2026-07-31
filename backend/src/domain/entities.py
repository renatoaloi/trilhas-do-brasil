from dataclasses import dataclass, field
from datetime import date, datetime
from typing import Optional
from uuid import UUID

from src.domain.enums import TipoAtencao, TipoPino, TipoVeiculo, TipoVoto


@dataclass
class User:
    id: UUID
    email: str
    password_hash: str
    nome: str
    ativo: bool = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    def validate(self) -> None:
        if not self.email or "@" not in self.email:
            raise ValueError("Email inválido")
        if not self.nome or len(self.nome.strip()) < 2:
            raise ValueError("Nome deve ter ao menos 2 caracteres")
        if not self.password_hash:
            raise ValueError("Senha é obrigatória")


@dataclass
class Profile:
    id: UUID
    user_id: UUID
    avatar: Optional[str] = None
    biografia: Optional[str] = None
    interesses: Optional[str] = None
    data_aniversario: Optional[date] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


@dataclass
class Vehicle:
    id: UUID
    user_id: UUID
    marca: str
    modelo: str
    descricao: Optional[str] = None
    tipo: TipoVeiculo = TipoVeiculo.OUTROS
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    def validate(self) -> None:
        if not self.marca or not self.marca.strip():
            raise ValueError("Marca é obrigatória")
        if not self.modelo or not self.modelo.strip():
            raise ValueError("Modelo é obrigatório")


@dataclass
class Pivot:
    id: UUID
    user_id: UUID
    nome: str
    descricao: Optional[str] = None
    latitude: float = 0.0
    longitude: float = 0.0
    foto: Optional[str] = None
    tipo: TipoPino = TipoPino.A_PE
    regiao: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    votos_positivos: int = 0
    votos_negativos: int = 0

    def validate(self) -> None:
        if not self.nome or not self.nome.strip():
            raise ValueError("Nome do pino é obrigatório")
        if not (-90 <= self.latitude <= 90):
            raise ValueError("Latitude inválida")
        if not (-180 <= self.longitude <= 180):
            raise ValueError("Longitude inválida")

    @property
    def reputacao_score(self) -> int:
        return self.votos_positivos - self.votos_negativos

    @property
    def reputacao_cor(self) -> str:
        score = self.reputacao_score
        total = self.votos_positivos + self.votos_negativos
        if total == 0:
            return "neutro"
        if score >= 3:
            return "verde"
        if score <= -3:
            return "vermelho"
        if score > 0:
            return "verde_claro"
        if score < 0:
            return "laranja"
        return "neutro"


@dataclass
class AttentionPoint:
    id: UUID
    pivot_id: UUID
    user_id: UUID
    nome: str
    descricao: Optional[str] = None
    tipo: TipoAtencao = TipoAtencao.PERIGO
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    def validate(self) -> None:
        if not self.nome or not self.nome.strip():
            raise ValueError("Nome do ponto de atenção é obrigatório")


@dataclass
class Vote:
    id: UUID
    pivot_id: UUID
    user_id: UUID
    tipo: TipoVoto
    created_at: Optional[datetime] = None


@dataclass
class Comment:
    id: UUID
    pivot_id: UUID
    user_id: UUID
    texto: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    autor_nome: Optional[str] = field(default=None)

    def validate(self) -> None:
        if not self.texto or not self.texto.strip():
            raise ValueError("Comentário não pode ser vazio")
        if len(self.texto) > 2000:
            raise ValueError("Comentário muito longo")
