from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from app.db import engine, Base
from app.auth.router import router as auth_router

app = FastAPI()

app.include_router(auth_router)

app.mount("/static", StaticFiles(directory="app/static"), name="static")

@app.on_event("startup")
async def startup_event():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)