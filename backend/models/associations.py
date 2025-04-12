from sqlalchemy import Column, Integer, String, ForeignKey, Boolean,Text,DateTime, Table
from sqlalchemy.orm import relationship
from ..database import Base


participant = Table('participants', Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id',ondelete="CASCADE")),
    Column('event_id', Integer, ForeignKey('events.id',ondelete="CASCADE"))
)


volunteer = Table('volunteers', Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id',ondelete="CASCADE")),
    Column('event_id', Integer, ForeignKey('events.id',ondelete="CASCADE"))
)

attendance = Table('attendance', Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id',ondelete="CASCADE")),
    Column('event_id', Integer, ForeignKey('events.id',ondelete="CASCADE"))
)