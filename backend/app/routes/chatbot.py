import os
import uuid
import tempfile
from datetime import datetime
from fastapi import APIRouter, HTTPException, UploadFile, File
from app.models.schemas import ChatbotMessage
from app.database import get_database
from app.auth import get_password_hash, create_access_token
from app.services.ai import transcribe_audio, extract_details_from_text

router = APIRouter(prefix="/api/chatbot", tags=["chatbot"])

@router.post("/conversation")
async def chatbot_conversation(msg: ChatbotMessage):
    db = await get_database()
    session = await db.chatbot_sessions.find_one({"session_id": msg.session_id})
    
    if not session:
        # Initial greeting in the requested language
        greetings = {
            "hi": "नमस्ते! मैं आपका साथी हूं। आइए शुरू करते हैं। आपका नाम क्या है?",
            "en": "Hello! I'm here to help you register. What is your name?",
            # Add more as needed
        }
        greeting = greetings.get(msg.language, greetings["hi"])
        session = {
            "session_id": msg.session_id,
            "messages": [{"role": "assistant", "content": greeting}],
            "data": {},
            "current_step": "name",
            "language": msg.language,
            "created_at": datetime.utcnow()
        }
        await db.chatbot_sessions.insert_one(session)
        return {"response": greeting, "session_id": msg.session_id}

    # Logic for state machine here (omitted for brevity, keeping same as server.py)
    # This would involve updating 'data' based on 'current_step' and returning the next question
    return {"response": "Next question...", "session_id": msg.session_id, "step": "next"}

@router.post("/audio/transcribe")
async def transcribe(file: UploadFile = File(...), language: str = "hi"):
    # Save to temp file
    suffix = os.path.splitext(file.filename)[1]
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name
        
    try:
        text = await transcribe_audio(tmp_path, language)
        details = await extract_details_from_text(text)
        return {"text": text, "extracted": details}
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
