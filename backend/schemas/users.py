from pydantic import BaseModel

class ShowUser(BaseModel):
    id:int
    name:str
    email:str

    model_config = {"from_attributes": True}

class UserDetails(BaseModel):
    id:int
    name:str
    email:str
    is_admin:bool
    events_participating: list["ShowEvent"] = []
    events_volunteering: list["ShowEvent"] = []
    events_hosting: list["ShowEvent"] = []

    model_config = {"from_attributes": True}


class UserLogin(BaseModel):
    email:str  
    password:str

class UserRegister(BaseModel):
    name:str
    email:str  
    password:str

from .events import ShowEvent
