import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Send, HelpCircle, UserPlus, Play } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001/api';

function ChatbotSignup({ onClose, onSuccess }) {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random()}`);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [mode, setMode] = useState('registration'); // 'registration' or 'help'

  // Initialize with language-specific greeting
  useEffect(() => {
    if (!initialized || messages.length === 0) {
      const greetings = {
        hi: mode === 'registration' ? 'नमस्ते! मैं आपको पंजीकरण में मदद करूंगा। कृपया अपना नाम बताइए।' : 'नमस्ते! मैं आपकी क्या मदद कर सकता हूँ?',
        en: mode === 'registration' ? 'Hello! I will help you register. Please tell me your name.' : 'Hello! How can I help you today?',
        bn: mode === 'registration' ? 'নমস্কার! আমি আপনাকে নিবন্ধনে সাহায্য করব। আপনার নাম কি?' : 'নমস্কার! আমি আপনাকে কীভাবে সাহায্য করতে পারি?',
        te: mode === 'registration' ? 'నమస్కారం! నేను మీకు రిజిస్ట్రేషన్‌లో సహాయం చేస్తాను. మీ పేరు ఏమిటి?' : 'నమస్కారం! నేను మీకు ఎలా సహాయం చేయగలను?',
        mr: mode === 'registration' ? 'नमस्कार! मी तुम्हाला नोंदणीमध्ये मदत करेन. तुमचे नाव काय आहे?' : 'नमस्कार! मी तुम्हाला कशी मदत करू शकतो?',
        ta: mode === 'registration' ? 'வணக்கம்! நான் உங்களுக்கு பதிவு செய்ய உதவுவேன். உங்கள் பெயர் என்ன?' : 'வணக்கம்! நான் உங்களுக்கு எப்படி உதவ முடியும்?',
        gu: mode === 'registration' ? 'નમસ્તે! હું તમને નોંધણીમાં મદદ કરીશ. તમારું નામ શું છે?' : 'નમસ્તે! હું તમારી કેવી રીતે મદદ કરી શકું?',
        kn: mode === 'registration' ? 'ನಮಸ್ತೆ! ನೋಂದಣಿಗೆ ನಾನು ನಿಮಗೆ ಸಹಾಯ ಮಾಡುತ್ತೇನೆ. ನಿಮ್ಮ ಹೆಸರೇನು?' : 'ನಮಸ್ತೆ! ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?',
        ml: mode === 'registration' ? 'നമസ്തേ! രജിസ്റ്റർ ചെയ്യാൻ ഞാൻ നിങ്ങളെ സഹായിക്കാം. നിങ്ങളുടെ പേരെന്താണ്?' : 'നമസ്തേ! എനിക്ക് നിങ്ങളെ എങ്ങനെ സഹായിക്കാനാകും?',
        pa: mode === 'registration' ? 'ਸਤਿ ਸ਼੍ਰੀ ਅਕਾਲ! ਮੈਂ ਰਜਿਸਟਰ ਕਰਨ ਵਿੱਚ ਤੁਹਾਡੀ ਮਦਦ ਕਰਾਂਗਾ। ਕਿਰਪਾ ਕਰਕੇ ਆਪਣਾ ਨਾਮ ਦੱਸੋ।' : 'ਸਤਿ ਸ਼੍ਰੀ ਅਕਾਲ! ਮੈਂ ਅੱਜ ਤੁਹਾਡੀ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?',
        or: mode === 'registration' ? 'ନମସ୍କାର! ମୁଁ ଆପଣଙ୍କୁ ପଞ୍ଜିକରଣ କରିବାରେ ସାହାଯ୍ୟ କରିବି | ଦୟାକରି ଆପଣଙ୍କ ନାମ କୁହନ୍ତୁ |' : 'ନମସ୍କାର! ମୁଁ ଆପଣଙ୍କୁ କିପରି ସାହାଯ୍ୟ କରିପାରିବି?',
        as: mode === 'registration' ? 'নমস্কাৰ! মই আপোনাক পঞ্জীয়ন কৰাত সহায় কৰিম। অনুগ্ৰহ কৰি আপোনাৰ নাম কওক।' : 'নমস্কাৰ! মই আপোনাক কেনেকৈ সহায় কৰিব পাৰোঁ?',
        ur: mode === 'registration' ? 'ہیلو! میں آپ کو رجسٹر کرنے میں مدد کروں گا۔ براہ کرم اپنا نام بتائیں۔' : 'ہیلو! آج میں آپ کی کس طرح مدد کر سکتا ہوں?'
      };
      
      const greeting = greetings[i18n.language] || greetings.hi;
      setMessages([{ role: 'assistant', content: greeting }]);
      setInitialized(true);
    }
  }, [i18n.language, mode, initialized, messages.length]);

  const toggleMode = (newMode) => {
    setMode(newMode);
    setMessages([]); // Clear chat history when switching mode
    setRegistrationComplete(false);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/chatbot/conversation`, {
        session_id: sessionId,
        message: userMessage,
        language: i18n.language,
        mode: mode
      });

      setMessages(prev => [...prev, { role: 'assistant', content: response.data.response }]);

      // Check if registration is complete (only applicable in registration mode)
      if (mode === 'registration') {
        const responseText = response.data.response.toLowerCase();
        if (responseText.includes('complete') || responseText.includes('पूर्ण') || responseText.includes('সফল') || responseText.includes('പൂർത്തിയായി')) {
          setRegistrationComplete(true);
          // Automatically trigger auto login
          setTimeout(completeRegistration, 2000); 
        }
      }
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: t('errorProcessing') || 'Sorry, something went wrong. Please try again.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const completeRegistration = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/chatbot/complete-registration?session_id=${sessionId}`);
      localStorage.setItem('token', response.data.token);
      onSuccess();
    } catch (error) {
      console.error(error);
      alert(t('registrationError') || 'Could not auto-login. Please use manual login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col h-[85vh] max-h-[800px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-saffron to-orange-600 text-white p-6 rounded-t-2xl flex justify-between items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -translate-y-16 translate-x-16 blur-2xl"></div>
          
          <div className="relative z-10 w-full">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <span>{t('signupChatbot') || "Chat Assistant"}</span>
                </h2>
                <p className="text-sm opacity-90">{t('conversationalRegistration') || "Talk to us to get started"}</p>
              </div>
              <button
                onClick={onClose}
                data-testid="close-chatbot-modal"
                className="text-white hover:bg-white/20 p-2 rounded-full transition-colors self-start"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Mode Toggle Tabs */}
            <div className="flex bg-white/20 p-1 rounded-xl w-full max-w-sm">
              <button
                onClick={() => toggleMode('registration')}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg flex justify-center items-center gap-2 transition-all ${mode === 'registration' ? 'bg-white text-saffron shadow-md' : 'text-white hover:bg-white/10'}`}
              >
                <UserPlus size={16} />
                {t('modeRegistration') || "Register"}
              </button>
              <button
                onClick={() => toggleMode('help')}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg flex justify-center items-center gap-2 transition-all ${mode === 'help' ? 'bg-white text-saffron shadow-md' : 'text-white hover:bg-white/10'}`}
              >
                <HelpCircle size={16} />
                {t('modeHelp') || "Help/Support"}
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gray-50/50 relative">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl md:text-md text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-saffron to-orange-500 text-white rounded-br-sm'
                    : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white p-4 rounded-2xl rounded-bl-sm shadow-sm border border-gray-100 inline-block">
                <div className="flex space-x-2 items-center h-4">
                  <div className="w-2 h-2 bg-saffron/60 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-saffron/60 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                  <div className="w-2 h-2 bg-saffron/60 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={sendMessage} className="p-4 bg-white border-t border-gray-100">
          <div className="flex space-x-2 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={mode === 'registration' ? (t('typeYourAnswer') || "Type your answer...") : (t('askQuestion') || "Ask me anything...")}
              data-testid="chatbot-input"
              disabled={registrationComplete}
              className="flex-1 px-5 py-3.5 bg-gray-50 border border-gray-200 text-gray-800 rounded-full focus:ring-2 focus:ring-saffron/20 focus:border-saffron focus:bg-white outline-none transition-all placeholder-gray-400"
            />
            <button
              type="submit"
              disabled={loading || !input.trim() || registrationComplete}
              data-testid="chatbot-send-button"
              className="bg-saffron text-white p-3.5 rounded-full hover:bg-orange-600 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center shadow-md hover:shadow-lg disabled:shadow-none"
            >
              <Send className="w-5 h-5 ml-0.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChatbotSignup;
