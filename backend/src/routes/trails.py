from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from src.application.dto import TrailCreate, TrailResponse, MessageResponse
from src.application.services import TrailService
from src.application.dependencies import (
    get_trail_service,
    get_current_user,
)
from src.domain.entities import User

router = APIRouter(prefix="/trails", tags=["trails"])


@router.get("", response_model=List[TrailResponse])
async def list_trails(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    trail_service: TrailService = Depends(get_trail_service),
    current_user: User = Depends(get_current_user),
):
    return trail_service.get_all(skip=skip, limit=limit)


@router.get("/search", response_model=List[TrailResponse])
async def search_trails(
    q: str = Query("", description="Nome da trilha"),
    latitude: Optional[float] = Query(None),
    longitude: Optional[float] = Query(None),
    radius_km: float = Query(50),
    trail_service: TrailService = Depends(get_trail_service),
    current_user: User = Depends(get_current_user),
):
    if latitude is not None and longitude is not None:
        return trail_service.search_by_region(
            latitude, longitude, radius_km
        )
    if q:
        return trail_service.search(q)
    return trail_service.get_all()


@router.get("/{trail_id}", response_model=TrailResponse)
async def get_trail(
    trail_id: str,
    trail_service: TrailService = Depends(get_trail_service),
    current_user: User = Depends(get_current_user),
):
    return trail_service.get_by_id(trail_id)


@router.post(
    "",
    response_model=TrailResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_trail(
    data: TrailCreate,
    trail_service: TrailService = Depends(get_trail_service),
    current_user: User = Depends(get_current_user),
):
    return trail_service.create(data, str(current_user.id))


@router.put("/{trail_id}", response_model=TrailResponse)
async def update_trail(
    trail_id: str,
    data: TrailCreate,
    trail_service: TrailService = Depends(get_trail_service),
    current_user: User = Depends(get_current_user),
):
    return trail_service.update(trail_id, data, str(current_user.id))


@router.delete(
    "/{trail_id}",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
)
async def delete_trail(
    trail_id: str,
    trail_service: TrailService = Depends(get_trail_service),
    current_user: User = Depends(get_current_user),
):
    trail_service.delete(trail_id, str(current_user.id))
    return MessageResponse(mensagem="Trilha excluída com sucesso")
