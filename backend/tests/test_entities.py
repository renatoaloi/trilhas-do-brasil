import uuid

import pytest

from src.domain.entities import Comment, Pivot, User, Vehicle
from src.domain.enums import TipoVeiculo


def test_user_validate_ok():
    u = User(id=uuid.uuid4(), email="a@b.com", password_hash="x", nome="Ana")
    u.validate()


def test_user_invalid_email():
    u = User(id=uuid.uuid4(), email="x", password_hash="x", nome="Ana")
    with pytest.raises(ValueError):
        u.validate()


def test_pivot_validate_lat():
    p = Pivot(id=uuid.uuid4(), user_id=uuid.uuid4(), nome="Trilha", latitude=100, longitude=0)
    with pytest.raises(ValueError):
        p.validate()


def test_pivot_reputacao():
    p = Pivot(id=uuid.uuid4(), user_id=uuid.uuid4(), nome="T", latitude=0, longitude=0)
    p.votos_positivos = 5
    p.votos_negativos = 0
    assert p.reputacao_cor == "verde"


def test_vehicle_validate():
    v = Vehicle(id=uuid.uuid4(), user_id=uuid.uuid4(), marca="", modelo="X", tipo=TipoVeiculo.MOTO)
    with pytest.raises(ValueError):
        v.validate()


def test_comment_validate():
    c = Comment(id=uuid.uuid4(), pivot_id=uuid.uuid4(), user_id=uuid.uuid4(), texto="")
    with pytest.raises(ValueError):
        c.validate()
