from pydantic import BaseModel

class ShowVenue(BaseModel):
    id:int
    name:str
    capacity:int
    location:str
    model_config = {"from_attributes": True}

class VenueDetails(BaseModel):
    id:int
    name:str
    location:str
    capacity:int
    events: list["ShowEvent"] = []

    model_config = {"from_attributes": True}

class CreateVenue(BaseModel):
    name:str
    location:str
    capacity:int

from .events import ShowEvent
