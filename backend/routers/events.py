from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.orm import Session

from ..schemas.events import EventDetails, ShowEvent, CreateEvent
from ..schemas.users import ShowUser
from ..models.events import Event
from ..models.users import User
from ..models.venues import Venue
from ..database import get_db

from ..security.oauth2 import get_current_user

from datetime import datetime, date

router = APIRouter(
    prefix="/api/events",
    tags=["Events"]
)

get_db = get_db

@router.post("/create",response_model=ShowEvent)
def create_event(request:CreateEvent, db:Session=Depends(get_db), current_user: User=Depends(get_current_user)):
    new_event = Event(**request.model_dump(), host_id=current_user.id)
    current_user.hosted_by.append(new_event)
    db.add(new_event)
    db.commit()
    db.refresh(new_event)
    return new_event

@router.put("/update/{id}",response_model=ShowEvent)
def update_event(id:int,request:CreateEvent, db:Session=Depends(get_db), current_user: User=Depends(get_current_user)):
    event = db.query(Event).filter(Event.id==id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    if event.host_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this event")

    for key, value in request.model_dump().items():
        setattr(event, key, value)

    event.status="Pending"
    db.commit()
    db.refresh(event)
    return event

@router.delete("/delete/{id}")
def delete_event(id:int, db:Session=Depends(get_db), current_user: User=Depends(get_current_user)):
    event = db.query(Event).filter(Event.id==id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    if event.host_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to delete this event")

    db.delete(event)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)

@router.get("/details/{id}",response_model=ShowEvent)
def show_event(id:int,db:Session=Depends(get_db),current_user: User=Depends(get_current_user)):
    event=db.query(Event).filter(Event.id==id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event

@router.get("/all", response_model=list[ShowEvent])
def get_all_events(db:Session=Depends(get_db), current_user: User=Depends(get_current_user)):
    events = db.query(Event).filter(Event.status=="Confirmed").all()
    return events


@router.get("/hosted", response_model=list[ShowEvent])
def events_hosted(db:Session=Depends(get_db), current_user: User=Depends(get_current_user)):
    
    return current_user.hosted_by

@router.get("/upcoming_participant", response_model=list[ShowEvent])
def events_to_attend(db:Session=Depends(get_db), current_user: User=Depends(get_current_user)):
    
    today=date.today()
    upcoming_events= [
        event for event in current_user.participating_events
        if event.date.date() >today or (event.date == today and event.start_time > datetime.now().time()) 
    ]

    return current_user.participating_events

@router.get("/volunteered", response_model=list[ShowEvent])
def volunteering_events(db:Session=Depends(get_db), current_user: User=Depends(get_current_user)):
    
    return current_user.volunteering_events

@router.get("/attended", response_model=list[ShowEvent])
def attended_events(db:Session=Depends(get_db), current_user: User=Depends(get_current_user)):
    
    return current_user.present

@router.post("/register_participant/{id}", response_model=ShowEvent)
def reg_participant(id:int, db:Session=Depends(get_db), current_user: User=Depends(get_current_user)):
    event = db.query(Event).filter(Event.id==id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    if current_user in event.registered_participants:
        raise HTTPException(status_code=400, detail="Already registered")
    venue_id=event.venue_id
    venue=db.query(Venue).filter(Venue.id==venue_id).first()
    if event.participants_no >= venue.capacity:
        raise HTTPException(status_code=400, detail="Event is full")
    event.participants_no+=1

    event.registered_participants.append(current_user)
    db.commit()
    db.refresh(event)   
    return event


@router.post("/register_volunteer/{id}", response_model=ShowEvent)
def reg_volunteer(id:int, db:Session=Depends(get_db), current_user: User=Depends(get_current_user)):
    event = db.query(Event).filter(Event.id==id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    event.registered_volunteers.append(current_user)
    db.commit()
    db.refresh(event)   
    return event

@router.get("/participant_list/{id}", response_model=list[ShowUser])
def get_participants(id: int, db: Session = Depends(get_db),current_user: User = Depends(get_current_user)):
    
    event=db.query(Event).filter(Event.id==id).first()

    if not event:
        raise HTTPException(status_code=404, detail="User or event not found")

    volunteers=event.registered_volunteers
    if not current_user.id == event.host_id and current_user not in volunteers:
        raise HTTPException(status_code=403, detail="Not authorized to view participants")
    
    participants=event.registered_participants
    return participants
    


@router.post("/{event_id}/attendance/{user_id}")
def mark_attendance(event_id: int, user_id: int, db: Session = Depends(get_db),current_user: User = Depends(get_current_user)):

    attendee = db.query(User).filter(User.id == user_id).first()
    event = db.query(Event).filter(Event.id == event_id).first()

    volunteers=event.registered_volunteers

    if not attendee or not event:
        raise HTTPException(status_code=404, detail="User or event not found")

    if attendee not in event.registered_participants:
        raise HTTPException(status_code=400, detail="User is not registered for the event")

    if not event.host_id == current_user.id and current_user not in volunteers:
        raise HTTPException(status_code=403, detail="Not authorized to mark attendance")

    if attendee in event.attendees:
        return {"message": "User already marked as attended"}

    event.attendees.append(attendee)  # This adds the link in attendance table
    db.commit()

    return {"message": f"User {attendee.name} marked as attended for event {event.name}"}

# ADMIN ONLY

@router.get("/pending", response_model=list[ShowEvent])
def get_pending_events(db:Session=Depends(get_db),current_user:User=Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to view pending events")
    events = db.query(Event).filter(Event.status=="Pending").all()
    return events

@router.get("/availability/{id}")
def check_availability(id:int,db:Session=Depends(get_db),current_user:User=Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to view pending events")
    
    event =db.query(Event).filter(Event.id==id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    date=event.date
    start_time=event.start_time
    end_time=event.end_time
    venue_id=event.venue_id
    venue=db.query(Venue).filter(Venue.id==venue_id).first()
    if not venue:
        raise HTTPException(status_code=404, detail="Venue not found")
    
    conflicting_events= db.query(Event).filter(
        Event.venue_id==venue_id,
        Event.date==date,
        Event.start_time<end_time,
        Event.end_time>start_time,
        Event.status=="Confirmed"   
    ).all()

    if conflicting_events:
        return { "status_code":400,
            "message": "Another event taking place!"
            } 
    return {"status_code":200,
        "message": "Slot available!"
        } 


@router.post("/approve/{id}",response_model=ShowEvent)
async def approve_event(id:int,request:Request, db:Session=Depends(get_db),current_user:User=Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to approve events")

    event =db.query(Event).filter(Event.id==id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    avaiability=check_availability(id,db,current_user)

    if avaiability["status_code"]==400:
        raise HTTPException(status_code=400, detail="Another event taking place!")
    
    request_data= await request.json()
    status=request_data.get("status")
    if(status=="Confirmed"):
        event.status="Confirmed"
    elif(status=="Rejected"):   
        event.status="Rejected"

    db.commit()
    db.refresh(event)
    return event
