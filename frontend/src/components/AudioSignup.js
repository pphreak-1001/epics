import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Mic, Square, Check, RefreshCw, Loader2 } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001/api';

function AudioSignup({ onClose, onSuccess }) {
  const { t, i18n } = useTranslation();
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [error, setError] = useState('');
  const [audioBlob, setAudioBlob] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    setError('');
    setTranscription('');
    setParsedData(null);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      // Determine best supported MIME type
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') 
        ? 'audio/webm' 
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : 'audio/ogg';
      
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType });
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        setAudioBlob(audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        
        // Process the audio
        await processAudio(audioBlob);
      };

      mediaRecorderRef.current.start(1000); // Collect data every second
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError(t('microphoneAccessError') || 'Unable to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const processAudio = async (blob) => {
    setLoading(true);
    setProcessingStep(t('transcribingAudio') || 'Transcribing audio...');

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', blob, 'recording.webm');
      
      // Step 1: Transcribe audio
      const transcribeResponse = await axios.post(
        `${API_URL}/audio/transcribe?language=${i18n.language}`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 60000 // 60 second timeout for transcription
        }
      );

      const transcribedText = transcribeResponse.data.transcribed_text;
      setTranscription(transcribedText);
      
      setProcessingStep(t('parsingDetails') || 'Extracting your details...');

      // Step 2: Parse registration details from transcription
      const parseResponse = await axios.post(`${API_URL}/audio/parse-registration`, {
        text: transcribedText,
        language: i18n.language
      });

      setParsedData(parseResponse.data.parsed_data);
      setProcessingStep('');
      
    } catch (err) {
      console.error('Processing error:', err);
      setError(t('processingError') || 'Error processing audio. Please try again.');
    } finally {
      setLoading(false);
      setProcessingStep('');
    }
  };

  const completeRegistration = async () => {
    if (!parsedData || !parsedData.name || !parsedData.phone_number) {
      setError(t('incompleteData') || 'Please provide all required information. Try recording again.');
      return;
    }

    setLoading(true);
    try {
      // Create user account
      const registerResponse = await axios.post(`${API_URL}/auth/register`, {
        name: parsedData.name,
        phone_number: parsedData.phone_number,
        password: parsedData.phone_number.slice(-6), // Last 6 digits as temp password
        role: 'worker',
        language: i18n.language
      });

      localStorage.setItem('token', registerResponse.data.token);

      // Create worker profile if we have the data
      if (parsedData.area || parsedData.district) {
        await axios.post(`${API_URL}/workers/profile`, {
          user_id: registerResponse.data.user_id,
          name: parsedData.name,
          phone_number: parsedData.phone_number,
          area: parsedData.area || '',
          district: parsedData.district || '',
          state: parsedData.state || '',
          job_type: parsedData.job_type || 'Labour',
          expected_daily_wage: parsedData.expected_daily_wage || 500,
          skills: [],
          language: i18n.language
        }, {
          headers: { Authorization: `Bearer ${registerResponse.data.token}` }
        });
      }

      const tempPassword = parsedData.phone_number.slice(-6);
      alert(`${t('registrationSuccess') || 'Registration successful!'}\n${t('tempPasswordIs') || 'Your temporary password is:'} ${tempPassword}\n${t('pleaseRemember') || 'Please remember it.'}`);
      
      onSuccess();
    } catch (err) {
      console.error('Registration error:', err);
      if (err.response?.data?.detail?.includes('already registered')) {
        setError(t('phoneAlreadyRegistered') || 'This phone number is already registered. Please login instead.');
      } else {
        setError(t('registrationError') || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const resetRecording = () => {
    setTranscription('');
    setParsedData(null);
    setAudioBlob(null);
    setError('');
    setRecordingTime(0);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Language-specific instructions
  const instructions = {
    hi: ['आपका नाम', 'आपका गाँव/इलाका', 'आपका जिला और राज्य', 'आप जो काम करते हैं', 'अपेक्षित दैनिक मजदूरी', 'आपका फोन नंबर'],
    en: ['Your name', 'Your village/area', 'Your district and state', 'Type of work you do', 'Expected daily wage', 'Your phone number'],
    bn: ['আপনার নাম', 'আপনার গ্রাম/এলাকা', 'আপনার জেলা এবং রাজ্য', 'আপনি যে ধরনের কাজ করেন', 'প্রত্যাশিত দৈনিক মজুরি', 'আপনার ফোন নম্বর'],
    te: ['మీ పేరు', 'మీ గ్రామం/ప్రాంతం', 'మీ జిల్లా మరియు రాష్ట్రం', 'మీరు చేసే పని', 'అంచనా రోజువారీ వేతనం', 'మీ ఫోన్ నంబర్'],
    mr: ['तुमचे नाव', 'तुमचे गाव/क्षेत्र', 'तुमचा जिल्हा आणि राज्य', 'तुम्ही जे काम करता', 'अपेक्षित दैनिक मजुरी', 'तुमचा फोन नंबर'],
    ta: ['உங்கள் பெயர்', 'உங்கள் கிராமம்/பகுதி', 'உங்கள் மாவட்டம் மற்றும் மாநிலம்', 'நீங்கள் செய்யும் வேலை', 'எதிர்பார்க்கப்படும் தினசரி ஊதியம்', 'உங்கள் தொலைபேசி எண்']
  };

  const currentInstructions = instructions[i18n.language] || instructions.hi;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo to-purple-600 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold" data-testid="audio-signup-title">{t('signupAudio')}</h2>
              <p className="text-sm opacity-90">{t('signupAudioDesc') || 'Speak your details'}</p>
            </div>
            <button 
              onClick={onClose} 
              data-testid="close-audio-modal"
              className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Error Display */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
              <p className="font-medium">{error}</p>
            </div>
          )}

          {/* Instructions - Show before recording */}
          {!transcription && !loading && (
            <div className="mb-6">
              <p className="text-gray-700 mb-4 font-medium text-lg text-center">
                {t('clickMicAndSpeak') || 'Click the microphone and speak:'}
              </p>
              <ul className="text-gray-600 space-y-2 bg-gray-50 p-4 rounded-xl">
                {currentInstructions.map((item, idx) => (
                  <li key={idx} className="flex items-center space-x-2">
                    <span className="w-6 h-6 bg-indigo/10 text-indigo rounded-full flex items-center justify-center text-sm font-bold">{idx + 1}</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recording Button */}
          {!transcription && !loading && (
            <div className="text-center mb-6">
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  data-testid="start-recording-button"
                  className="w-32 h-32 bg-gradient-to-br from-indigo to-purple-600 rounded-full flex items-center justify-center mx-auto hover:scale-105 transition-all shadow-2xl"
                >
                  <Mic className="w-16 h-16 text-white" />
                </button>
              ) : (
                <div className="space-y-4">
                  <button
                    onClick={stopRecording}
                    data-testid="stop-recording-button"
                    className="w-32 h-32 bg-red-500 rounded-full flex items-center justify-center mx-auto animate-pulse shadow-2xl"
                  >
                    <Square className="w-12 h-12 text-white" />
                  </button>
                  <div className="text-red-600 font-bold text-lg">
                    {t('recordingSpeakNow') || 'Recording... Speak now!'}
                  </div>
                  <div className="text-2xl font-mono text-gray-700">{formatTime(recordingTime)}</div>
                  <p className="text-sm text-gray-500">{t('clickToStop') || 'Click the button to stop recording'}</p>
                </div>
              )}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-8">
              <div className="w-20 h-20 mx-auto mb-4 relative">
                <Loader2 className="w-20 h-20 text-indigo animate-spin" />
              </div>
              <p className="text-lg text-gray-700 font-medium">{processingStep}</p>
            </div>
          )}

          {/* Transcription Result */}
          {transcription && !loading && (
            <div className="space-y-4">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-2 font-medium">{t('transcribedText') || 'Transcribed Text'}:</p>
                <p className="text-gray-800">{transcription}</p>
              </div>

              {/* Parsed Data */}
              {parsedData && Object.keys(parsedData).some(key => parsedData[key]) && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <p className="text-sm text-green-700 mb-3 font-medium flex items-center">
                    <Check className="w-4 h-4 mr-2" />
                    {t('extractedDetails') || 'Extracted Details'}:
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {parsedData.name && (
                      <div><span className="text-gray-500">{t('name')}:</span> <span className="font-medium">{parsedData.name}</span></div>
                    )}
                    {parsedData.area && (
                      <div><span className="text-gray-500">{t('area')}:</span> <span className="font-medium">{parsedData.area}</span></div>
                    )}
                    {parsedData.district && (
                      <div><span className="text-gray-500">{t('district')}:</span> <span className="font-medium">{parsedData.district}</span></div>
                    )}
                    {parsedData.state && (
                      <div><span className="text-gray-500">{t('state')}:</span> <span className="font-medium">{parsedData.state}</span></div>
                    )}
                    {parsedData.job_type && (
                      <div><span className="text-gray-500">{t('jobType')}:</span> <span className="font-medium">{parsedData.job_type}</span></div>
                    )}
                    {parsedData.expected_daily_wage && (
                      <div><span className="text-gray-500">{t('expectedWage')}:</span> <span className="font-medium">₹{parsedData.expected_daily_wage}</span></div>
                    )}
                    {parsedData.phone_number && (
                      <div><span className="text-gray-500">{t('phoneNumber')}:</span> <span className="font-medium">{parsedData.phone_number}</span></div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={resetRecording}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center space-x-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  <span>{t('tryAgain') || 'Try Again'}</span>
                </button>
                <button
                  onClick={completeRegistration}
                  disabled={loading || !parsedData?.name || !parsedData?.phone_number}
                  data-testid="complete-audio-registration"
                  className="flex-1 bg-gradient-to-r from-indigo to-purple-600 text-white font-bold py-3 px-4 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <Check className="w-5 h-5" />
                  <span>{t('completeRegistration') || 'Complete Registration'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AudioSignup;
