from sqlalchemy import Column, Integer, String, ForeignKey, Boolean,Text,DateTime, Table
from sqlalchemy.orm import relationship
from ..database import Base

from .associations import participant, volunteer,attendance

class User(Base):  
    __tablename__ = "users" 

    id = Column(Integer, primary_key=True, index=True)
    name= Column(String )
    email = Column(String )
    password = Column(String )

    participating_events = relationship("Event", secondary=participant, back_populates="registered_participants")
    volunteering_events = relationship("Event", secondary=volunteer, back_populates="registered_volunteers")
    hosted_by = relationship("Event", back_populates="host")
    present= relationship("Event",secondary=attendance, back_populates="attendees")

    is_admin = Column(Boolean, default=False)