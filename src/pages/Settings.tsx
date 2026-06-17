import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Settings as SettingsIcon, LogOut, User, Mail, Phone, Info, Bot, Database, Globe } from 'lucide-react';

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
          <div className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <SettingsIcon size={26} style={{ color: 'var(--accent-teal)' }} /> Settings
          </div>
          <div className="page-sub">Manage your account and preferences</div>
        </div>
      </div>

      <div className="settings-layout">
        {/* Profile card */}
        <div className="settings-profile-card">
          <div className="settings-avatar">{caregiver?.name?.[0] || 'C'}</div>
          <div className="settings-name">{caregiver?.name}</div>
          <div className="settings-role">CareLink Caregiver</div>
          <button className="logout-btn" onClick={handleLogout} style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <LogOut size={16} /> Sign Out
          </button>
        </div>

        {/* Settings panels */}
        <div>
          <div className="settings-section">
            <div className="settings-section-title">Account Details</div>
            {[
              { icon: <User size={18} />, label: 'Full Name', sub: caregiver?.name || '—' },
              { icon: <Mail size={18} />, label: 'Email Address', sub: caregiver?.email || '—' },
              { icon: <Phone size={18} />, label: 'Phone', sub: caregiver?.phone || 'Not set' },
            ].map(row => (
              <div key={row.label} className="settings-row">
                <span className="row-icon" style={{ display: 'flex', alignItems: 'center' }}>{row.icon}</span>
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
              { icon: <Info size={18} />, label: 'App Version', sub: '1.0.0 (PWA)' },
              { icon: <Bot size={18} />, label: 'AI Engine', sub: 'Gemini 2.0 Flash' },
              { icon: <Database size={18} />, label: 'Database', sub: 'Neon PostgreSQL (Cloud)' },
              { icon: <Globe size={18} />, label: 'Backend Server', sub: 'carelink-backend-wenq.onrender.com' },
            ].map(row => (
              <div key={row.label} className="settings-row">
                <span className="row-icon" style={{ display: 'flex', alignItems: 'center' }}>{row.icon}</span>
                <div>
                  <div className="row-label">{row.label}</div>
                  <div className="row-sub">{row.sub}</div>
                </div>
              </div>
            ))}
          </div>

          <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginTop: 8 }}>
            CareLink PWA · Built with React + Vite + Gemini AI
          </p>
        </div>
      </div>
    </div>
  );
}
