from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field, field_validator

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel

class CamelModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)


class ShipIn(CamelModel): #kaj poslje frontend pri create/update ship
    name: str = Field(min_length=1, max_length=100)
    flag: str = Field(default="Skull & Crossbones", max_length=100)
    cannons: int = Field(ge=0)
    sinking_risk: int = Field(ge=0, le=100)

class Ship(ShipIn): #kaj backedn vrne
    id: UUID
    created_at: datetime
    crew_count: int = 0

class ShipPage(CamelModel): #ena stran ships, in potreben info za gumbe strani
    items: list[Ship]
    total: int
    page: int
    page_size: int

class ShipOption(CamelModel):
    id: UUID
    name: str

# ---------- pirates ----------

class PirateIn(CamelModel): #kaj frontend poslje
    ship_id: UUID
    name: str = Field(min_length=1, max_length=100)
    missing_limbs: int = Field(default=0, ge=0, le=4)
    parrot_name: str | None = Field(default=None, max_length=100)
    rum_per_day: int = Field(ge=0)
    loyalty: int = Field(ge=0, le=100)

    @field_validator("parrot_name")
    @classmethod
    def empty_parrot_is_none(cls, v: str | None) -> str | None:
        """An empty string means 'no parrot' -> store NULL."""
        if v is None:
            return None
        return v.strip() or None


class Pirate(PirateIn):#kaj backend vnre
    id: UUID
    created_at: datetime
    ship_name: str


class PiratePage(CamelModel):
    items: list[Pirate]
    total: int
    page: int
    page_size: int

