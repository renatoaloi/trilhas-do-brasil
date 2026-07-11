from abc import ABC, abstractmethod
from typing import Optional, List
from uuid import UUID
from src.domain.entities import User, Trail, Pivot, Profile, PivotType, TrailType


class UserRepository(ABC):
    @abstractmethod
    async def get_by_id(self, user_id: str) -> Optional[User]: ...

    @abstractmethod
    async def get_by_email(self, email: str) -> Optional[User]: ...

    @abstractmethod
    async def create(self, user: User) -> User: ...

    @abstractmethod
    async def update(self, user: User) -> User: ...


class TrailRepository(ABC):
    @abstractmethod
    async def get_by_id(self, trail_id: str) -> Optional[Trail]: ...

    @abstractmethod
    async def get_all(self, skip: int = 0, limit: int = 100) -> List[Trail]: ...

    @abstractmethod
    async def get_by_name(self, name: str) -> List[Trail]: ...

    @abstractmethod
    async def get_by_region(self, latitude: float, longitude: float, radius_km: float = 50) -> List[Trail]: ...

    @abstractmethod
    async def create(self, trail: Trail) -> Trail: ...

    @abstractmethod
    async def update(self, trail: Trail) -> Trail: ...

    @abstractmethod
    async def delete(self, trail_id: str) -> None: ...


class PivotRepository(ABC):
    @abstractmethod
    async def get_by_id(self, pivot_id: str) -> Optional[Pivot]: ...

    @abstractmethod
    async def get_by_trail(self, trail_id: str) -> List[Pivot]: ...

    @abstractmethod
    async def create(self, pivot: Pivot) -> Pivot: ...

    @abstractmethod
    async def delete(self, pivot_id: str) -> None: ...


class ProfileRepository(ABC):
    @abstractmethod
    async def get_by_user_id(self, user_id: str) -> Optional[Profile]: ...

    @abstractmethod
    async def create(self, profile: Profile) -> Profile: ...

    @abstractmethod
    async def update(self, profile: Profile) -> Profile: ...


class PivotTypeRepository(ABC):
    @abstractmethod
    async def get_all(self) -> List[PivotType]: ...

    @abstractmethod
    async def get_by_id(self, pivot_type_id: str) -> Optional[PivotType]: ...


class TrailTypeRepository(ABC):
    @abstractmethod
    async def get_all(self) -> List[TrailType]: ...

    @abstractmethod
    async def get_by_id(self, trail_type_id: str) -> Optional[TrailType]: ...
