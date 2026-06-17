import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function update(field: keyof typeof form, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError('Please fill in your name, email, and password.');
      return;
    }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return; }
    setLoading(true);
    setError('');
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        phone: form.phone.trim() || undefined,
      });
      navigate('/');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const fields = [
    { key: 'name', label: 'Full Name *', placeholder: 'e.g. Sarah Mitchell', icon: '👤', type: 'text' },
    { key: 'email', label: 'Email Address *', placeholder: 'your@email.com', icon: '✉️', type: 'email' },
    { key: 'phone', label: 'Phone (optional)', placeholder: '+1-555-0100', icon: '📱', type: 'tel' },
    { key: 'password', label: 'Password *', placeholder: '••••••••', icon: '🔒', type: 'password' },
    { key: 'confirmPassword', label: 'Confirm Password *', placeholder: '••••••••', icon: '🔐', type: 'password' },
  ];

  return (
    <div className="auth-bg">
      <div className="auth-circle1" />
      <div className="auth-circle2" />

      <div className="auth-scroll">
        <div className="logo-section">
          <div className="logo-container" style={{ width: 70, height: 70, fontSize: 32, borderRadius: 22 }}>🏥</div>
          <div className="brand-name" style={{ fontSize: 32 }}>CareLink</div>
          <div className="tagline">Create your caregiver account</div>
        </div>

        <form className="auth-card" onSubmit={handleRegister}>
          <div className="welcome-title" style={{ fontSize: 24 }}>Get Started</div>
          <div className="welcome-sub">Join CareLink and care smarter</div>

          {error && (
            <div style={{ color: '#EF4444', fontSize: 13, marginBottom: 16, padding: '10px 14px', background: 'rgba(239,68,68,0.1)', borderRadius: 10, border: '1px solid rgba(239,68,68,0.3)' }}>
              {error}
            </div>
          )}

          {fields.map(field => (
            <div key={field.key} className="input-group" style={{ marginBottom: 16 }}>
              <label className="input-label">{field.label}</label>
              <div className="input-wrapper">
                <span className="input-icon">{field.icon}</span>
                <input
                  type={field.type}
                  value={form[field.key as keyof typeof form]}
                  onChange={e => update(field.key as keyof typeof form, e.target.value)}
                  placeholder={field.placeholder}
                  autoCapitalize={field.key === 'name' ? 'words' : 'none'}
                  autoComplete={field.key === 'email' ? 'email' : field.key === 'password' ? 'new-password' : 'off'}
                />
              </div>
            </div>
          ))}

          <button type="submit" className="btn-gradient" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2, display: 'inline-block', verticalAlign: 'middle' }} /> : 'Create Account →'}
          </button>

          <div className="sign-up-row" style={{ marginTop: 20 }}>
            <span className="sign-up-text">Already have an account? </span>
            <button type="button" className="sign-up-link" onClick={() => navigate('/login')}>Sign In</button>
          </div>
        </form>

        <div className="auth-footer">© 2026 CareLink · Powered by Gemini AI</div>
      </div>
    </div>
  );
}
