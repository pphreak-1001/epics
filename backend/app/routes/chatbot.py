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

LOCALIZED_QUESTIONS = {
    "hi": {
        "greeting": "नमस्ते! मैं आपका साथी हूं। आइए शुरू करते हैं। आपका नाम क्या है?",
        "phone": "आपका मोबाइल नंबर क्या है?",
        "expertise": "आपकी विशेषज्ञता का क्षेत्र क्या है? (जैसे: राजमिस्त्री, मजदूर, प्लंबर)",
        "area": "आप किस गांव या क्षेत्र में रहते हैं?",
        "district": "वह किस जिले में है?",
        "state": "वह किस राज्य में है?",
        "wage": "आपकी अपेक्षित दैनिक मजदूरी (रुपये में) क्या है?",
        "finish": "धन्यवाद! आपका पंजीकरण विवरण एकत्र कर लिया गया है। अब आप अपने डैशबोर्ड पर लॉगिन कर सकते हैं।"
    },
    "en": {
        "greeting": "Hello! I'm here to help you register. What is your name?",
        "phone": "What is your phone number?",
        "expertise": "What is your area of expertise or job type? (e.g. Mason, Labour, Plumber)",
        "area": "Which village or area do you live in?",
        "district": "Which district is that in?",
        "state": "Which state?",
        "wage": "What is your expected daily wage in Rupees?",
        "finish": "Thank you! Your registration details have been collected. You can now login to your dashboard."
    },
    "bn": {
        "greeting": "নমস্কার! আমি আপনার সাহায্যকারী। চলুন শুরু করি। আপনার নাম কি?",
        "phone": "আপনার মোবাইল নম্বর কি?",
        "expertise": "আপনার দক্ষতার ক্ষেত্র কি? (যেমন: রাজমিস্ত্রি, মজুর, প্লাম্বার)",
        "area": "আপনি কোন গ্রাম বা এলাকায় থাকেন?",
        "district": "সেটি কোন জেলায়?",
        "state": "কোন রাজ্যটি?),",
        "wage": "আপনার প্রত্যাশিত দৈনিক মজুরি (টাকায়) কত?",
        "finish": "ধন্যবাদ! আপনার নিবন্ধনের বিবরণ সংগ্রহ করা হয়েছে। আপনি এখন আপনার ড্যাশবোর্ডে লগইন করতে পারেন।"
    },
    "mr": {
        "greeting": "नमस्ते! मी तुमचा सोबती आहे. चला सुरुवात करूया. तुमचे नाव काय आहे?",
        "phone": "तुमचा मोबाईल नंबर काय आहे?",
        "expertise": "तुमचे कौशल्य किंवा कामाचा प्रकार काय आहे? (उदा. गवंडी, मजूर, प्लंबर)",
        "area": "तुम्ही कोणत्या गावात किंवा भागात राहता?",
        "district": "ते कोणत्या जिल्ह्यात आहे?",
        "state": "कोणते राज्य?",
        "wage": "तुमची अपेक्षित दैनिक मजुरी (रुपयांमध्ये) काय आहे?",
        "finish": "धन्यवाद! तुमची नोंदणी माहिती गोळा केली गेली आहे. तुम्ही आता तुमच्या डॅशबोर्डवर लॉगिन करू शकता।"
    },
    "te": {
        "greeting": "నమస్కారం! నేను మీ తోడును. ప్రారంభిద్దాం. మీ పేరు ఏమిటి?",
        "phone": "మీ మొబైల్ నంబర్ ఏమిటి?",
        "expertise": "మీ నైపుణ్యం లేదా పని రకం ఏమిటి? (ఉదా: మేస్త్రీ, కూలీ, ప్లంబర్)",
        "area": "మీరు ఏ గ్రామం లేదా ప్రాంతంలో నివసిస్తున్నారు?",
        "district": "అది ఏ జిల్లాలో ఉంది?",
        "state": "ఏ రాష్ట్రం?",
        "wage": "మీరు ఆశించే రోజువారీ వేతనం (రూపాయల్లో) ఎంత?",
        "finish": "ధన్యవాదాలు! మీ రిజిస్ట్రేషన్ వివరాలు సేకరించబడ్డాయి. మీరు ఇప్పుడు మీ డ్యాష్‌బోర్డ్‌కు లాగిన్ చేయవచ్చు."
    },
    "ta": {
        "greeting": "வணக்கம்! நான் உங்கள் உதவியாளர். ஆரம்பிக்கலாம். உங்கள் பெயர் என்ன?",
        "phone": "உங்கள் செல்போன் எண் என்ன?",
        "expertise": "உங்கள் நிபுணத்துவம் அல்லது வேலை வகை என்ன? (எ.கா. மேசன், கூலி, பிளம்பர்)",
        "area": "நீங்கள் எந்த கிராமம் அல்லது பகுதியில் வசிக்கிறீர்கள்?",
        "district": "அது எந்த மாவட்டத்தில் உள்ளது?",
        "state": "எந்த மாநிலம்?",
        "wage": "உங்களின் எதிர்பார்க்கப்படும் தினசரி ஊதியம் (ரூபாயில்) எவ்வளவு?",
        "finish": "நன்றி! உங்கள் பதிவு விவரங்கள் சேகரிக்கப்பட்டுள்ளன. நீங்கள் இப்போது உங்கள் டாஷ்போர்டில் லாகின் செய்யலாம்."
    }
}

@router.post("/conversation")
async def chatbot_conversation(msg: ChatbotMessage):
    db = await get_database()
    session = await db.chatbot_sessions.find_one({"session_id": msg.session_id})
    
    if not session:
        # Initial greeting
        lang_data = LOCALIZED_QUESTIONS.get(msg.language, LOCALIZED_QUESTIONS["hi"])
        greeting = lang_data.get("greeting", LOCALIZED_QUESTIONS["hi"]["greeting"])
        
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
        lang_data = LOCALIZED_QUESTIONS.get(language, LOCALIZED_QUESTIONS["en"])
        response_text = lang_data.get("finish")
        
        if not response_text:
            response_text = LOCALIZED_QUESTIONS["en"]["finish"]
            if language != "en":
                response_text = await translate_text(response_text, language)
        
        await db.chatbot_sessions.update_one(
            {"session_id": msg.session_id},
            {"$set": {"data": data, "current_step": "finish"}}
        )
        return {"response": response_text, "session_id": msg.session_id, "step": "finish"}

    # Get next question
    lang_data = LOCALIZED_QUESTIONS.get(language, LOCALIZED_QUESTIONS["en"])
    response_text = lang_data.get(next_step)
    
    # Fallback to translation if not in hardcoded dict
    if not response_text:
        eng_question = LOCALIZED_QUESTIONS["en"].get(next_step, "Next question...")
        if language != "en":
            response_text = await translate_text(eng_question, language)
        else:
            response_text = eng_question

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
