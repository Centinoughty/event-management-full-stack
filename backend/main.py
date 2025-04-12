from fastapi import FastAPI
from .database import engine
from .routers import users, events,venues
from . import models

from fastapi.middleware.cors import CORSMiddleware

models.Base.metadata.create_all(bind=engine)


app = FastAPI()

origins=[
    '*'
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(events.router)
app.include_router(venues.router)

if __name__== "main":
    import uvicorn
    uvicorn.run("main.app",host="0.0.0.0",port=8000,reload=True)