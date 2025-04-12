from sqlalchemy import Column, Integer, String, ForeignKey, Boolean,Text,DateTime, Table
from sqlalchemy.orm import relationship
from ..database import Base



class Venue(Base):
    __tablename__ = "venues"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    location = Column(String)
    capacity = Column(Integer)
    events = relationship("Event", back_populates="venue")