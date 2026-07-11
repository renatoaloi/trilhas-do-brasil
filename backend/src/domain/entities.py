import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Float, Text, ForeignKey, Enum, Uuid
from sqlalchemy.orm import relationship


def _enum_values(enum_type):
    return [e.value for e in enum_type]
from src.infrastructure.database import Base
from src.domain.enums import TrailTypeEnum, PivotTypeEnum, DificuldadeEnum, CondicoesEnum


class User(Base):
    __tablename__ = "users"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    nome = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    ativo = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    profile = relationship("Profile", back_populates="user", uselist=False)
    trails = relationship("Trail", back_populates="creator")
    pivots = relationship("Pivot", back_populates="user")


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id = Column(Uuid, ForeignKey("users.id"), nullable=False, unique=True)
    avatar = Column(Text, nullable=True)
    biografia = Column(Text, nullable=True)
    interesses_pessoais = Column(Text, nullable=True)
    data_aniversario = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="profile")


class TrailType(Base):
    __tablename__ = "trail_types"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    nome = Column(Enum(TrailTypeEnum, values_callable=_enum_values), nullable=False, unique=True)

    trails = relationship("Trail", back_populates="trail_type")


class Trail(Base):
    __tablename__ = "trails"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    nome = Column(String(255), nullable=False)
    nome_social = Column(String(255), nullable=True)
    trail_type_id = Column(Uuid, ForeignKey("trail_types.id"), nullable=False)
    descricao = Column(Text, nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    dificuldade = Column(Enum(DificuldadeEnum, values_callable=_enum_values), nullable=False, default=DificuldadeEnum.MODERADO)
    distancia_km = Column(Float, nullable=True)
    elevacao_m = Column(Float, nullable=True)
    duracao_estimada = Column(String(50), nullable=True)
    condicoes = Column(Enum(CondicoesEnum, values_callable=_enum_values), nullable=False, default=CondicoesEnum.ABERTA)
    created_by = Column(Uuid, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    trail_type = relationship("TrailType", back_populates="trails")
    creator = relationship("User", back_populates="trails")
    pivots = relationship("Pivot", back_populates="trail")


class PivotType(Base):
    __tablename__ = "pivot_types"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    nome = Column(Enum(PivotTypeEnum, values_callable=_enum_values), nullable=False, unique=True)

    pivots = relationship("Pivot", back_populates="pivot_type")


class Pivot(Base):
    __tablename__ = "pivots"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    trail_id = Column(Uuid, ForeignKey("trails.id"), nullable=False)
    user_id = Column(Uuid, ForeignKey("users.id"), nullable=False)
    pivot_type_id = Column(Uuid, ForeignKey("pivot_types.id"), nullable=False)
    descricao = Column(Text, nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    trail = relationship("Trail", back_populates="pivots")
    user = relationship("User", back_populates="pivots")
    pivot_type = relationship("PivotType", back_populates="pivots")
    media = relationship("PivotMedia", back_populates="pivot")


class PivotMedia(Base):
    __tablename__ = "pivot_media"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    pivot_id = Column(Uuid, ForeignKey("pivots.id"), nullable=False)
    url = Column(Text, nullable=False)
    tipo = Column(String(20), nullable=False, default="imagem")

    pivot = relationship("Pivot", back_populates="media")
