from enum import Enum


class TipoPino(str, Enum):
    A_PE = "a_pe"
    BICICLETA = "bicicleta"
    MOTO = "moto"
    JIPE = "jipe"
    ESCALADA = "escalada"
    AQUATICA = "aquatica"
    QUADRICICLO = "quadriciclo"
    CAVALO = "cavalo"
    MISTA = "mista"


class TipoAtencao(str, Enum):
    DESMORONAMENTO = "desmoronamento"
    PONTO_INTRANSPONIVEL = "ponto_intransponivel"
    ALAGAMENTO = "alagamento"
    PROPRIEDADE_PRIVADA = "propriedade_privada"
    PERIGO = "perigo"
    ASSALTO = "assalto"
    QUEIMADA = "queimada"


class TipoVeiculo(str, Enum):
    CARRO = "carro"
    MOTO = "moto"
    JIPE = "jipe"
    TENIS = "tenis"
    BICICLETA = "bicicleta"
    OUTROS = "outros"


class TipoVoto(str, Enum):
    POSITIVO = "positivo"
    NEGATIVO = "negativo"
