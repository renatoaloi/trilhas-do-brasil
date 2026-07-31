import uuid
from pathlib import Path

from fastapi import HTTPException, UploadFile, status

from src.infrastructure.config import get_settings

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_UPLOAD_BYTES = 5 * 1024 * 1024


async def save_upload(entity_id: uuid.UUID, file: UploadFile, subfolder: str = "files") -> str:
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tipo de arquivo não permitido. Use JPEG, PNG, WEBP ou GIF.",
        )

    content = await file.read()
    if len(content) > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Arquivo excede o limite de 5 MB",
        )

    settings = get_settings()
    base = Path(settings.storage_path) / str(entity_id) / subfolder
    base.mkdir(parents=True, exist_ok=True)

    ext = Path(file.filename or "upload.jpg").suffix.lower() or ".jpg"
    if ext not in {".jpg", ".jpeg", ".png", ".webp", ".gif"}:
        ext = ".jpg"
    name = f"{uuid.uuid4().hex}{ext}"
    dest = base / name
    dest.write_bytes(content)
    return f"{entity_id}/{subfolder}/{name}"


def resolve_storage_path(relative: str) -> Path:
    settings = get_settings()
    path = Path(settings.storage_path) / relative
    if not path.exists() or not path.is_file():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Arquivo não encontrado")
    return path
