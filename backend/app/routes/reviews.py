from fastapi import APIRouter, HTTPException, Depends
from app.models.schemas import ReviewCreate, JobUpdate
from app.auth import get_current_user
from app.database import get_database
from datetime import datetime
import uuid

router = APIRouter(prefix="/api/reviews", tags=["reviews"])

@router.post("/job-complete/{job_id}")
async def mark_job_complete(job_id: str, user_id: str = Depends(get_current_user)):
    db = await get_database()
    job = await db.jobs.find_one({"job_id": job_id})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Only the assigned worker or the employer can mark as complete
    # For now, let's assume any worker can mark it if they were 'hired' (simulation)
    await db.jobs.update_one(
        {"job_id": job_id},
        {"$set": {"status": "completed", "completed_at": datetime.utcnow()}}
    )
    return {"message": "Job marked as completed. Please provide a review."}

@router.post("/rate")
async def rate_user(review: ReviewCreate, user_id: str = Depends(get_current_user)):
    db = await get_database()
    
    # Store the review
    review_doc = {
        "review_id": str(uuid.uuid4()),
        "job_id": review.job_id,
        "from_user_id": user_id,
        "to_user_id": review.target_user_id,
        "rating": review.rating,
        "comment": review.comment,
        "created_at": datetime.utcnow()
    }
    await db.reviews.insert_one(review_doc)
    
    # Update target user's rating stats
    target_user = await db.users.find_one({"user_id": review.target_user_id})
    if not target_user:
        raise HTTPException(status_code=404, detail="Target user not found")
    
    # Basic issue detection (simulation)
    issues = []
    comment_lower = review.comment.lower()
    if any(word in comment_lower for word in ["underpaid", "less money", "कम पैसे", "धोखा", "fraud"]):
        issues.append("underpayment/fraud")
    if any(word in comment_lower for word in ["abuse", "bad behavior", "गाली", "बदतमीजी"]):
        issues.append("abusive behavior")
        
    if issues:
        await db.users.update_one(
            {"user_id": review.target_user_id},
            {"$push": {"reported_issues": {"job_id": review.job_id, "issues": issues, "date": datetime.utcnow()}}}
        )

    # Blocking Logic
    # 1. Employer: 5 consecutive poor ratings (rating <= 2)
    # 2. Worker: 10 bad reviews (rating <= 2)
    
    poor_reviews_count = await db.reviews.count_documents({
        "to_user_id": review.target_user_id,
        "rating": {"$lte": 2}
    })
    
    is_blocked = False
    if target_user["role"] == "employer" and poor_reviews_count >= 5:
        is_blocked = True
    elif target_user["role"] == "worker" and poor_reviews_count >= 10:
        is_blocked = True
        
    if is_blocked:
        await db.users.update_one(
            {"user_id": review.target_user_id},
            {"$set": {"is_blocked": True, "blocked_reason": "Multiple poor ratings"}}
        )
        
    return {"message": "Review submitted successfully", "is_target_blocked": is_blocked}

@router.get("/user/{user_id}")
async def get_user_reviews(user_id: str):
    db = await get_database()
    reviews = await db.reviews.find({"to_user_id": user_id}).sort("created_at", -1).to_list(100)
    for r in reviews:
        r.pop("_id", None)
    return reviews
