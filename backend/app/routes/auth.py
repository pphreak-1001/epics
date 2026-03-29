from fastapi import APIRouter, HTTPException, Depends, status
from app.models.schemas import UserRegister, UserLogin, Token
from app.auth import get_password_hash, verify_password, create_access_token
from app.database import get_database
from datetime import datetime
import uuid

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/register")
async def register_user(user: UserRegister):
    db = await get_database()
    existing_user = await db.users.find_one({"phone_number": user.phone_number})
    if existing_user:
        raise HTTPException(status_code=400, detail="Phone number already registered")
    
    user_id = str(uuid.uuid4())
    hashed_password = get_password_hash(user.password)
    
    user_doc = {
        "user_id": user_id,
        "name": user.name,
        "phone_number": user.phone_number,
        "password": hashed_password,
        "role": user.role,
        "language": user.language,
        "created_at": datetime.utcnow()
    }
    
    await db.users.insert_one(user_doc)
    token = create_access_token({"user_id": user_id, "role": user.role})
    
    return {"token": token, "user_id": user_id, "role": user.role}

@router.post("/login")
async def login_user(user: UserLogin):
    db = await get_database()
    user_doc = await db.users.find_one({"phone_number": user.phone_number})
    if not user_doc or not verify_password(user.password, user_doc["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token({"user_id": user_doc["user_id"], "role": user_doc["role"]})
    
    return {
        "token": token,
        "user_id": user_doc["user_id"],
        "role": user_doc["role"],
        "name": user_doc["name"]
    }
