import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const { caregiver, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    if (window.confirm('Are you sure you want to sign out?')) {
      await logout();
      navigate('/login');
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">⚙️ Settings</div>
          <div className="page-sub">Manage your account and preferences</div>
        </div>
      </div>

      <div className="settings-layout">
        {/* Profile card */}
        <div className="settings-profile-card">
          <div className="settings-avatar">{caregiver?.name?.[0] || 'C'}</div>
          <div className="settings-name">{caregiver?.name}</div>
          <div className="settings-role">CareLink Caregiver</div>
          <button className="logout-btn" onClick={handleLogout} style={{ marginTop: 8 }}>
            Sign Out
          </button>
        </div>

        {/* Settings panels */}
        <div>
          <div className="settings-section">
            <div className="settings-section-title">Account Details</div>
            {[
              { icon: '👤', label: 'Full Name', sub: caregiver?.name || '—' },
              { icon: '✉️', label: 'Email Address', sub: caregiver?.email || '—' },
              { icon: '📱', label: 'Phone', sub: caregiver?.phone || 'Not set' },
            ].map(row => (
              <div key={row.label} className="settings-row">
                <span className="row-icon">{row.icon}</span>
                <div>
                  <div className="row-label">{row.label}</div>
                  <div className="row-sub">{row.sub}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="settings-section">
            <div className="settings-section-title">System Information</div>
            {[
              { icon: 'ℹ️', label: 'App Version', sub: '1.0.0 (PWA)' },
              { icon: '🤖', label: 'AI Engine', sub: 'Gemini 2.0 Flash' },
              { icon: '🗄️', label: 'Database', sub: 'Neon PostgreSQL (Cloud)' },
              { icon: '🌐', label: 'Backend', sub: 'carelink-backend-wenq.onrender.com' },
            ].map(row => (
              <div key={row.label} className="settings-row">
                <span className="row-icon">{row.icon}</span>
                <div>
                  <div className="row-label">{row.label}</div>
                  <div className="row-sub">{row.sub}</div>
                </div>
              </div>
            ))}
          </div>

          <p style={{ fontSize: 12, color: '#4B6285', textAlign: 'center', marginTop: 8 }}>
            CareLink PWA · Built with React + Vite + Gemini AI
          </p>
        </div>
      </div>
    </div>
  );
}
