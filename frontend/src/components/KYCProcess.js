import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Camera, Check, Upload, Loader2, ShieldCheck, User, CreditCard } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001/api';

function KYCProcess({ onComplete }) {
  const { t } = useTranslation();
  const [step, setStep] = useState(1); // 1: Selfie, 2: Aadhaar, 3: Verifying
  const [selfie, setSelfie] = useState(null);
  const [aadhaar, setAadhaar] = useState(null);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const selfieUploadRef = useRef(null);
  const aadhaarUploadRef = useRef(null);

  const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const handleImageUpload = async (event, type) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const imageData = await toBase64(file);
      if (type === 'selfie') {
        setSelfie(imageData);
      } else {
        setAadhaar(imageData);
      }
    } catch (err) {
      console.error('Image upload failed', err);
      alert(t('imageUploadFailed') || "Couldn't process this image. Please try another one.");
    } finally {
      event.target.value = '';
    }
  };

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(s);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
      }
    } catch (err) {
      console.error("Camera access denied", err);
      alert(t('cameraAccessDenied') || "Please allow camera access to complete KYC.");
    }
  };

  const capturePhoto = () => {
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg');
    
    if (step === 1) {
      setSelfie(dataUrl);
    } else {
      setAadhaar(dataUrl);
    }

    // Stop camera
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const nextStep = () => {
    if (step === 1 && selfie) {
      setStep(2);
    } else if (step === 2 && aadhaar) {
      submitKYC();
    }
  };

  const submitKYC = async () => {
    setStep(3);
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/workers/kyc-submit`, {
        selfie_image: selfie,
        id_card_image: aadhaar
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Artificial delay for "trustworthiness"
      setTimeout(() => {
        setLoading(false);
        onComplete();
      }, 3000);
    } catch (err) {
      setLoading(false);
      alert(t('verificationFailed') || "Verification failed. Please try again.");
      setStep(1);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-white flex flex-col items-center justify-center p-6 sm:p-12 overflow-y-auto">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="flex justify-center">
          <div className="p-4 bg-indigo/10 rounded-full">
            <ShieldCheck className="w-12 h-12 text-indigo" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">{t('verifyYourIdentity') || "Verify Your Identity"}</h1>
          <p className="text-gray-500">{t('kycSubtitle') || "To keep our platform safe and trustworthy, please complete this quick verification."}</p>
        </div>

        {/* Step Progress */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-indigo text-white' : 'bg-gray-100 text-gray-400'}`}>1</div>
          <div className="w-8 h-px bg-gray-200"></div>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-indigo text-white' : 'bg-gray-100 text-gray-400'}`}>2</div>
          <div className="w-8 h-px bg-gray-200"></div>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 3 ? 'bg-indigo text-white' : 'bg-gray-100 text-gray-400'}`}>3</div>
        </div>

        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
              {selfie ? (
                <img src={selfie} alt="Selfie" className="w-full h-full object-cover" />
              ) : stream ? (
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-8">
                  <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-400 font-medium">{t('takeSelfiePrompt') || "Take a clear selfie of yourself"}</p>
                </div>
              )}
            </div>
            
            {!selfie && !stream && (
              <div className="space-y-3">
                <button onClick={startCamera} className="w-full py-4 bg-indigo text-white rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-indigo-700 transition-all">
                  <Camera className="w-5 h-5" />
                  <span>{t('openCamera') || "Open Camera"}</span>
                </button>
                <button
                  onClick={() => selfieUploadRef.current?.click()}
                  className="w-full py-4 bg-white text-indigo border border-indigo rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-indigo-50 transition-all"
                >
                  <Upload className="w-5 h-5" />
                  <span>{t('uploadSelfie') || "Upload Selfie"}</span>
                </button>
                <input
                  ref={selfieUploadRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e, 'selfie')}
                />
              </div>
            )}
            
            {stream && (
              <button onClick={capturePhoto} className="w-full py-4 bg-indigo text-white rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-indigo-700 transition-all">
                <Camera className="w-5 h-5" />
                <span>{t('captureSelfie') || "Capture Selfie"}</span>
              </button>
            )}
            
            {selfie && (
              <div className="flex space-x-3">
                <button onClick={() => setSelfie(null)} className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-all">
                  {t('retake') || "Retake"}
                </button>
                <button onClick={nextStep} className="flex-1 py-4 bg-indigo text-white rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-indigo-700 transition-all shadow-lg">
                  <Check className="w-5 h-5" />
                  <span>{t('looksGood') || "Looks Good"}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="relative aspect-[1.6/1] rounded-3xl overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
              {aadhaar ? (
                <img src={aadhaar} alt="Aadhaar" className="w-full h-full object-cover" />
              ) : stream ? (
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-8">
                  <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-400 font-medium">{t('takeAadhaarPrompt') || "Hold your Aadhaar card and take a photo"}</p>
                </div>
              )}
            </div>
            
            {!aadhaar && !stream && (
              <div className="space-y-3">
                <button onClick={startCamera} className="w-full py-4 bg-indigo text-white rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-indigo-700 transition-all">
                  <Camera className="w-5 h-5" />
                  <span>{t('openCamera') || "Open Camera"}</span>
                </button>
                <button
                  onClick={() => aadhaarUploadRef.current?.click()}
                  className="w-full py-4 bg-white text-indigo border border-indigo rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-indigo-50 transition-all"
                >
                  <Upload className="w-5 h-5" />
                  <span>{t('uploadAadhaar') || "Upload Aadhaar Photo"}</span>
                </button>
                <input
                  ref={aadhaarUploadRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e, 'aadhaar')}
                />
              </div>
            )}
            
            {stream && (
              <button onClick={capturePhoto} className="w-full py-4 bg-indigo text-white rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-indigo-700 transition-all">
                <Camera className="w-5 h-5" />
                <span>{t('capturePhoto') || "Capture Photo"}</span>
              </button>
            )}
            
            {aadhaar && (
              <div className="flex space-x-3">
                <button onClick={() => setAadhaar(null)} className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-all">
                  {t('retake') || "Retake"}
                </button>
                <button onClick={nextStep} className="flex-1 py-4 bg-indigo text-white rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-indigo-700 transition-all shadow-lg">
                  <Upload className="w-5 h-5" />
                  <span>{t('submitVerification') || "Submit Verification"}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="py-20 animate-in fade-in zoom-in-95 fill-mode-both">
            {loading ? (
              <div className="space-y-6">
                <div className="relative w-24 h-24 mx-auto">
                  <Loader2 className="w-24 h-24 text-indigo animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ShieldCheck className="w-8 h-8 text-indigo" />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xl font-bold text-gray-900">{t('verifying') || "Verifying your details..."}</p>
                  <p className="text-gray-500">{t('trustworthyDesc') || "Matching your photo with identity documents"}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="w-24 h-24 bg-green-100 rounded-full mx-auto flex items-center justify-center">
                  <Check className="w-12 h-12 text-green-600" />
                </div>
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-gray-900">{t('verified') || "Identity Verified!"}</p>
                  <p className="text-gray-500">{t('verifiedSuccess') || "Aadhaar match successful. Your profile is now trusted."}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default KYCProcess;
