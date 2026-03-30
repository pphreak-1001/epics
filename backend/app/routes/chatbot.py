import tempfile
import random
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
        "finish": "धन्यवाद! आपका पंजीकरण पूरा हो गया है।\n\nपंजीकरण विवरण:\nफ़ोन: {phone}\nपिन: {pin}\n\nअब आप लॉगिन कर सकते हैं।"
    },
    "en": {
        "greeting": "Hello! I'm here to help you register. What is your name?",
        "phone": "What is your phone number?",
        "expertise": "What is your area of expertise or job type? (e.g. Mason, Labour, Plumber)",
        "area": "Which village or area do you live in?",
        "district": "Which district is that in?",
        "state": "Which state?",
        "wage": "What is your expected daily wage in Rupees?",
        "finish": "Thank you! Your registration is complete.\n\nLogin Details:\nPhone: {phone}\nPIN: {pin}\n\nYou can now login."
    },
    "bn": {
        "greeting": "নমস্কার! আমি আপনার সাহায্যকারী। চলুন শুরু করি। আপনার নাম কি?",
        "phone": "আপনার মোবাইল নম্বর কি?",
        "expertise": "আপনার দক্ষতার ক্ষেত্র কি? (যেমন: রাজমিস্ত্রি, মজুর, প্লাম্বার)",
        "area": "আপনি কোন গ্রাম বা এলাকায় থাকেন?",
        "district": "সেটি কোন জেলায়?",
        "state": "কোন রাজ্যটি?),",
        "wage": "আপনার প্রত্যাশিত দৈনিক মজুরি (টাকায়) কত?",
        "finish": "ধন্যবাদ! আপনার নিবন্ধন সম্পূর্ণ হয়েছে।\n\nলগইন বিবরণ:\nফোন: {phone}\nপিন: {pin}\n\nআপনি এখন লগইন করতে পারেন।"
    },
    "mr": {
        "greeting": "नमस्ते! मी तुमचा सोबती आहे. चला सुरुवात करूया. तुमचे नाव काय आहे?",
        "phone": "तुमचा मोबाईल नंबर काय आहे?",
        "expertise": "तुमचे कौशल्य किंवा कामाचा प्रकार काय आहे? (उदा. गवंडी, मजूर, प्लंबर)",
        "area": "तुम्ही कोणत्या गावात किंवा भागात राहता?",
        "district": "ते कोणत्या जिल्ह्यात आहे?",
        "state": "कोणते राज्य?",
        "wage": "तुमची अपेक्षित दैनिक मजुरी (रुपयांमध्ये) काय आहे?",
        "finish": "धन्यवाद! तुमची नोंदणी पूर्ण झाली आहे.\n\nलॉगिन तपशील:\nफोन: {phone}\nपिन: {pin}\n\nतुम्ही आता लॉगिन करू शकता।"
    },
    "te": {
        "greeting": "నమస్కారం! నేను మీ తోడును. ప్రారంభిద్దాం. మీ పేరు ఏమిటి?",
        "phone": "మీ మొబైల్ నంబర్ ఏమిటి?",
        "expertise": "మీ నైపుణ్యం లేదా పని రకం ఏమిటి? (ఉదా: మేస్త్రీ, కూలీ, ప్లంబర్)",
        "area": "మీరు ఏ గ్రామం లేదా ప్రాంతంలో నివసిస్తున్నారు?",
        "district": "అది ఏ జిల్లాలో ఉంది?",
        "state": "ఏ రాష్ట్రం?",
        "wage": "మీరు ఆశించే రోజువారీ వేతనం (రూపాయల్లో) ఎంత?",
        "finish": "ధన్యవాదాలు! మీ రిజిస్ట్రేషన్ పూర్తయింది.\n\nలాగిన్ వివరాలు:\nఫోన్: {phone}\nపిన్: {pin}\n\nమీరు ఇప్పుడు లాగిన్ చేయవచ్చు."
    },
    "ta": {
        "greeting": "வணக்கம்! நான் உங்கள் உதவியாளர். ஆரம்பிக்கலாம். உங்கள் பெயர் என்ன?",
        "phone": "உங்கள் செல்போன் எண் என்ன?",
        "expertise": "உங்கள் நிபுணத்துவம் அல்லது வேலை வகை என்ன? (எ.கா. மேசன், கூலி, பிளம்பர்)",
        "area": "நீங்கள் எந்த கிராமம் அல்லது பகுதியில் வசிக்கிறீர்கள்?",
        "district": "அது எந்த மாவட்டத்தில் உள்ளது?",
        "state": "எந்த மாநிலம்?",
        "wage": "உங்களின் எதிர்பார்க்கப்படும் தினசரி ஊதியம் (ரூபாயில்) எவ்வளவு?",
        "finish": "நன்றி! உங்கள் பதிவு முடிந்தது.\n\nஉள்நுழைவு விவரங்கள்:\nதொலைபேசி: {phone}\nபின் (PIN): {pin}\n\nநீங்கள் இப்போது உள்நுழையலாம்."
    },
    "gu": {
        "greeting": "નમસ્તે! હું તમારો સાથી છું. ચાલો શરૂ કરીએ. તમારું નામ શું છે?",
        "phone": "તમારો મોબાઈલ નંબર શું છે?",
        "expertise": "તમારી કુશળતાનું ક્ષેત્ર શું છે? (દા.ત. કડિયો, મજૂર, પ્લમ્બર)",
        "area": "તમે કયા ગામ કે વિસ્તારમાં રહો છો?",
        "district": "તે કયા જિલ્લામાં છે?",
        "state": "કયું રાજ્ય?",
        "wage": "તમારી અપેક્ષિત દૈનિક મજૂરી (રૂપિયામાં) શું છે?",
        "finish": "આભાર! તમારી નોંધણી સફળતાપૂર્વક પૂર્ણ થઈ ગઈ છે.\n\nલોગિન વિગતો:\nફોન: {phone}\nપિન: {pin}\n\nહવે તમે લોગિન કરી શકો છો."
    },
    "kn": {
        "greeting": "ನಮಸ್ತೆ! ನಾನು ನಿಮ್ಮ ಸಹಾಯಕ. ಪ್ರಾರಂಭಿಸೋಣ. ನಿಮ್ಮ ಹೆಸರೇನು?",
        "phone": "ನಿಮ್ಮ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ಏನು?",
        "expertise": "ನಿಮ್ಮ ಪರಿಣತಿ ಅಥವಾ ಕೆಲಸದ ಪ್ರಕಾರ ಯಾವುದು? (ಉದಾ: ಮೇಸ್ತ್ರಿ, ಕಾರ್ಮಿಕ, ಪ್ಲಂಬರ್)",
        "area": "ನೀವು ಯಾವ ಗ್ರಾಮ ಅಥವಾ ಪ್ರದೇಶದಲ್ಲಿ ವಾಸಿಸುತ್ತೀರಿ?",
        "district": "ಅದು ಯಾವ ಜಿಲ್ಲೆಯಲ್ಲಿದೆ?",
        "state": "ಯಾವ ರಾಜ್ಯ?",
        "wage": "ನಿಮ್ಮ ನಿರೀಕ್ಷಿತ ದೈನಂದಿನ ವೇತನ (ರೂಪಾಯಿಗಳಲ್ಲಿ) ಎಷ್ಟು?",
        "finish": "ಧನ್ಯವಾದಗಳು! ನಿಮ್ಮ ನೋಂದಣಿ ಪೂರ್ಣಗೊಂಡಿದೆ.\n\nಲಾಗಿನ್ ವಿವರಗಳು:\nಫೋನ್: {phone}\nಪಿನ್: {pin}\n\nನೀವು ಈಗ ಲಾಗಿನ್ ಮಾಡಬಹುದು."
    },
    "ml": {
        "greeting": "നമസ്തേ! ഞാൻ നിങ്ങളുടെ സഹായിയാണ്. നമുക്ക് തുടങ്ങാം. നിങ്ങളുടെ പേരെന്താണ്?",
        "phone": "നിങ്ങളുടെ മൊബൈൽ നമ്പർ എന്താണ്?",
        "expertise": "നിങ്ങളുടെ തൊഴിൽ ഏതാണ്? (ഉദാ: മേസൺ, തൊഴിലാളി, പ്ലംബർ)",
        "area": "നിങ്ങൾ ഏത് ഗ്രാമത്തിലോ പ്രദേശത്തോ ആണ് താമസിക്കുന്നത്?",
        "district": "അത് ഏത് ജില്ലയിലാണ്?",
        "state": "ഏത് സംസ്ഥാനം?",
        "wage": "നിങ്ങൾ പ്രതീക്ഷിക്കുന്ന പ്രതിദിന കൂലി (രൂപയിൽ) എത്രയാണ്?",
        "finish": "നന്ദി! നിങ്ങളുടെ രജിസ്ട്രേഷൻ പൂർത്തിയായി.\n\nലോഗിൻ വിവരങ്ങൾ:\nഫോൺ: {phone}\nപിൻ: {pin}\n\nനിങ്ങൾക്ക് ഇപ്പോൾ ലോഗിન ചെയ്യാം."
    },
    "pa": {
        "greeting": "नमस्ते! ਮੈਂ ਤੁਹਾਡਾ ਸਾਥੀ ਹਾਂ। ਆਓ ਸ਼ੁਰੂ ਕਰੀਏ। ਤੁਹਾਡਾ ਨਾਮ ਕੀ ਹੈ?",
        "phone": "ਤੁਹਾਡਾ ਮੋਬਾਈਲ ਨੰਬਰ ਕੀ ਹੈ?",
        "expertise": "ਤੁਹਾਡੀ ਮੁਹਾਰਤ ਜਾਂ ਕੰਮ ਦੀ ਕਿਸਮ ਕੀ ਹੈ? (ਜਿਵੇਂ: ਰਾਜ ਮਿਸਤਰੀ, ਮਜ਼ਦੂਰ, ਪਲੰਬਰ)",
        "area": "ਤੁਸੀਂ ਕਿਹੜੇ ਪਿੰਡ ਜਾਂ ਇਲਾਕੇ ਵਿੱਚ ਰਹਿੰਦੇ ਹੋ?",
        "district": "ਉਹ ਕਿਹੜਾ ਜ਼ਿਲ੍ਹਾ ਹੈ?",
        "state": "ਕਿਹੜਾ ਰਾਜ?",
        "wage": "ਤੁਹਾਡੀ ਅਪੇਖਿਤ ਰੋਜ਼ਾਨਾ ਦਿਹਾੜੀ (ਰੁਪਏ ਵਿੱਚ) ਕੀ ਹੈ?",
        "finish": "ਧੰਨਵਾਦ! ਤੁਹਾਡੀ ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਪੂਰੀ ਹੋ ਗਈ ਹੈ।\n\nਲੌਗਇਨ ਵੇਰਵੇ:\nਫੋਨ: {phone}\nਪਿੰਨ: {pin}\n\nਹੁਣ ਤੁਸੀਂ ਲੌਗਇਨ ਕਰ ਸਕਦੇ ਹੋ।"
    },
    "or": {
        "greeting": "ନମସ୍ତେ! ମୁଁ ଆପଣଙ୍କର ସହାୟକ। ଚାଲନ୍ତୁ ଆରମ୍ଭ କରିବା | ଆପଣଙ୍କ ନାମ କ’ଣ?",
        "phone": "ଆପଣଙ୍କ ମୋବାଇଲ୍ ନମ୍ବର କ’ଣ?",
        "expertise": "ଆପଣଙ୍କର ଦକ୍ଷତା ବା କାର୍ଯ୍ୟର ପ୍ରକାର କ’ଣ? (ଯଥା: ରାଜମିସ୍ତ୍ରୀ, ଶ୍ରମିକ, ପ୍ଲମ୍ବର)",
        "area": "ଆପଣ କେଉଁ ଗ୍ରାମ ବା ଅଞ୍ଚଳରେ ରୁହନ୍ତି?",
        "district": "ତାହା କେଉଁ ଜିଲ୍ଲାରେ?",
        "state": "କେଉଁ ରାଜ୍ୟ?",
        "wage": "ଆପଣଙ୍କର ଆଶା କରାଯାଉଥିବା ଦୈନିକ ମଜୁରୀ (ଟଙ୍କାରେ) କେତେ?",
        "finish": "ଧନ୍ୟବାଦ! ଆପଣଙ୍କର ପଞ୍ଜିକରଣ ସମାପ୍ତ ହୋଇଛି |\n\nଲଗଇନ୍ ବିବରଣୀ:\nଫୋନ୍: {phone}\nପିନ୍: {pin}\n\nଆପଣ ବର୍ତ୍ତମାନ ଲଗଇନ୍ କରିପାରିବେ |"
    },
    "as": {
        "greeting": "নমস্কাৰ! মই আপোনাৰ সহায়ক। আহক আৰম্ভ কৰোঁ। আপোনাৰ নাম কি?",
        "phone": "আপোনাৰ মোবাইল নম্বৰ কি?",
        "expertise": "আপোনাৰ দক্ষতাৰ ক্ষেত্ৰ কি? (যেনে: ৰাজমিস্ত্ৰী, বনুৱা, প্লাম্বাৰ)",
        "area": "আপুনি কোনখন গাঁও বা অঞ্চলত বাস কৰে?",
        "district": "সেইটো কোন জিলাত?",
        "state": "কোনখন ৰাজ্য?",
        "wage": "আপোনাৰ প্ৰত্যাশিত দৈনিক মজুৰি (টকাত) কিমান?",
        "finish": "ধন্যবাদ! আপোনাৰ পঞ্জীয়ন সম্পূৰ্ণ হৈছে।\n\nলগইনৰ বিৱৰণ:\nফোন: {phone}\nপিন: {pin}\n\nআপুনি এতিয়া লগইন কৰিব পাৰে।"
    },
    "ur": {
        "greeting": "नमस्ते! میں آپ کا ساتھی ہوں۔ آئیے شروع کرتے ہیں۔ آپ کا نام کیا ہے؟",
        "phone": "آپ کا موبائل نمبر کیا ہے؟",
        "expertise": "آپ کی مہارت یا کام کی نوعیت کیا ہے؟ (جیسے: راج مستری، مزدور، پلمبر)",
        "area": "آپ کس گاؤں یا علاقے میں رہتے ہیں؟",
        "district": "وہ کس ضلع میں ہے؟",
        "state": "کون سی ریاست؟",
        "wage": "آپ کی متوقع روزانہ اجرت (روپوں میں) کیا ہے؟",
        "finish": "شکریہ! آپ کی رجسٹریشن مکمل ہو گئی ہے۔\n\nلاگ ان کی تفصیلات:\nفون: {phone}\nپن: {pin}\n\nاب آپ لاگ ان کر سکتے ہیں۔"
    }
}

# ── Help Mode Content ────────────────────────────────────────────────────────

HELP_PROMPT = """
You are a helpful assistant for the GraminRozgar platform. 
GraminRozgar connects rural workers with local employers.
Users can find jobs, register as workers, or post jobs as employers.
Workers are paid directly by employers.
The platform is available in 13 Indian languages.

Answer the following user question in a simple, clear, and helpful way in {language}:
"{question}"
"""

# Update finish templates (remove PIN/Phone)
for lang in LOCALIZED_QUESTIONS:
    if lang == "hi":
        LOCALIZED_QUESTIONS[lang]["finish"] = "धन्यवाद! आपका पंजीकरण पूरा हो गया है। हम आपको आपके डैशबोर्ड पर ले जा रहे हैं..."
    elif lang == "en":
        LOCALIZED_QUESTIONS[lang]["finish"] = "Thank you! Your registration is complete. We are logging you in now..."
    elif lang == "bn":
        LOCALIZED_QUESTIONS[lang]["finish"] = "ধন্যবাদ! আপনার নিবন্ধন সম্পূর্ণ হয়েছে। আমরা আপনাকে আপনার ড্যাশবোর্ডে নিয়ে যাচ্ছি..."
    elif lang == "mr":
        LOCALIZED_QUESTIONS[lang]["finish"] = "धन्यवाद! तुमची नोंदणी पूर्ण झाली आहे. आम्ही तुम्हाला तुमच्या डॅशबोर्डवर नेत आहोत..."
    elif lang == "te":
        LOCALIZED_QUESTIONS[lang]["finish"] = "ధన్యవాదాలు! మీ రిజిస్ట్రేషన్ పూర్తయింది. మేము మిమ్మల్ని మీ డాష్‌బోర్డ్‌కు తీసుకెళ్తున్నాము..."
    elif lang == "ta":
        LOCALIZED_QUESTIONS[lang]["finish"] = "நன்றி! உங்கள் பதிவு முடிந்தது. உங்களை உங்கள் டாஷ்போர்டிற்கு அழைத்துச் செல்கிறோம்..."
    elif lang == "gu":
        LOCALIZED_QUESTIONS[lang]["finish"] = "આભાર! તમારી નોંધણી સફળતાપૂર્વક પૂર્ણ થઈ ગઈ છે. અમે તમને તમારા ડેશબોર્ડ પર લઈ જઈ રહ્યા છીએ..."
    elif lang == "kn":
        LOCALIZED_QUESTIONS[lang]["finish"] = "ಧನ್ಯವಾದಗಳು! ನಿಮ್ಮ ನೋಂದಣಿ ಪೂರ್ಣಗೊಂಡಿದೆ. ನಾವು ನಿಮ್ಮನ್ನು ನಿಮ್ಮ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಕರೆದೊಯ್ಯುತ್ತಿದ್ದೇವೆ..."
    elif lang == "ml":
        LOCALIZED_QUESTIONS[lang]["finish"] = "നന്ദി! നിങ്ങളുടെ രജിസ്ട്രേഷൻ പൂർത്തിയായി. ഞങ്ങൾ നിങ്ങളെ നിങ്ങളുടെ ഡാഷ്ബോർഡിലേക്ക് കൊണ്ടുപോകുന്നു..."
    elif lang == "pa":
        LOCALIZED_QUESTIONS[lang]["finish"] = "ਧੰਨਵਾਦ! ਤੁਹਾਡੀ ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਪੂਰੀ ਹੋ ਗਈ ਹੈ। ਅਸੀਂ ਤੁਹਾਨੂੰ ਤੁਹਾਡੇ ਡੈਸ਼ਬੋਰਡ 'ਤੇ ਲੈ ਕੇ ਜਾ ਰਹੇ ਹਾਂ..."
    elif lang == "or":
        LOCALIZED_QUESTIONS[lang]["finish"] = "ଧନ୍ୟବାଦ! ଆପଣଙ୍କର ପଞ୍ଜିକରଣ ସମାପ୍ତ ହୋଇଛି | ଆମେ ଆପଣଙ୍କୁ ଆପଣଙ୍କର ଡ୍ୟାସବୋର୍ଡକୁ ନେଇଯାଉଛୁ..."
    elif lang == "as":
        LOCALIZED_QUESTIONS[lang]["finish"] = "ধন্যবাদ! আপোনাৰ পঞ্জীয়ন সম্পূৰ্ণ হৈছে। আমি আপোনাক আপোনাৰ ডেশ্ববৰ্ডলৈ লৈ গৈ আছোঁ..."
    elif lang == "ur":
        LOCALIZED_QUESTIONS[lang]["finish"] = "شکریہ! آپ کی رجسٹریشن مکمل ہو گئی ہے۔ ہم آپ کو آپ کے ڈیش بورڈ پر لے جا رہے ہیں..."

@router.post("/conversation")
async def chatbot_conversation(msg: ChatbotMessage):
    db = await get_database()
    
    # --- Help Mode Logic ---
    if msg.mode == "help":
        # Use LLM or simple Q&A. Here we'll use a simulated LLM response for brevity, 
        # but in a real app, you'd call a service like extract_details_from_text 
        # or a dedicated LLM endpoint.
        prompt = HELP_PROMPT.format(language=msg.language, question=msg.message)
        # For simulation, we'll return a helpful response based on keywords
        response_text = ""
        m = msg.message.lower()
        if "job" in m or "काम" in m:
            response_text = "You can find jobs by going to your dashboard. We match your skills with local requirements."
        elif "pay" in m or "पैसा" in m or "मजदूरी" in m:
            response_text = "Payments are made directly by the employer to you after the job is completed."
        elif "use" in m or "कैसे" in m:
            response_text = "It's simple! Just register, complete your KYC, and you'll see jobs near you."
        else:
            response_text = "I am here to help. You can ask about registration, finding jobs, or how payments work."
        
        if msg.language != "en":
            response_text = await translate_text(response_text, msg.language)
            
        return {"response": response_text, "session_id": msg.session_id}

    # --- Registration Mode Logic ---
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
        template = lang_data.get("finish", LOCALIZED_QUESTIONS["en"]["finish"])
        
        # --- Create User and Worker Profile ---
        phone = data.get("phone", "Unknown")
        name = data.get("name", "Worker")
        pin = str(random.randint(100000, 999999))
        
        # Register in DB
        existing_user = await db.users.find_one({"phone_number": phone})
        if not existing_user:
            import uuid
            user_id = str(uuid.uuid4())
            
            # Create User
            user_doc = {
                "user_id": user_id,
                "name": name,
                "phone_number": phone,
                "password": get_password_hash(pin),
                "temp_pin": pin, # Store for simulation/dashboard display
                "role": "worker",
                "language": language,
                "kyc_status": "pending",
                "is_blocked": False,
                "created_at": datetime.utcnow()
            }
            await db.users.insert_one(user_doc)
            
            # Create Worker Profile
            worker_doc = {
                "worker_id": str(uuid.uuid4()),
                "user_id": user_id,
                "name": name,
                "phone_number": phone,
                "area": data.get("area", ""),
                "district": data.get("district", ""),
                "state": data.get("state", ""),
                "job_type": data.get("expertise", ""),
                "expected_daily_wage": float(data.get("wage", 0).replace(",", "").strip()) if isinstance(data.get("wage"), str) else 0,
                "skills": [data.get("expertise", "")],
                "language": language,
                "created_at": datetime.utcnow()
            }
            await db.workers.insert_one(worker_doc)
            
            response_text = template # No more .format(phone, pin)
        else:
            response_text = "This phone number is already registered. Please log in with your existing credentials."
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

@router.post("/complete-registration")
async def complete_registration(session_id: str):
    db = await get_database()
    session = await db.chatbot_sessions.find_one({"session_id": session_id})
    if not session or session.get("current_step") != "finish":
        raise HTTPException(status_code=400, detail="Registration not complete or session not found")
    
    phone = session.get("data", {}).get("phone")
    if not phone:
        raise HTTPException(status_code=400, detail="Phone number not found in session")
        
    user = await db.users.find_one({"phone_number": phone})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    token = create_access_token({"user_id": user["user_id"], "role": user.role if hasattr(user, 'role') else user.get('role', 'worker')})
    
    return {
        "token": token,
        "user_id": user["user_id"],
        "role": user.get("role", "worker"),
        "name": user.get("name")
    }
