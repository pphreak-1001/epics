import os
import uuid
import tempfile
from datetime import datetime
from fastapi import APIRouter, HTTPException, UploadFile, File
from app.models.schemas import ChatbotMessage
from app.database import get_database
from app.auth import get_password_hash, create_access_token
from app.services.ai import transcribe_audio, extract_details_from_text, translate_text

router = APIRouter(prefix="/api/chatbot", tags=["chatbot"])

STEPS = ["name", "phone", "expertise", "area", "district", "state", "wage", "finish"]

QUESTIONS = {
    "name": "What is your name?",
    "phone": "What is your phone number?",
    "expertise": "What is your area of expertise or job type? (e.g. Mason, Labour, Plumber)",
    "area": "Which village or area do you live in?",
    "district": "Which district is that in?",
    "state": "Which state?",
    "wage": "What is your expected daily wage in Rupees?"
}

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

    # If not finished, process the current step and ask the next question
    current_step = session.get("current_step", "name")
    language = session.get("language", "hi")
    
    # Save user response for the current step
    data = session.get("data", {})
    data[current_step] = msg.message
    
    # Find next step
    try:
        current_idx = STEPS.index(current_step)
        next_step = STEPS[current_idx + 1]
    except (ValueError, IndexError):
        next_step = "finish"

    if next_step == "finish":
        response_text = "Thank you! Your registration details have been collected. You can now login to your dashboard."
        if language != "en":
            response_text = await translate_text(response_text, language)
        
        await db.chatbot_sessions.update_one(
            {"session_id": msg.session_id},
            {"$set": {"data": data, "current_step": "finish"}}
        )
        return {"response": response_text, "session_id": msg.session_id, "step": "finish"}

    # Get next question
    next_question = QUESTIONS.get(next_step, "Next question...")
    if language != "en":
        response_text = await translate_text(next_question, language)
    else:
        response_text = next_question

    # Update session
    await db.chatbot_sessions.update_one(
        {"session_id": msg.session_id},
        {"$set": {"data": data, "current_step": next_step}}
    )

    return {"response": response_text, "session_id": msg.session_id, "step": next_step}

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
