import React, { useState, useEffect } from 'react';
import KYCProcess from './KYCProcess';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001/api';

function KYCGuard({ children }) {
  const [kycStatus, setKycStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchKycStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await axios.get(`${API_URL}/workers/kyc-status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setKycStatus(response.data.status);
    } catch (err) {
      console.error("KYC status error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKycStatus();
  }, []);

  if (loading) return null;

  if (kycStatus === 'pending') {
    return <KYCProcess onComplete={() => setKycStatus('verified')} />;
  }

  return children;
}

export default KYCGuard;
