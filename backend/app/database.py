import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = "gramin_rozgar"

class Database:
    client: AsyncIOMotorClient = None
    db = None

db = Database()

async def get_database():
    if db.client is None:
        db.client = AsyncIOMotorClient(MONGO_URL)
        db.db = db.client[DB_NAME]
    return db.db

async def close_database():
    if db.client:
        db.client.close()
        db.client = None
        db.db = None
