"""
Backend API Tests for GraminRozgar - Multilingual Features
Tests chatbot conversation, audio transcription, and language support
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://skillsage-2.preview.emergentagent.com')

class TestHealthCheck:
    """Health check endpoint tests"""
    
    def test_health_endpoint(self):
        """Test that the API is healthy"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["service"] == "GraminRozgar API"


class TestChatbotMultilingual:
    """Chatbot conversation endpoint tests - Multilingual support"""
    
    def test_chatbot_hindi_greeting(self):
        """Test chatbot returns Hindi greeting when language is 'hi'"""
        session_id = f"test_hi_{uuid.uuid4()}"
        response = requests.post(f"{BASE_URL}/api/chatbot/conversation", json={
            "session_id": session_id,
            "message": "",
            "language": "hi"
        })
        assert response.status_code == 200
        data = response.json()
        assert "session_id" in data
        assert "response" in data
        # Verify Hindi greeting contains Hindi characters
        assert "नमस्ते" in data["response"] or "आपका नाम" in data["response"]
        print(f"Hindi greeting: {data['response']}")
    
    def test_chatbot_bengali_greeting(self):
        """Test chatbot returns Bengali greeting when language is 'bn'"""
        session_id = f"test_bn_{uuid.uuid4()}"
        response = requests.post(f"{BASE_URL}/api/chatbot/conversation", json={
            "session_id": session_id,
            "message": "",
            "language": "bn"
        })
        assert response.status_code == 200
        data = response.json()
        assert "session_id" in data
        assert "response" in data
        # Verify Bengali greeting contains Bengali characters
        assert "নমস্কার" in data["response"] or "আপনার নাম" in data["response"]
        print(f"Bengali greeting: {data['response']}")
    
    def test_chatbot_telugu_greeting(self):
        """Test chatbot returns Telugu greeting when language is 'te'"""
        session_id = f"test_te_{uuid.uuid4()}"
        response = requests.post(f"{BASE_URL}/api/chatbot/conversation", json={
            "session_id": session_id,
            "message": "",
            "language": "te"
        })
        assert response.status_code == 200
        data = response.json()
        assert "session_id" in data
        assert "response" in data
        # Verify Telugu greeting contains Telugu characters
        assert "నమస్కారం" in data["response"] or "మీ పేరు" in data["response"]
        print(f"Telugu greeting: {data['response']}")
    
    def test_chatbot_english_greeting(self):
        """Test chatbot returns English greeting when language is 'en'"""
        session_id = f"test_en_{uuid.uuid4()}"
        response = requests.post(f"{BASE_URL}/api/chatbot/conversation", json={
            "session_id": session_id,
            "message": "",
            "language": "en"
        })
        assert response.status_code == 200
        data = response.json()
        assert "session_id" in data
        assert "response" in data
        # Verify English greeting
        assert "Hello" in data["response"] or "name" in data["response"]
        print(f"English greeting: {data['response']}")
    
    def test_chatbot_marathi_greeting(self):
        """Test chatbot returns Marathi greeting when language is 'mr'"""
        session_id = f"test_mr_{uuid.uuid4()}"
        response = requests.post(f"{BASE_URL}/api/chatbot/conversation", json={
            "session_id": session_id,
            "message": "",
            "language": "mr"
        })
        assert response.status_code == 200
        data = response.json()
        assert "session_id" in data
        assert "response" in data
        # Verify Marathi greeting contains Marathi characters
        assert "नमस्कार" in data["response"] or "नाव" in data["response"]
        print(f"Marathi greeting: {data['response']}")
    
    def test_chatbot_tamil_greeting(self):
        """Test chatbot returns Tamil greeting when language is 'ta'"""
        session_id = f"test_ta_{uuid.uuid4()}"
        response = requests.post(f"{BASE_URL}/api/chatbot/conversation", json={
            "session_id": session_id,
            "message": "",
            "language": "ta"
        })
        assert response.status_code == 200
        data = response.json()
        assert "session_id" in data
        assert "response" in data
        # Verify Tamil greeting contains Tamil characters
        assert "வணக்கம்" in data["response"] or "பெயர்" in data["response"]
        print(f"Tamil greeting: {data['response']}")
    
    def test_chatbot_gujarati_greeting(self):
        """Test chatbot returns Gujarati greeting when language is 'gu'"""
        session_id = f"test_gu_{uuid.uuid4()}"
        response = requests.post(f"{BASE_URL}/api/chatbot/conversation", json={
            "session_id": session_id,
            "message": "",
            "language": "gu"
        })
        assert response.status_code == 200
        data = response.json()
        assert "session_id" in data
        assert "response" in data
        # Verify Gujarati greeting contains Gujarati characters
        assert "નમસ્તે" in data["response"] or "નામ" in data["response"]
        print(f"Gujarati greeting: {data['response']}")
    
    def test_chatbot_conversation_flow_hindi(self):
        """Test full chatbot conversation flow in Hindi"""
        session_id = f"test_flow_hi_{uuid.uuid4()}"
        
        # Step 1: Initial greeting
        response = requests.post(f"{BASE_URL}/api/chatbot/conversation", json={
            "session_id": session_id,
            "message": "",
            "language": "hi"
        })
        assert response.status_code == 200
        data = response.json()
        assert "नमस्ते" in data["response"] or "नाम" in data["response"]
        
        # Step 2: Provide name
        response = requests.post(f"{BASE_URL}/api/chatbot/conversation", json={
            "session_id": session_id,
            "message": "राम कुमार",
            "language": "hi"
        })
        assert response.status_code == 200
        data = response.json()
        assert "step" in data
        assert data["step"] == "area"
        print(f"After name - Step: {data['step']}, Response: {data['response'][:50]}...")
    
    def test_chatbot_conversation_flow_bengali(self):
        """Test chatbot conversation flow in Bengali"""
        session_id = f"test_flow_bn_{uuid.uuid4()}"
        
        # Step 1: Initial greeting
        response = requests.post(f"{BASE_URL}/api/chatbot/conversation", json={
            "session_id": session_id,
            "message": "",
            "language": "bn"
        })
        assert response.status_code == 200
        data = response.json()
        assert "নমস্কার" in data["response"]
        
        # Step 2: Provide name
        response = requests.post(f"{BASE_URL}/api/chatbot/conversation", json={
            "session_id": session_id,
            "message": "রাম কুমার",
            "language": "bn"
        })
        assert response.status_code == 200
        data = response.json()
        assert "step" in data
        assert data["step"] == "area"
        # Verify Bengali response for area question
        assert "গ্রাম" in data["response"] or "এলাকা" in data["response"] or "থাকেন" in data["response"]
        print(f"Bengali flow - Step: {data['step']}, Response: {data['response'][:50]}...")


class TestAudioTranscription:
    """Audio transcription endpoint tests"""
    
    def test_audio_transcribe_endpoint_exists(self):
        """Test that audio transcribe endpoint exists and returns proper error for invalid input"""
        # Send empty file to verify endpoint exists
        response = requests.post(
            f"{BASE_URL}/api/audio/transcribe?language=hi",
            files={"file": ("test.webm", b"", "audio/webm")}
        )
        # Should return 500 or 520 (Cloudflare) with transcription error (not 404)
        assert response.status_code in [500, 520]
        # Endpoint exists and processes the request
        print(f"Audio endpoint status: {response.status_code}")
    
    def test_audio_parse_registration_endpoint(self):
        """Test audio parse registration endpoint"""
        response = requests.post(f"{BASE_URL}/api/audio/parse-registration", json={
            "text": "My name is Ram Kumar from Agra district in Uttar Pradesh. I am a mason and expect 500 rupees daily. My phone is 9876543210.",
            "language": "en"
        })
        assert response.status_code == 200
        data = response.json()
        assert "parsed_data" in data
        assert "original_text" in data
        print(f"Parsed data: {data['parsed_data']}")


class TestAuthEndpoints:
    """Authentication endpoint tests"""
    
    def test_register_worker(self):
        """Test worker registration"""
        phone = f"TEST_{uuid.uuid4().hex[:8]}"
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "name": "Test Worker",
            "phone_number": phone,
            "password": "test123",
            "role": "worker",
            "language": "hi"
        })
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert "user_id" in data
        assert data["role"] == "worker"
        print(f"Registered worker with phone: {phone}")
        return data["token"], phone
    
    def test_register_employer(self):
        """Test employer registration"""
        phone = f"TEST_{uuid.uuid4().hex[:8]}"
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "name": "Test Employer",
            "phone_number": phone,
            "password": "test123",
            "role": "employer",
            "language": "en"
        })
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert "user_id" in data
        assert data["role"] == "employer"
        print(f"Registered employer with phone: {phone}")
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "phone_number": "invalid_phone",
            "password": "wrong_password"
        })
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data


class TestJobEndpoints:
    """Job-related endpoint tests"""
    
    def test_get_all_jobs(self):
        """Test getting all jobs"""
        response = requests.get(f"{BASE_URL}/api/jobs")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Found {len(data)} jobs")


class TestChatbotCompleteRegistration:
    """Test chatbot complete registration flow"""
    
    def test_complete_registration_missing_session(self):
        """Test complete registration with missing session"""
        response = requests.post(f"{BASE_URL}/api/chatbot/complete-registration?session_id=nonexistent_session")
        assert response.status_code == 404
        data = response.json()
        assert "detail" in data
        assert "Session not found" in data["detail"]


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
