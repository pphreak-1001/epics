from fastapi import APIRouter, HTTPException, UploadFile, File
from app.services.ai import transcribe_audio, extract_details_from_text
import os
import tempfile
from pydantic import BaseModel

router = APIRouter(prefix="/api/audio", tags=["audio"])

class ParseRequest(BaseModel):
    text: str
    language: str = "hi"

@router.post("/transcribe")
async def transcribe(file: UploadFile = File(...), language: str = "hi"):
    # Save to temp file
    suffix = os.path.splitext(file.filename)[1]
    if not suffix:
        suffix = ".webm"
        
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name
        
    try:
        text = await transcribe_audio(tmp_path, language)
        return {"transcribed_text": text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)

@router.post("/parse-registration")
async def parse_registration(req: ParseRequest):
    try:
        details = await extract_details_from_text(req.text)
        return {"parsed_data": details}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
