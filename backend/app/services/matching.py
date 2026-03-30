import uuid
from datetime import datetime
from typing import List, Dict, Any
import logging
from app.database import get_database

logger = logging.getLogger(__name__)

async def run_matching_engine():
    """
    Cron job that runs periodically to match workers with jobs.
    Simple matching logic: Location (40%), Job type (30%), Wage compatibility (30%).
    """
    logger.info("Running matching engine...")
    db = await get_database()
    
    jobs = await db.jobs.find({"status": "active"}).to_list(1000)
    workers = await db.workers.find({}).to_list(1000)
    
    match_count = 0
    for job in jobs:
        for worker in workers:
            # Check if match already exists
            existing_match = await db.matches.find_one({
                "job_id": job["job_id"],
                "worker_id": worker["worker_id"]
            })
            
            if existing_match:
                continue
            
            # Calculate match score
            score = 0.0
            
            # 1. Location score (30% weight) - District match = 100%, State match = 50%
            if job["district"].lower() == worker["district"].lower():
                score += 30.0
            elif job["state"].lower() == worker["state"].lower():
                score += 15.0
                
            # 2. Job type match (30% weight)
            if job["job_type"] == worker["job_type"]:
                score += 30.0
            
            # 3. Wage compatibility (20% weight)
            wage_diff = abs(job["daily_wage_offered"] - worker["expected_daily_wage"])
            if wage_diff == 0:
                score += 20.0
            elif wage_diff <= 50:
                score += 15.0
            elif wage_diff <= 100:
                score += 10.0
            
            # 4. Skill matching (20% weight)
            if job.get("required_skills") and worker.get("skills"):
                job_skills = {s.lower().strip() for s in job["required_skills"]}
                worker_skills = {s.lower().strip() for s in worker["skills"]}
                matches = job_skills.intersection(worker_skills)
                if matches:
                    # Give full 20% if any skill matches, or could be proportional
                    score += 20.0
            
            # Only create match if score is above threshold (40%)
            if score >= 40:
                match_id = str(uuid.uuid4())
                match_doc = {
                    "match_id": match_id,
                    "job_id": job["job_id"],
                    "worker_id": worker["worker_id"],
                    "match_score": score,
                    "status": "pending",
                    "created_at": datetime.utcnow()
                }
                await db.matches.insert_one(match_doc)
                match_count += 1
                
                notification_doc = {
                    "notification_id": str(uuid.uuid4()),
                    "user_id": worker["user_id"],
                    "job_id": job["job_id"],
                    "message": f"New match found: {job['title']} in {job['district']} (₹{job['daily_wage_offered']}/day)",
                    "sent_at": datetime.utcnow(),
                    "type": "job_match"
                }
                await db.notifications.insert_one(notification_doc)
                
    logger.info(f"Matching complete. Created {match_count} new matches.")
