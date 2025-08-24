from fastapi import APIRouter
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import HTMLResponse
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from passlib.context import CryptContext
from fastapi.templating import Jinja2Templates

from app.auth.utils import get_user, get_current_user, create_access_token, authenticate_user
from app.db import get_db
from app.models.user import User
from app.auth.schemas import RegisterSchema, LoginSchema


router = APIRouter(tags=['auth'])


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
templates = Jinja2Templates(directory="app/templates")




@router.get('/', response_class=HTMLResponse)
async def homepage(request: Request):
    return templates.TemplateResponse('homepage.html', {'request': request})

@router.get('/register', response_class=HTMLResponse)
async def register_page(request: Request):
    return templates.TemplateResponse('register.html', {'request': request})

@router.get('/login', response_class=HTMLResponse)
async def login_page(request: Request):
    return templates.TemplateResponse('login.html', {'request': request})


@router.post("/register")
async def register(data: RegisterSchema, db: AsyncSession = Depends(get_db)):
    if data.password != data.confirm_password:
        raise HTTPException(status_code=400, detail="The passwords do not match")
    
    if await get_user(db, data.email):
        raise HTTPException(status_code=400, detail="Email is already registered")
    
    hashed_password = pwd_context.hash(data.password)
    new_user = User(
        username=data.username,
        email=data.email,
        hashed_password=hashed_password
    )
    
    db.add(new_user)
    await db.commit()
    
    token = create_access_token({"sub": new_user.email})
    response = RedirectResponse(url="/me", status_code=302)
    response.set_cookie("Authorization", token, httponly=True, max_age=1800)
    return response

@router.post("/login")
async def login(data: LoginSchema, db: AsyncSession = Depends(get_db)):
    user = await authenticate_user(db, data.email, data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect data")
    
    token = create_access_token({"sub": user.email})
    response = RedirectResponse(url="/me", status_code=302)
    response.set_cookie("Authorization", token, httponly=True, max_age=1800)
    return response

@router.get("/logout")
async def logout():
    response = RedirectResponse(url="/", status_code=302)
    response.delete_cookie("Authorization")
    return response

@router.get("/me")
async def get_me(request: Request, current_user: User = Depends(get_current_user)):
    return templates.TemplateResponse('me.html', {'request': request, "username": current_user.username, "email": current_user.email}) 