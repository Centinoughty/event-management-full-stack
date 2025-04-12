from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session

from ..schemas.venues import VenueDetails,ShowVenue,CreateVenue
from ..models.venues import Venue
from ..models.users import User
from ..database import get_db

from ..security.oauth2 import get_current_user

router = APIRouter(
    prefix="/api/venues",
    tags=["Venues"]
)

get_db = get_db


@router.post("/create",response_model=ShowVenue)
def create_venue(request:CreateVenue, db:Session=Depends(get_db), current_user: User=Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to perform this action")
    new_venue = Venue(**request.model_dump())
    db.add(new_venue)
    db.commit()
    db.refresh(new_venue)
    return new_venue

@router.get("/all", response_model=list[ShowVenue])
def get_all_venues(db:Session=Depends(get_db), current_user: User=Depends(get_current_user)):
    venues = db.query(Venue).all()
    return venues
    
@router.get("/{id}", response_model=ShowVenue)
def get_venue(id:int, db:Session=Depends(get_db), current_user: User=Depends(get_current_user)):
    venue = db.query(Venue).filter(Venue.id==id).first()
    if not venue:
        raise HTTPException(status_code=404, detail="Venue not found")
    return venue

@router.put("/update/{id}", response_model=ShowVenue)
def update_venue(id:int, request:CreateVenue, db:Session=Depends(get_db), current_user: User=Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to perform this action")
    venue = db.query(Venue).filter(Venue.id==id).first()
    if not venue:
        raise HTTPException(status_code=404, detail="Venue not found")
    
    for key, value in request.model_dump().items():
        setattr(venue, key, value)
    
    db.commit()
    db.refresh(venue)
    return venue

@router.delete("/delete/{id}")
def delete_venue(id:int, db:Session=Depends(get_db), current_user: User=Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to perform this action")
    venue = db.query(Venue).filter(Venue.id==id).first()
    if not venue:
        raise HTTPException(status_code=404, detail="Venue not found")
    
    db.delete(venue)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)