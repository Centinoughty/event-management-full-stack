from sqlalchemy import Column, Integer, String, ForeignKey, Boolean,Text,DateTime, Table, Date,Time
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from ..database import Base

from .associations import participant, volunteer

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    description = Column(Text)
    date = Column(Date)
    start_time = Column(Time)
    end_time = Column(Time)
    venue_id = Column(Integer, ForeignKey("venues.id",ondelete="CASCADE"))
    venue = relationship("Venue", back_populates="events", passive_deletes=True)
    participants_no = Column(Integer,default=0 )
#    is_active = Column(Boolean )

    host_id = Column(Integer, ForeignKey("users.id"))
    host = relationship("User", back_populates="hosted_by")

    registered_participants = relationship("User", secondary=participant, back_populates="participating_events")
    registered_volunteers = relationship("User", secondary=volunteer, back_populates="volunteering_events")
    attendees = relationship("User", secondary="attendance", back_populates="present")

    status= Column(String,default="Pending")
    booking_time= Column(DateTime, default=lambda: datetime.now(timezone.utc))