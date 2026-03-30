import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.routes import auth, workers, employers, chatbot, audio
from app.services.matching import run_matching_engine
from app.database import get_database, close_database

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="GraminRozgar API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(workers.router)
app.include_router(employers.router)
app.include_router(chatbot.router)
app.include_router(audio.router)

# Scheduler for matching engine
scheduler = AsyncIOScheduler()
scheduler.add_job(run_matching_engine, 'interval', minutes=5)

@app.on_event("startup")
async def startup_event():
    await get_database()
    scheduler.start()
    logger.info("Scheduler started")

@app.on_event("shutdown")
async def shutdown_event():
    await close_database()
    scheduler.shutdown()
    logger.info("Scheduler shut down")

@app.get("/")
async def root():
    return {"message": "Welcome to GraminRozgar API"}
