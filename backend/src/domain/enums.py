import enum


class TrailTypeEnum(str, enum.Enum):
    A_PE = "a pé"
    BICICLETA = "bicicleta"
    MOTO = "moto"
    JIPE = "jipe"
    ESCALADA = "escalada"
    AQUATICA = "aquática"


class PivotTypeEnum(str, enum.Enum):
    FOTOS = "Fotos"
    INFORMACOES = "Informações"
    SEGURANCA = "Segurança"
    DIRECOES = "Direções"


class DificuldadeEnum(str, enum.Enum):
    FACIL = "fácil"
    MODERADO = "moderado"
    DIFICIL = "difícil"
    EXPERT = "expert"


class CondicoesEnum(str, enum.Enum):
    ABERTA = "aberta"
    FECHADA = "fechada"
    PERIGO = "perigo"
    EM_MANUTENCAO = "em manutenção"
