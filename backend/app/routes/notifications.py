from fastapi import APIRouter, Depends
from app.auth import get_current_user
from app.database import get_database

router = APIRouter(prefix="/api/notifications", tags=["notifications"])

@router.get("")
async def get_notifications(user: dict = Depends(get_current_user)):
    db = await get_database()
    notifications = await db.notifications.find({"user_id": user["user_id"]}).sort("sent_at", -1).to_list(100)
    for n in notifications:
        n.pop("_id", None)
    return notifications
