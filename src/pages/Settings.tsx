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

  const items = [
    { icon: '👤', label: 'Account', sub: caregiver?.name || '' },
    { icon: '✉️', label: 'Email', sub: caregiver?.email || '' },
    { icon: '📱', label: 'Phone', sub: caregiver?.phone || 'Not set' },
    { icon: 'ℹ️', label: 'App Version', sub: '1.0.0 (PWA)' },
    { icon: '🤖', label: 'AI Engine', sub: 'Gemini 2.0 Flash' },
    { icon: '🗄️', label: 'Database', sub: 'Neon PostgreSQL (Cloud)' },
  ];

  return (
    <div className="dashboard-bg">
      <div className="settings-scroll">
        <div className="settings-title">Settings ⚙️</div>

        <div className="avatar-section">
          <div className="avatar-circle">{caregiver?.name?.[0] || 'C'}</div>
          <div className="caregiver-name">{caregiver?.name}</div>
          <div className="caregiver-role">CareLink Caregiver</div>
        </div>

        <div className="settings-section">
          {items.map(item => (
            <div key={item.label} className="settings-row">
              <span className="row-icon">{item.icon}</span>
              <div>
                <div className="row-label">{item.label}</div>
                <div className="row-sub">{item.sub}</div>
              </div>
            </div>
          ))}
        </div>

        <button className="logout-btn" onClick={handleLogout}>Sign Out</button>

        <div className="settings-footer">CareLink PWA · Built with Gemini AI + Neon DB</div>
      </div>
    </div>
  );
}
