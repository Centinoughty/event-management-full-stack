from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session

from ..schemas.token import Token
from ..schemas.users import ShowUser,UserDetails,UserRegister, UserLogin
from ..models.users import User
from ..security.JWTtoken import create_access_token
from ..database import get_db

from passlib.context import CryptContext

from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

from ..security.oauth2 import get_current_user

router =APIRouter(
    prefix="/api",
    tags=["Users"]
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

get_db=get_db

@router.post("/auth/register",response_model=Token)
def register(request:UserRegister,db:Session=Depends(get_db)):
    
    user=db.query(User).filter(User.email==request.email).first()
    if user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    hashed_password = pwd_context.hash(request.password)
    new_user=   User(name=request.name,email=request.email,password=hashed_password)
    new_user.is_admin=False
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    access_token=create_access_token(
        data={"sub":new_user.email}
    )

    return Token(access_token=access_token, token_type="bearer", id=new_user.id, name=new_user.name, email=new_user.email)


@router.post("/auth/login")
def login(request:UserLogin,db:Session=Depends(get_db)):
    user=db.query(User).filter(User.email==request.email).first()
    if not user:
        raise HTTPException(status_code=404,detail=f"Invalid Credentials")
    if not pwd_context.verify(request.password,user.password):  
        raise HTTPException(status_code=404,detail=f"Invalid Credentials")
    
    access_token= create_access_token(
        data={"sub":user.email}
    )

    return Token(access_token=access_token, token_type="bearer", id=user.id, name=user.name, email=user.email)

@router.get("/users/me",response_model=ShowUser)
def get_me(current_user: User=Depends(get_current_user)):
    print (current_user)
    return ShowUser(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email
    )

@router.delete("/users/delete/{id}")
def user_delete(id:int, current_user: User=Depends(get_current_user), db:Session=Depends(get_db)):
    if(current_user.id != id):
        raise HTTPException(status_code=403, detail="You can only delete your own account")
    db.delete(current_user)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
