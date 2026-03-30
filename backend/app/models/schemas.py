from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


# ── Auth ──────────────────────────────────────────────────────────────────────

class UserRegister(BaseModel):
    name: str
    phone_number: str
    password: str
    role: str                       # 'worker' or 'employer'
    language: str = "hi"

class UserLogin(BaseModel):
    phone_number: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str


# ── Worker ───────────────────────────────────────────────────────────────────

class WorkerProfile(BaseModel):
    name: str
    phone_number: str
    area: str
    district: str
    state: str
    job_type: str
    expected_daily_wage: float
    skills: List[str] = []
    language: str = "hi"
    kyc_status: Optional[str] = "pending"  # 'pending' or 'verified'

class KYCSubmit(BaseModel):
    selfie_image: str  # Base64
    id_card_image: str # Base64


# ── Jobs & Reviews ───────────────────────────────────────────────────────────

class JobCreate(BaseModel):
    title: str
    job_type: str
    description: str
    village: str
    district: str
    state: str
    daily_wage_offered: float
    contact_number: str
    required_skills: List[str] = []

class JobUpdate(BaseModel):
    status: str # 'active', 'in_progress', 'completed'

class ReviewCreate(BaseModel):
    job_id: str
    rating: int # 1 to 5
    comment: str
    target_user_id: str # The person being reviewed


# ── Chatbot ──────────────────────────────────────────────────────────────────

class ChatbotMessage(BaseModel):
    session_id: str
    message: str
    language: str = "hi"
    mode: str = "registration" # 'registration' or 'help'
