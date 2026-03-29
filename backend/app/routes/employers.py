from fastapi import APIRouter, HTTPException, Depends
from app.models.schemas import JobCreate
from app.auth import get_current_user
from app.database import get_database
from datetime import datetime
import uuid

router = APIRouter(prefix="/api/jobs", tags=["jobs"])

@router.post("")
async def create_job(job: JobCreate, user_id: str = Depends(get_current_user)):
    db = await get_database()
    user = await db.users.find_one({"user_id": user_id})
    if user["role"] != "employer":
        raise HTTPException(status_code=403, detail="Only employers can post jobs")
    
    job_id = str(uuid.uuid4())
    job_doc = {
        "job_id": job_id,
        "employer_id": user_id,
        "title": job.title,
        "job_type": job.job_type,
        "description": job.description,
        "village": job.village,
        "district": job.district,
        "state": job.state,
        "daily_wage_offered": job.daily_wage_offered,
        "contact_number": job.contact_number,
        "required_skills": job.required_skills,
        "status": "active",
        "created_at": datetime.utcnow()
    }
    
    await db.jobs.insert_one(job_doc)
    return {"message": "Job posted successfully", "job_id": job_id}

@router.get("/my-jobs")
async def get_my_jobs(user_id: str = Depends(get_current_user)):
    db = await get_database()
    jobs = await db.jobs.find({"employer_id": user_id}).sort("created_at", -1).to_list(100)
    
    result = []
    for job in jobs:
        job.pop("_id", None)
        match_count = await db.matches.count_documents({"job_id": job["job_id"]})
        job["match_count"] = match_count
        result.append(job)
    
    return result

@router.get("/{job_id}/matches")
async def get_job_matches(job_id: str, user_id: str = Depends(get_current_user)):
    db = await get_database()
    job = await db.jobs.find_one({"job_id": job_id, "employer_id": user_id})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found or unauthorized")
    
    matches = await db.matches.find({"job_id": job_id}).sort("match_score", -1).to_list(100)
    
    result = []
    for match in matches:
        worker = await db.workers.find_one({"worker_id": match["worker_id"]})
        if worker:
            worker.pop("_id", None)
            match.pop("_id", None)
            result.append({"match": match, "worker": worker})
            
    return result
