import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { LogOut, Briefcase, Bell, TrendingUp, MapPin, DollarSign, Phone, Award, Star } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001/api';

function WorkerDashboard({ user, onLogout }) {
  const { t, i18n } = useTranslation();
  const [matches, setMatches] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    try {
      const [matchesRes, notificationsRes] = await Promise.all([
        axios.get(`${API_URL}/workers/matches`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/notifications`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setMatches(matchesRes.data);
      setNotifications(notificationsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-saffron/10 to-heritage-green/10">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-saffron border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl font-bold text-gray-700">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-green-50">
      {/* Premium Header */}
      <header className="relative bg-gradient-to-r from-saffron via-orange-600 to-orange-700 text-white shadow-2xl overflow-hidden">
        {/* Decorative Pattern */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1767875548584-e8fb112afeb1?w=400&q=80')`,
            backgroundSize: '200px 200px'
          }}
        ></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* User Info */}
            <div className="text-center md:text-left">
              <div className="inline-flex items-center space-x-3 mb-3">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xl">
                  <Award className="w-8 h-8 text-saffron" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-black" data-testid="worker-dashboard-title">
                    {t('welcomeWorker')}, {user.name}! 🙏
                  </h1>
                  <p className="text-white/90 text-lg font-medium">{t('workerDashboard')}</p>
                </div>
              </div>
              
              {/* Stats Pills */}
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30">
                  <span className="font-bold">{matches.length}</span> {t('matchedJobs')}
                </div>
                <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30">
                  <span className="font-bold">{notifications.length}</span> {t('notifications')}
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              data-testid="logout-button"
              className="bg-white/20 backdrop-blur-md hover:bg-white/30 px-6 py-3 rounded-xl transition-all flex items-center space-x-2 border border-white/30 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-bold">{t('logout')}</span>
            </button>
          </div>
        </div>

        {/* Wave Decoration */}
        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 60" fill="none">
          <path d="M0 30C240 10 480 10 720 30C960 50 1200 50 1440 30V60H0V30Z" fill="white" fillOpacity="0.1"/>
          <path d="M0 45C240 35 480 35 720 45C960 55 1200 55 1440 45V60H0V45Z" fill="white" fillOpacity="0.05"/>
        </svg>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Job Matches - Premium Cards */}
        <section className="mb-12">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-saffron to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-black text-gray-900">{t('matchedJobs')}</h2>
            <div className="flex-1 h-1 bg-gradient-to-r from-saffron/30 to-transparent rounded"></div>
          </div>

          {matches.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-xl border-2 border-saffron/20 p-12 text-center">
              <div className="w-24 h-24 bg-saffron/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Briefcase className="w-12 h-12 text-saffron" />
              </div>
              <p className="text-xl text-gray-600 font-medium">{t('noMatchesYet')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {matches.map((item, idx) => (
                <div key={idx} className="group relative bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-heritage-green">
                  {/* Match Score Badge */}
                  <div className="absolute top-4 right-4 z-10">
                    <div className="bg-gradient-to-br from-green-400 to-green-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center space-x-2">
                      <Star className="w-4 h-4" />
                      <span className="font-black text-sm">{Math.round(item.match.match_score)}%</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="mb-4">
                      <h3 className="text-2xl font-black text-gray-900 mb-2 group-hover:text-heritage-green transition-colors">
                        {item.job.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed line-clamp-2">
                        {item.job.description}
                      </p>
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M7 2a1 1 0 011 1v1h3a1 1 0 110 2H9.578a18.87 18.87 0 01-1.724 4.78c.29.354.596.696.914 1.026a1 1 0 11-1.44 1.389c-.188-.196-.373-.396-.554-.6a19.098 19.098 0 01-3.107 3.567 1 1 0 01-1.334-1.49 17.087 17.087 0 003.13-3.733 18.992 18.992 0 01-1.487-2.494 1 1 0 111.79-.89c.234.47.489.928.764 1.372.417-.934.752-1.913.997-2.927H3a1 1 0 110-2h3V3a1 1 0 011-1zm6 6a1 1 0 01.894.553l2.991 5.982a.869.869 0 01.02.037l.99 1.98a1 1 0 11-1.79.895L15.383 16h-4.764l-.724 1.447a1 1 0 11-1.788-.894l.99-1.98.019-.038 2.99-5.982A1 1 0 0113 8zm-1.382 6h2.764L13 12.236 11.618 14z" clipRule="evenodd" />
                          </svg>
                          {t('originalLanguage') || 'Original Language'}
                        </span>
                      </div>
                    </div>

                    {/* Info Pills */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 text-gray-700">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <MapPin className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="font-medium">{item.job.village}, {item.job.district}, {item.job.state}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <DollarSign className="w-4 h-4 text-green-600" />
                        </div>
                        <span className="text-2xl font-black text-green-600">
                          ₹{item.job.daily_wage_offered}
                          <span className="text-sm font-normal text-gray-600">{t('perDay')}</span>
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-gray-700">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Phone className="w-4 h-4 text-purple-600" />
                        </div>
                        <span className="font-bold">{t('contact')}: {item.job.contact_number}</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <a 
                      href={`tel:${item.job.contact_number}`}
                      className="mt-6 w-full bg-gradient-to-r from-heritage-green to-green-600 text-white font-bold py-3 px-6 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all flex items-center justify-center space-x-2"
                    >
                      <Phone className="w-5 h-5" />
                      <span>{t('callEmployer')}</span>
                    </a>
                  </div>

                  {/* Decorative Corner */}
                  <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-saffron/10 to-transparent rounded-br-full"></div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Notifications - Premium Timeline */}
        <section>
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-black text-gray-900">{t('notifications')}</h2>
            <div className="flex-1 h-1 bg-gradient-to-r from-indigo/30 to-transparent rounded"></div>
          </div>

          {notifications.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-xl border-2 border-indigo/20 p-12 text-center">
              <div className="w-24 h-24 bg-indigo/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bell className="w-12 h-12 text-indigo" />
              </div>
              <p className="text-xl text-gray-600 font-medium">{t('noNotifications')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notif, idx) => (
                <div key={idx} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all border-l-4 border-saffron p-6 flex items-start space-x-4">
                  <div className="w-12 h-12 bg-saffron/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-6 h-6 text-saffron" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-800 leading-relaxed font-medium">{notif.message}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      {new Date(notif.sent_at).toLocaleString(i18n.language === 'hi' ? 'hi-IN' : 'en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default WorkerDashboard;
