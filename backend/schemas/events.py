from  pydantic import BaseModel
from datetime import datetime,date
from datetime import date,time

class CreateEvent(BaseModel):
    name:str
    description:str
    date:date 
    start_time:time
    end_time:time
    venue_id: int  

    model_config = {"from_attributes": True}

class EventDetails(BaseModel):
    id:int
    name:str
    description:str
    date:date 
    start_time:time
    end_time:time
    venue: "ShowVenue"  # String reference (make sure ShowVenue exists!)
    host: "ShowUser"  # String reference
    participants: list["ShowUser"] = []
    volunteers: list["ShowUser"] = []
#    is_active:bool
    
    model_config = {"from_attributes": True}

class ShowEvent(BaseModel):
    id:int
    name:str
    date:date
    start_time:time
    end_time:time
    
    
    model_config = {"from_attributes": True}

from .users import ShowUser
from .venues import ShowVenue
