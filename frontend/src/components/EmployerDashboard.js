import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { LogOut, Plus, Users, Briefcase, X, MapPin, DollarSign, Phone, Star, TrendingUp } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001/api';

function EmployerDashboard({ user, onLogout }) {
  const { t, i18n } = useTranslation();
  const [myJobs, setMyJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showJobForm, setShowJobForm] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobMatches, setJobMatches] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    job_type: 'Labour',
    description: '',
    village: '',
    district: '',
    state: '',
    daily_wage_offered: '',
    contact_number: '',
    required_skills: ''
  });

  useEffect(() => {
    fetchMyJobs();
  }, []);

  const fetchMyJobs = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${API_URL}/jobs/my-jobs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyJobs(response.data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    try {
      const jobData = {
        ...formData,
        daily_wage_offered: parseInt(formData.daily_wage_offered),
        required_skills: formData.required_skills.split(',').map(s => s.trim()).filter(Boolean)
      };

      await axios.post(`${API_URL}/jobs`, jobData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert(t('postJobSuccess'));
      setShowJobForm(false);
      setFormData({
        title: '',
        job_type: 'Labour',
        description: '',
        village: '',
        district: '',
        state: '',
        daily_wage_offered: '',
        contact_number: '',
        required_skills: ''
      });
      fetchMyJobs();
    } catch (error) {
      alert('Failed to post job. Please try again.');
    }
  };

  const viewMatches = async (job) => {
    setSelectedJob(job);
    const token = localStorage.getItem('token');
    
    try {
      const response = await axios.get(`${API_URL}/jobs/${job.job_id}/matches`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setJobMatches(response.data);
    } catch (error) {
      console.error('Error fetching matches:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo/10 to-purple/10">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-indigo border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl font-bold text-gray-700">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50">
      {/* Premium Header */}
      <header className="relative bg-gradient-to-r from-indigo via-purple-600 to-purple-700 text-white shadow-2xl overflow-hidden">
        {/* Decorative Pattern */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1767878516271-a4ab9a63288f?w=400&q=80')`,
            backgroundSize: '200px 200px'
          }}
        ></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* User Info */}
            <div className="text-center md:text-left">
              <div className="inline-flex items-center space-x-3 mb-3">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xl">
                  <Briefcase className="w-8 h-8 text-indigo" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-black" data-testid="employer-dashboard-title">
                    {t('welcomeEmployer')}, {user.name}! 👋
                  </h1>
                  <p className="text-white/90 text-lg font-medium">{t('employerDashboard')}</p>
                </div>
              </div>
              
              {/* Stats */}
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30">
                  <span className="font-bold">{myJobs.length}</span> {t('jobsPosted')}
                </div>
                <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30">
                  <span className="font-bold">{myJobs.reduce((sum, job) => sum + job.match_count, 0)}</span> {t('totalMatches')}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowJobForm(true)}
                data-testid="post-job-button"
                className="bg-white text-indigo font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>{t('postJob')}</span>
              </button>
              
              <button
                onClick={onLogout}
                data-testid="logout-button"
                className="bg-white/20 backdrop-blur-md hover:bg-white/30 px-6 py-3 rounded-xl transition-all flex items-center space-x-2 border border-white/30"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-bold">{t('logout')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Wave Decoration */}
        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 60" fill="none">
          <path d="M0 30C240 10 480 10 720 30C960 50 1200 50 1440 30V60H0V30Z" fill="white" fillOpacity="0.1"/>
        </svg>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* My Jobs */}
        <section>
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-black text-gray-900">{t('myJobs')}</h2>
            <div className="flex-1 h-1 bg-gradient-to-r from-indigo/30 to-transparent rounded"></div>
          </div>

          {myJobs.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-xl border-2 border-indigo/20 p-12 text-center">
              <div className="w-24 h-24 bg-indigo/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Briefcase className="w-12 h-12 text-indigo" />
              </div>
              <p className="text-xl text-gray-600 font-medium mb-6">{t('noJobsPosted')}</p>
              <button
                onClick={() => setShowJobForm(true)}
                className="bg-gradient-to-r from-indigo to-purple-600 text-white font-bold py-3 px-8 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all"
              >
                {t('postJob')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {myJobs.map((job, idx) => (
                <div key={idx} className="group bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-indigo">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-2xl font-black text-gray-900 group-hover:text-indigo transition-colors">
                        {job.title}
                      </h3>
                      <div className="bg-indigo/10 px-3 py-1 rounded-full">
                        <span className="text-sm font-bold text-indigo">{job.job_type}</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-4 line-clamp-2">{job.description}</p>
                    
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center space-x-2 text-gray-700">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <span className="text-sm">{job.village}, {job.district}, {job.state}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="text-xl font-black text-green-600">
                          ₹{job.daily_wage_offered}
                          <span className="text-sm font-normal text-gray-600">{t('perDay')}</span>
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-gray-700">
                        <Phone className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-medium">{job.contact_number}</span>
                      </div>
                    </div>

                    {job.match_count > 0 && (
                      <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl p-3 mb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Users className="w-5 h-5 text-green-600" />
                            <span className="font-bold text-green-800">
                              {job.match_count} {t('workerMatches')}
                            </span>
                          </div>
                          <Star className="w-5 h-5 text-green-600" />
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => viewMatches(job)}
                      data-testid={`view-matches-button-${idx}`}
                      className="w-full bg-gradient-to-r from-indigo to-purple-600 text-white font-bold py-3 px-6 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all flex items-center justify-center space-x-2"
                    >
                      <Users className="w-5 h-5" />
                      <span>{t('viewMatchedWorkers')}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Post Job Modal - Premium */}
      {showJobForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowJobForm(false)}>
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gradient-to-r from-indigo to-purple-600 text-white p-6 rounded-t-3xl z-10">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-black">{t('postJob')}</h2>
                <button onClick={() => setShowJobForm(false)} className="hover:bg-white/20 p-2 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">{t('jobTitle')} *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  data-testid="input-job-title"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo focus:ring-4 focus:ring-indigo/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">{t('jobType')} *</label>
                <select
                  name="job_type"
                  value={formData.job_type}
                  onChange={handleInputChange}
                  data-testid="select-job-type"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo focus:ring-4 focus:ring-indigo/20 transition-all"
                >
                  <option value="Mason">{t('mason')}</option>
                  <option value="Labour">{t('labour')}</option>
                  <option value="Plumber">{t('plumber')}</option>
                  <option value="Electrician">{t('electrician')}</option>
                  <option value="Painter">{t('painter')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">{t('description')} *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows="3"
                  data-testid="input-job-description"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo focus:ring-4 focus:ring-indigo/20 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">{t('village')} *</label>
                  <input
                    type="text"
                    name="village"
                    value={formData.village}
                    onChange={handleInputChange}
                    required
                    data-testid="input-job-village"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo focus:ring-4 focus:ring-indigo/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">{t('district')} *</label>
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    required
                    data-testid="input-job-district"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo focus:ring-4 focus:ring-indigo/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">{t('state')} *</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                    data-testid="input-job-state"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo focus:ring-4 focus:ring-indigo/20 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">{t('dailyWageOffered')} *</label>
                  <input
                    type="number"
                    name="daily_wage_offered"
                    value={formData.daily_wage_offered}
                    onChange={handleInputChange}
                    required
                    data-testid="input-job-wage"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo focus:ring-4 focus:ring-indigo/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">{t('contactNumber')} *</label>
                  <input
                    type="tel"
                    name="contact_number"
                    value={formData.contact_number}
                    onChange={handleInputChange}
                    required
                    data-testid="input-job-contact"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo focus:ring-4 focus:ring-indigo/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">{t('requiredSkills')}</label>
                <input
                  type="text"
                  name="required_skills"
                  value={formData.required_skills}
                  onChange={handleInputChange}
                  placeholder="e.g., Masonry, Brick laying"
                  data-testid="input-job-skills"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo focus:ring-4 focus:ring-indigo/20 transition-all"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  data-testid="submit-job-form"
                  className="flex-1 bg-gradient-to-r from-indigo to-purple-600 text-white font-bold py-4 px-6 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all"
                >
                  {t('postJob')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowJobForm(false)}
                  className="flex-1 bg-gray-200 text-gray-800 font-bold py-4 px-6 rounded-xl hover:bg-gray-300 transition-all"
                >
                  {t('cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Matches Modal - Premium */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedJob(null)}>
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gradient-to-r from-indigo to-purple-600 text-white p-6 rounded-t-3xl z-10">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-black">{t('matchedWorkersFor')}</h2>
                  <p className="text-white/90 text-lg">{selectedJob.title}</p>
                </div>
                <button onClick={() => setSelectedJob(null)} className="hover:bg-white/20 p-2 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {jobMatches.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">{t('noWorkersMatched')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {jobMatches.map((item, idx) => (
                    <div key={idx} className="bg-gradient-to-r from-green-50 to-white border-2 border-green-200 rounded-2xl p-6 hover:shadow-lg transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-black text-gray-900">{item.worker.name}</h3>
                          <p className="text-gray-600">{item.worker.job_type}</p>
                        </div>
                        <div className="bg-gradient-to-br from-green-400 to-green-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center space-x-2">
                          <Star className="w-4 h-4" />
                          <span className="font-black">{Math.round(item.match.match_score)}%</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-blue-600" />
                          <span>{item.worker.area}, {item.worker.district}, {item.worker.state}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <span className="font-bold">
                            {t('expectedWage')}: ₹{item.worker.expected_daily_wage}{t('perDay')}
                          </span>
                        </div>
                      </div>

                      <a 
                        href={`tel:${item.worker.phone_number}`}
                        className="mt-4 w-full bg-gradient-to-r from-indigo to-purple-600 text-white font-bold py-3 px-6 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all flex items-center justify-center space-x-2"
                      >
                        <Phone className="w-5 h-5" />
                        <span>{item.worker.phone_number}</span>
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployerDashboard;
