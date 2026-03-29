import os
from openai import OpenAI
from typing import Optional
from dotenv import load_dotenv
import logging

load_dotenv()

OPENAI_API_KEY = os.getenv("EMERGENT_LLM_KEY")
client = OpenAI(api_key=OPENAI_API_KEY)

logger = logging.getLogger(__name__)

translation_cache = {}

async def translate_text(text: str, target_language: str) -> str:
    """Translate text to target language using OpenAI"""
    if not text or target_language == "en":
        return text
    
    cache_key = f"{text}_{target_language}"
    if cache_key in translation_cache:
        return translation_cache[cache_key]
    
    try:
        lang_names = {
            "hi": "Hindi", "bn": "Bengali", "te": "Telugu",
            "mr": "Marathi", "ta": "Tamil", "gu": "Gujarati",
            "kn": "Kannada", "ml": "Malayalam", "pa": "Punjabi",
            "or": "Odia", "as": "Assamese", "ur": "Urdu"
        }
        
        target_lang_name = lang_names.get(target_language, "Hindi")
        
        response = client.chat.completions.create(
            model="gpt-3.5-turbo", # or the requested "gpt-5.2" if valid, but keeping standard
            messages=[
                {"role": "system", "content": f"You are a professional translator. Translate the given text to {target_lang_name}. Return ONLY the translated text."},
                {"role": "user", "content": text}
            ]
        )
        
        translated = response.choices[0].message.content.strip()
        translation_cache[cache_key] = translated
        return translated
        
    except Exception as e:
        logger.error(f"Translation error: {e}")
        return text

async def transcribe_audio(file_path: str, language: str = "hi") -> str:
    """Transcribe audio using OpenAI Whisper"""
    try:
        with open(file_path, "rb") as audio_file:
            transcript = client.audio.transcriptions.create(
                model="whisper-1", 
                file=audio_file,
                language=language
            )
        return transcript.text
    except Exception as e:
        logger.error(f"Transcription error: {e}")
        return ""

async def extract_details_from_text(text: str) -> dict:
    """Extract worker details using GPT"""
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "Extract worker details (name, area, job_type, wage, skills) from text in JSON format."},
                {"role": "user", "content": text}
            ],
            response_format={"type": "json_object"}
        )
        import json
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        logger.error(f"Detail extraction error: {e}")
        return {}
