import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001/api';

function AuthModal({ onClose, onSuccess }) {
  const { t, i18n } = useTranslation();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    password: '',
    role: 'worker',
    area: '',
    district: '',
    state: '',
    job_type: 'Labour',
    expected_daily_wage: '',
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        // Login
        const response = await axios.post(`${API_URL}/auth/login`, {
          phone_number: formData.phone_number,
          password: formData.password,
        });
        localStorage.setItem('token', response.data.token);
        onSuccess();
      } else {
        // Register
        const registerData = {
          name: formData.name,
          phone_number: formData.phone_number,
          password: formData.password,
          role: formData.role,
          language: i18n.language,
        };
        
        const response = await axios.post(`${API_URL}/auth/register`, registerData);
        localStorage.setItem('token', response.data.token);
        
        // If worker, create profile
        if (formData.role === 'worker') {
          await axios.post(
            `${API_URL}/workers/profile`,
            {
              user_id: response.data.user_id,
              name: formData.name,
              phone_number: formData.phone_number,
              area: formData.area,
              district: formData.district,
              state: formData.state,
              job_type: formData.job_type,
              expected_daily_wage: parseInt(formData.expected_daily_wage),
              skills: [],
              language: i18n.language,
            },
            { headers: { Authorization: `Bearer ${response.data.token}` } }
          );
        }
        
        onSuccess();
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900">
              {isLogin ? t('login') : t('register')}
            </h2>
            <button
              onClick={onClose}
              data-testid="close-auth-modal"
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('name')} *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    data-testid="input-name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('role')} *
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    data-testid="select-role"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron focus:border-transparent"
                  >
                    <option value="worker">{t('featureWorker')}</option>
                    <option value="employer">{t('featureEmployer')}</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('phoneNumber')} *
              </label>
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleInputChange}
                required
                data-testid="input-phone"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('password')} *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                data-testid="input-password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron focus:border-transparent"
              />
            </div>

            {/* Worker-specific fields */}
            {!isLogin && formData.role === 'worker' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('area')} *
                  </label>
                  <input
                    type="text"
                    name="area"
                    value={formData.area}
                    onChange={handleInputChange}
                    required
                    data-testid="input-area"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('district')} *
                    </label>
                    <input
                      type="text"
                      name="district"
                      value={formData.district}
                      onChange={handleInputChange}
                      required
                      data-testid="input-district"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('state')} *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                      data-testid="input-state"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('jobType')} *
                  </label>
                  <select
                    name="job_type"
                    value={formData.job_type}
                    onChange={handleInputChange}
                    data-testid="select-job-type"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron focus:border-transparent"
                  >
                    <option value="Mason">{t('mason')}</option>
                    <option value="Labour">{t('labour')}</option>
                    <option value="Plumber">{t('plumber')}</option>
                    <option value="Electrician">{t('electrician')}</option>
                    <option value="Painter">{t('painter')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('expectedWage')} *
                  </label>
                  <input
                    type="number"
                    name="expected_daily_wage"
                    value={formData.expected_daily_wage}
                    onChange={handleInputChange}
                    required
                    data-testid="input-wage"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron focus:border-transparent"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              data-testid="submit-auth-form"
              className="w-full bg-gradient-to-r from-saffron to-orange-600 text-white font-bold py-3 px-6 rounded-lg hover:from-orange-600 hover:to-saffron transition-all disabled:opacity-50"
            >
              {loading ? t('loading') : isLogin ? t('login') : t('register')}
            </button>
          </form>

          {/* Toggle Login/Register */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-saffron hover:text-orange-600 font-medium"
            >
              {isLogin ? `${t('dontHaveAccount')} ${t('registerHere')}` : `${t('alreadyHaveAccount')} ${t('loginHere')}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthModal;
