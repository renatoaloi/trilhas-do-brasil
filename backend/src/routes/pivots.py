from typing import List
from fastapi import APIRouter, Depends, status
from src.application.dto import PivotCreate, PivotResponse, MessageResponse
from src.application.services import PivotService
from src.application.dependencies import (
    get_pivot_service,
    get_current_user,
)
from src.domain.entities import User

router = APIRouter(prefix="/pivots", tags=["pivots"])


@router.get("/trail/{trail_id}", response_model=List[PivotResponse])
async def list_pivots(
    trail_id: str,
    pivot_service: PivotService = Depends(get_pivot_service),
    current_user: User = Depends(get_current_user),
):
    return pivot_service.get_by_trail(trail_id)


@router.post(
    "",
    response_model=PivotResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_pivot(
    data: PivotCreate,
    pivot_service: PivotService = Depends(get_pivot_service),
    current_user: User = Depends(get_current_user),
):
    return pivot_service.create(data, str(current_user.id))


@router.delete(
    "/{pivot_id}",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
)
async def delete_pivot(
    pivot_id: str,
    pivot_service: PivotService = Depends(get_pivot_service),
    current_user: User = Depends(get_current_user),
):
    pivot_service.delete(pivot_id, str(current_user.id))
    return MessageResponse(mensagem="Pivot excluído com sucesso")
