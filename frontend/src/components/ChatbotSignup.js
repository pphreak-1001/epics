import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Send } from 'lucide-react';
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

  // Initialize with language-specific greeting
  useEffect(() => {
    if (!initialized) {
      const greetings = {
        hi: 'नमस्ते! मैं आपकी मदद करूंगा। कृपया अपना नाम बताइए।',
        en: 'Hello! I will help you register. Please tell me your name.',
        bn: 'নমস্কার! আমি আপনার সাহায্যকারী। আপনার নাম কি?',
        te: 'నమస్కారం! నేను మీకు సహాయం చేస్తాను। మీ పేరు ఏమిటి?',
        mr: 'नमस्कार! मी तुम्हाला मदत करेन। तुमचे नाव काय आहे?',
        ta: 'வணக்கம்! நான் உங்களுக்கு உதவுவேன். உங்கள் பெயர் என்ன?',
        gu: 'નમસ્તે! હું તમારી મદદ કરીશ। તમારું નામ શું છે?',
      };
      
      const greeting = greetings[i18n.language] || greetings.hi;
      setMessages([{ role: 'assistant', content: greeting }]);
      setInitialized(true);
    }
  }, [i18n.language, initialized]);

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
        language: i18n.language
      });

      setMessages(prev => [...prev, { role: 'assistant', content: response.data.response }]);

      // Check if registration is complete
      const responseText = response.data.response.toLowerCase();
      if (responseText.includes('complete') || responseText.includes('पूर्ण') || responseText.includes('सफल')) {
        setRegistrationComplete(true);
      }
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, something went wrong. Please try again.' 
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
      alert(`Registration successful! Your temporary password is: ${response.data.temp_password}. Please save it.`);
      onSuccess();
    } catch (error) {
      alert('Could not complete registration. Please try again or use normal signup.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-saffron to-orange-600 text-white p-6 rounded-t-2xl flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">{t('signupChatbot')}</h2>
            <p className="text-sm opacity-90">{t('conversationalRegistration')}</p>
          </div>
          <button
            onClick={onClose}
            data-testid="close-chatbot-modal"
            className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] p-4 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-saffron text-white'
                    : 'bg-white text-gray-800 shadow-md'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white p-4 rounded-2xl shadow-md">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        {!registrationComplete ? (
          <form onSubmit={sendMessage} className="p-4 bg-white border-t">
            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t('typeYourAnswer')}
                data-testid="chatbot-input"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-saffron focus:border-transparent"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                data-testid="chatbot-send-button"
                className="bg-saffron text-white p-3 rounded-full hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6 bg-green-50 border-t border-green-200">
            <p className="text-center text-green-800 font-medium mb-4">
              ✅ {t('allInfoCollected')}
            </p>
            <button
              onClick={completeRegistration}
              disabled={loading}
              data-testid="complete-chatbot-registration"
              className="w-full bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition-all disabled:opacity-50"
            >
              {loading ? t('completing') : t('completeRegistration')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatbotSignup;
