from openai import OpenAI
from sarvamai import SarvamAI
from typing import Optional
from dotenv import load_dotenv
import logging

load_dotenv()

OPENAI_API_KEY = os.getenv("EMERGENT_LLM_KEY")
SARVAM_API_KEY = os.getenv("SARVAM_API_KEY")

openai_client = OpenAI(api_key=OPENAI_API_KEY)
sarvam_client = SarvamAI(api_subscription_key=SARVAM_API_KEY)

logger = logging.getLogger(__name__)

translation_cache = {}

def get_sarvam_lang(lang_code: str) -> str:
    """Map internal codes to Sarvam language codes"""
    mapping = {
        "hi": "hi-IN", "bn": "bn-IN", "te": "te-IN",
        "mr": "mr-IN", "ta": "ta-IN", "gu": "gu-IN",
        "kn": "kn-IN", "ml": "ml-IN", "pa": "pa-IN",
        "or": "or-IN", "as": "as-IN", "ur": "ur-IN",
        "en": "en-IN"
    }
    return mapping.get(lang_code, "hi-IN")

async def translate_text(text: str, target_language: str) -> str:
    """Translate text to target language using OpenAI"""
    if not text or target_language == "en":
        return text
    
    cache_key = f"{text}_{target_language}"
    if cache_key in translation_cache:
        return translation_cache[cache_key]
    
    try:
        response = sarvam_client.translate.translate(
            input_text=text,
            source_language="en-IN",
            target_language=get_sarvam_lang(target_language)
        )
        
        translated = response.get("translated_text", text)
        translation_cache[cache_key] = translated
        return translated
        
    except Exception as e:
        logger.error(f"Translation error: {e}")
        return text

async def transcribe_audio(file_path: str, language: str = "hi") -> str:
    """Transcribe audio using Sarvam AI Saaras v3"""
    try:
        with open(file_path, "rb") as audio_file:
            response = sarvam_client.speech_to_text.transcribe(
                file=audio_file,
                model="saaras:v3",
                mode="transcribe",
                language_code=get_sarvam_lang(language)
            )
        return response.get("transcript", "")
    except Exception as e:
        logger.error(f"Transcription error: {e}")
        return ""

async def extract_details_from_text(text: str) -> dict:
    """Extract worker details using GPT-3.5 Turbo"""
    try:
        response = openai_client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system", 
                    "content": (
                        "You are an expert data extractor for a rural job platform. "
                        "Extract the following worker details from the provided text: "
                        "name, phone_number, area (village/area), district, state, "
                        "job_type (one of: Mason, Labour, Plumber, Electrician, Painter), "
                        "and expected_daily_wage (as a number). "
                        "Return the result ONLY as a JSON object. If a field is missing, return an empty string for it."
                    )
                },
                {"role": "user", "content": text}
            ],
            response_format={"type": "json_object"}
        )
        import json
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        logger.error(f"Detail extraction error: {e}")
        return {}

async def generate_speech_from_text(text: str, language_code: str) -> str:
    """Generate base64-encoded audio from text using Sarvam AI TTS"""
    try:
        url = "https://api.sarvam.ai/text-to-speech"
        headers = {
            "api-subscription-key": SARVAM_API_KEY,
            "Content-Type": "application/json"
        }
        
        sarvam_lang = get_sarvam_lang(language_code)
        
        # Urdu fallback to Hindi if not directly supported by the specific model version
        if language_code == "ur":
            sarvam_lang = "hi-IN"

        payload = {
            "text": text,
            "speaker": "aditya" if sarvam_lang != "hi-IN" else "shubh",
            "model": "bulbul:v3",
            "target_language_code": sarvam_lang,
            "pitch": 0,
            "pace": 1.0,
            "loudness": 1.0
        }
        
        import httpx
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, headers=headers, timeout=30.0)
            
        if response.status_code == 200:
            data = response.json()
            return data.get('audio_audio', "")
        else:
            logger.error(f"Sarvam TTS Error: {response.status_code}, {response.text}")
            return ""
    except Exception as e:
        logger.error(f"Speech generation error: {e}")
        return ""
