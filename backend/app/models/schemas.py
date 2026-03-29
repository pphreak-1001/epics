from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime

class UserBase(BaseModel):
    phone_number: str
    full_name: str
    role: str # 'worker' or 'employer'

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    phone_number: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class WorkerProfile(BaseModel):
    area: str
    district: str
    state: str
    job_type: str
    expected_wage: float
    skills: List[str] = []

class JobCreate(BaseModel):
    title: str
    description: str
    wage: float
    location: str
    skills_required: List[str] = []

class Job(JobCreate):
    id: str
    employer_id: str
    posted_at: datetime

class Match(BaseModel):
    job_id: str
    worker_id: str
    score: float
    matched_at: datetime
