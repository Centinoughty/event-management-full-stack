from pydantic import BaseModel


class Token(BaseModel):
    id:int
    name: str
    email: str
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: str = None