from fastapi import APIRouter, HTTPException, Depends
from app.models.schemas import WorkerProfile, KYCSubmit
from app.auth import get_current_user
from app.database import get_database
from app.services.ai import translate_text
from datetime import datetime
import uuid

router = APIRouter(prefix="/api/workers", tags=["workers"])

@router.post("/kyc-submit")
async def submit_kyc(kyc: KYCSubmit, user: dict = Depends(get_current_user)):
    db = await get_database()
    # In this simulation, we accept any image and mark as verified
    await db.users.update_one(
        {"user_id": user["user_id"]},
        {"$set": {"kyc_status": "verified"}}
    )
    return {"message": "KYC submitted and verified successfully"}

@router.get("/kyc-status")
async def get_kyc_status(user: dict = Depends(get_current_user)):
    db = await get_database()
    user_doc = await db.users.find_one({"user_id": user["user_id"]})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    return {"status": user_doc.get("kyc_status", "pending")}

@router.post("/profile")
async def create_profile(profile: WorkerProfile, user: dict = Depends(get_current_user)):
    db = await get_database()
    user_doc = await db.users.find_one({"user_id": user["user_id"]})
    if user_doc["role"] != "worker":
        raise HTTPException(status_code=403, detail="Only workers can create profiles")
    
    existing_profile = await db.workers.find_one({"user_id": user["user_id"]})
    if existing_profile:
        raise HTTPException(status_code=400, detail="Profile already exists")
    
    profile_doc = {
        "worker_id": str(uuid.uuid4()),
        "user_id": user["user_id"],
        "name": profile.name,
        "phone_number": profile.phone_number,
        "area": profile.area,
        "district": profile.district,
        "state": profile.state,
        "job_type": profile.job_type,
        "expected_daily_wage": profile.expected_daily_wage,
        "skills": profile.skills,
        "language": profile.language,
        "created_at": datetime.utcnow()
    }
    
    await db.workers.insert_one(profile_doc)
    return {"message": "Profile created successfully"}

@router.get("/profile")
async def get_profile(user: dict = Depends(get_current_user)):
    db = await get_database()
    profile = await db.workers.find_one({"user_id": user["user_id"]})
    if not profile:
        return None
    profile.pop("_id", None)
    return profile

@router.get("/matches")
async def get_matches(user: dict = Depends(get_current_user)):
    db = await get_database()
    worker = await db.workers.find_one({"user_id": user["user_id"]})
    if not worker:
        raise HTTPException(status_code=404, detail="Worker profile not found")
    
    worker_lang = worker.get("language", "hi")
    matches = await db.matches.find({"worker_id": worker["worker_id"], "status": "pending"}).sort("match_score", -1).to_list(50)
    
    result = []
    for match in matches:
        job = await db.jobs.find_one({"job_id": match["job_id"]})
        if job:
            # Calculate match details for badges
            details = {
                "location_match": job["district"].lower() == worker["district"].lower() or job["state"].lower() == worker["state"].lower(),
                "type_match": job["job_type"] == worker["job_type"],
                "wage_match": abs(job["daily_wage_offered"] - worker["expected_daily_wage"]) <= 100,
                "skill_match": False
            }
            
            if job.get("required_skills") and worker.get("skills"):
                job_skills = {s.lower().strip() for s in job["required_skills"]}
                worker_skills = {s.lower().strip() for s in worker["skills"]}
                if job_skills.intersection(worker_skills):
                    details["skill_match"] = True

            # Translate if needed
            if worker_lang != "en":
                job["title"] = await translate_text(job["title"], worker_lang)
                job["description"] = await translate_text(job["description"], worker_lang)

            job.pop("_id", None)
            match.pop("_id", None)
            result.append({
                "match": match, 
                "job": job,
                "match_details": details
            })
            
    return result
