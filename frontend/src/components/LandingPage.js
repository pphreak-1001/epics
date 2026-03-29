import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Briefcase, Target, MessageSquare, Mic, FileText, Phone, Sparkles, Award, TrendingUp } from 'lucide-react';
import AuthModal from './AuthModal';
import ChatbotSignup from './ChatbotSignup';
import AudioSignup from './AudioSignup';

function LandingPage({ onLogin }) {
  const { t } = useTranslation();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [showAudioSignup, setShowAudioSignup] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Hero Section - Premium with Real Images */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background with Parallax Effect */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1706715201231-b703e7df3395?w=1080&q=75')`,
            transform: `translateY(${scrollY * 0.5}px)`,
            filter: 'brightness(0.3)'
          }}
        ></div>
        
        {/* Gradient Overlay with Indian Colors */}
        <div className="absolute inset-0 bg-gradient-to-br from-saffron/90 via-orange-600/85 to-heritage-green/90"></div>
        
        {/* Mandala Pattern Overlay */}
        <div 
          className="absolute inset-0 opacity-20 mix-blend-overlay"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1765444034496-5f23e108d810?w=400&q=60')`,
            backgroundSize: '400px 400px',
            backgroundRepeat: 'repeat'
          }}
        ></div>

        {/* Animated Geometric Shapes */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-heritage-green/20 rounded-full blur-3xl animate-pulse-slow-delayed"></div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Text Content */}
            <div className="text-white">
              {/* Premium Badge */}
              <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-md px-6 py-3 rounded-full mb-6 border border-white/30">
                <Sparkles className="w-5 h-5 text-yellow-300" />
                <span className="text-sm font-semibold tracking-wide">भारत का #1 रोज़गार मंच</span>
              </div>

              <h1 
                className="text-5xl md:text-7xl font-black mb-6 leading-tight"
                data-testid="hero-title"
                style={{
                  textShadow: '2px 2px 4px rgba(0,0,0,0.3), 0 0 40px rgba(255,153,51,0.5)'
                }}
              >
                <span className="block text-white">{t('heroTitle').split(',')[0]},</span>
                <span className="block bg-gradient-to-r from-yellow-200 via-white to-yellow-200 bg-clip-text text-transparent animate-shimmer">
                  {t('heroTitle').split(',')[1]}
                </span>
              </h1>

              <p className="text-xl md:text-2xl mb-4 text-white/95 font-medium leading-relaxed">
                {t('heroSubtitle')}
              </p>
              
              <p className="text-lg text-white/80 mb-10 max-w-xl">
                {t('subtitle')}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4 mb-10">
                <button
                  onClick={() => setShowAuthModal(true)}
                  data-testid="get-started-button"
                  className="group relative px-8 py-4 bg-white text-saffron font-bold text-lg rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-3"
                >
                  <span>{t('getStarted')}</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </button>
                
                <button
                  onClick={() => setShowChatbot(true)}
                  className="px-8 py-4 bg-white/10 backdrop-blur-md text-white font-bold text-lg rounded-full border-2 border-white/50 hover:bg-white/20 transition-all duration-300"
                >
                  💬 {t('signupChatbot')}
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-black text-white">50K+</div>
                  <div className="text-sm text-white/80">Active Workers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-black text-white">10K+</div>
                  <div className="text-sm text-white/80">Jobs Posted</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-black text-white">15+</div>
                  <div className="text-sm text-white/80">Languages</div>
                </div>
              </div>
            </div>

            {/* Right Side - Worker Image Card */}
            <div className="relative hidden lg:block">
              <div className="relative">
                {/* Floating Card with Real Worker Image */}
                <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-4 border border-white/20 shadow-2xl transform rotate-3 hover:rotate-0 transition-all duration-500">
                  <img 
                    src="https://images.unsplash.com/photo-1567230594460-36c35af65bb0?w=500&q=70" 
                    alt="Indian Worker"
                    className="rounded-2xl w-full h-96 object-cover"
                  />
                  <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-4 shadow-2xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-saffron to-orange-600 rounded-full flex items-center justify-center">
                        <Award className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">Verified Workers</div>
                        <div className="text-sm text-gray-600">100% Trusted</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Decorative Elements */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-yellow-400 rounded-full opacity-20 blur-2xl animate-pulse"></div>
                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-heritage-green rounded-full opacity-20 blur-2xl animate-pulse-delayed"></div>
              </div>
            </div>
          </div>

          {/* Toll-Free Section */}
          <div className="mt-16 max-w-md mx-auto lg:mx-0">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/30 shadow-2xl">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center animate-bounce-slow">
                  <Phone className="w-8 h-8 text-saffron" />
                </div>
                <div className="flex-1">
                  <p className="text-white/90 font-medium mb-1">{t('tollFreeText')}</p>
                  <p className="text-2xl font-black text-white tracking-wider">1800-ROZGAR</p>
                  <p className="text-xs text-white/70">{t('callForRegistration')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-8 h-12 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
            <div className="w-2 h-3 bg-white rounded-full animate-scroll"></div>
          </div>
        </div>
      </section>

      {/* Three Signup Methods - Premium Cards */}
      <section className="py-24 bg-gradient-to-br from-gray-50 via-orange-50 to-green-50 relative overflow-hidden">
        {/* Background Pattern */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1767875548584-e8fb112afeb1?w=200&q=50')`,
            backgroundSize: '200px 200px'
          }}
        ></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              <span className="bg-gradient-to-r from-saffron to-heritage-green text-white px-6 py-2 rounded-full text-sm font-bold">
                3 EASY WAYS
              </span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-4">
              <span className="bg-gradient-to-r from-saffron via-orange-600 to-heritage-green bg-clip-text text-transparent">
                {t('signupTitle')}
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">{t('signupChooseMethod')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Normal Signup */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-heritage-green to-green-600 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-all"></div>
              <div className="relative bg-white rounded-3xl p-8 shadow-2xl border-2 border-heritage-green/20 hover:border-heritage-green transform hover:-translate-y-4 transition-all duration-300">
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                  <div className="w-16 h-16 bg-gradient-to-br from-heritage-green to-green-600 rounded-2xl shadow-xl flex items-center justify-center rotate-12 group-hover:rotate-0 transition-all">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="mt-8 text-center">
                  <h3 className="text-2xl font-black text-gray-900 mb-3">{t('signupNormal')}</h3>
                  <p className="text-gray-600 mb-6 text-lg">{t('signupNormalDesc')}</p>
                  <button
                    onClick={() => setShowAuthModal(true)}
                    data-testid="normal-signup-button"
                    className="w-full bg-gradient-to-r from-heritage-green to-green-600 text-white font-bold py-4 px-6 rounded-xl hover:shadow-2xl transform hover:scale-105 transition-all"
                  >
                    {t('register')} →
                  </button>
                </div>
              </div>
            </div>

            {/* Chatbot Signup */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-saffron to-orange-600 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-all"></div>
              <div className="relative bg-white rounded-3xl p-8 shadow-2xl border-2 border-saffron/20 hover:border-saffron transform hover:-translate-y-4 transition-all duration-300">
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                  <div className="w-16 h-16 bg-gradient-to-br from-saffron to-orange-600 rounded-2xl shadow-xl flex items-center justify-center rotate-12 group-hover:rotate-0 transition-all">
                    <MessageSquare className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="mt-8 text-center">
                  <div className="inline-block bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full mb-2">
                    AI POWERED
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-3">{t('signupChatbot')}</h3>
                  <p className="text-gray-600 mb-6 text-lg">{t('signupChatbotDesc')}</p>
                  <button
                    onClick={() => setShowChatbot(true)}
                    data-testid="chatbot-signup-button"
                    className="w-full bg-gradient-to-r from-saffron to-orange-600 text-white font-bold py-4 px-6 rounded-xl hover:shadow-2xl transform hover:scale-105 transition-all"
                  >
                    {t('getStarted')} 🤖
                  </button>
                </div>
              </div>
            </div>

            {/* Audio Signup */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo to-purple-600 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-all"></div>
              <div className="relative bg-white rounded-3xl p-8 shadow-2xl border-2 border-indigo/20 hover:border-indigo transform hover:-translate-y-4 transition-all duration-300">
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo to-purple-600 rounded-2xl shadow-xl flex items-center justify-center rotate-12 group-hover:rotate-0 transition-all">
                    <Mic className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="mt-8 text-center">
                  <div className="inline-block bg-purple-100 text-purple-800 text-xs font-bold px-3 py-1 rounded-full mb-2">
                    VOICE ENABLED
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-3">{t('signupAudio')}</h3>
                  <p className="text-gray-600 mb-6 text-lg">{t('signupAudioDesc')}</p>
                  <button
                    onClick={() => setShowAudioSignup(true)}
                    data-testid="audio-signup-button"
                    className="w-full bg-gradient-to-r from-indigo to-purple-600 text-white font-bold py-4 px-6 rounded-xl hover:shadow-2xl transform hover:scale-105 transition-all"
                  >
                    {t('getStarted')} 🎤
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section with Real Images */}
      <section className="py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
        {/* Background Worker Image with Overlay */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1764116858643-8519de606248?w=1080&q=75')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        ></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-6xl font-black text-center mb-20">
            <span className="bg-gradient-to-r from-saffron via-orange-400 to-heritage-green bg-clip-text text-transparent">
              {t('features')}
            </span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="w-40 h-40 mx-auto rounded-3xl overflow-hidden border-4 border-heritage-green shadow-2xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <img 
                    src="https://images.unsplash.com/photo-1524314010015-136ee8ae1ab3?w=400&q=80" 
                    alt="Worker"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-heritage-green rounded-full p-4 shadow-xl">
                  <Users className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-black mb-4">{t('featureWorker')}</h3>
              <p className="text-gray-300 text-lg leading-relaxed">{t('featureWorkerDesc')}</p>
            </div>

            <div className="text-center group">
              <div className="relative mb-8">
                <div className="w-40 h-40 mx-auto rounded-3xl overflow-hidden border-4 border-saffron shadow-2xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <img 
                    src="https://images.unsplash.com/photo-1564507592333-c60657eea523?w=400&q=80" 
                    alt="Employer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-saffron rounded-full p-4 shadow-xl">
                  <Briefcase className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-black mb-4">{t('featureEmployer')}</h3>
              <p className="text-gray-300 text-lg leading-relaxed">{t('featureEmployerDesc')}</p>
            </div>

            <div className="text-center group">
              <div className="relative mb-8">
                <div className="w-40 h-40 mx-auto rounded-3xl overflow-hidden border-4 border-indigo shadow-2xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <img 
                    src="https://images.unsplash.com/photo-1712210332568-37231ad76a7f?w=400&q=80" 
                    alt="Matching"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-indigo rounded-full p-4 shadow-xl">
                  <Target className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-black mb-4">{t('featureMatching')}</h3>
              <p className="text-gray-300 text-lg leading-relaxed">{t('featureMatchingDesc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white py-16 border-t-4 border-saffron relative overflow-hidden">
        {/* Mandala Background */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1767878516271-a4ab9a63288f?w=300&q=50')`,
            backgroundSize: '300px 300px'
          }}
        ></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-5xl font-black mb-4 bg-gradient-to-r from-saffron via-white to-heritage-green bg-clip-text text-transparent">
              {t('appName')}
            </h3>
            <p className="text-2xl text-gray-400 mb-10 font-semibold">{t('tagline')}</p>
            
            <div className="flex justify-center space-x-8 mb-10">
              <a href="#" className="text-gray-400 hover:text-saffron transition-colors text-lg font-medium transform hover:scale-110">
                {t('aboutUs')}
              </a>
              <a href="#" className="text-gray-400 hover:text-saffron transition-colors text-lg font-medium transform hover:scale-110">
                {t('contact')}
              </a>
              <a href="#" className="text-gray-400 hover:text-saffron transition-colors text-lg font-medium transform hover:scale-110">
                {t('helpline')}
              </a>
            </div>
            
            <div className="border-t border-gray-700 pt-8 mb-6">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="h-1 w-16 bg-saffron rounded"></div>
                <div className="h-1 w-16 bg-white rounded"></div>
                <div className="h-1 w-16 bg-heritage-green rounded"></div>
              </div>
              <p className="text-gray-500 mb-3 text-lg">{t('madeWithLove')}</p>
              <p className="text-gray-600">{t('copyright')}</p>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => {
            setShowAuthModal(false);
            onLogin();
          }}
        />
      )}

      {showChatbot && (
        <ChatbotSignup
          onClose={() => setShowChatbot(false)}
          onSuccess={() => {
            setShowChatbot(false);
            onLogin();
          }}
        />
      )}

      {showAudioSignup && (
        <AudioSignup
          onClose={() => setShowAudioSignup(false)}
          onSuccess={() => {
            setShowAudioSignup(false);
            onLogin();
          }}
        />
      )}
    </div>
  );
}

export default LandingPage;
