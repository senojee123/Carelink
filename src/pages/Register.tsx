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
    if (!form.name.trim() || !form.email.trim() || !form.password) { setError('Please fill in your name, email, and password.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return; }
    setLoading(true); setError('');
    try {
      await register({ name: form.name.trim(), email: form.email.trim().toLowerCase(), password: form.password, phone: form.phone.trim() || undefined });
      navigate('/');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  }

  return (
    <div className="auth-page">
      {/* Hero */}
      <div className="auth-hero">
        <div className="auth-hero-content">
          <div className="auth-hero-logo">🏥</div>
          <div className="auth-hero-title">Join CareLink</div>
          <div className="auth-hero-sub">Create your caregiver account and start providing smarter, data-driven care for your elders.</div>
          <div className="auth-features">
            <div className="auth-feature-item">
              <span className="auth-feature-icon">🆓</span>
              <div className="auth-feature-text"><strong>Free to start</strong><br />Add up to 5 elders with full AI monitoring</div>
            </div>
            <div className="auth-feature-item">
              <span className="auth-feature-icon">🔒</span>
              <div className="auth-feature-text"><strong>Secure by design</strong><br />All data encrypted and stored in the cloud</div>
            </div>
            <div className="auth-feature-item">
              <span className="auth-feature-icon">⚡</span>
              <div className="auth-feature-text"><strong>Up in minutes</strong><br />Add your first elder in under 2 minutes</div>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="auth-form-side">
        <div className="auth-form-container">
          <div className="auth-form-title">Create your account</div>
          <div className="auth-form-sub">Join thousands of caregivers using CareLink</div>

          {error && <div className="form-error">{error}</div>}

          <form onSubmit={handleRegister}>
            <div className="form-field">
              <label className="form-label">Full Name *</label>
              <div className="form-input-wrap">
                <span className="form-input-icon">👤</span>
                <input type="text" value={form.name} onChange={e => update('name', e.target.value)} placeholder="e.g. Sarah Mitchell" autoComplete="name" />
              </div>
            </div>
            <div className="form-field">
              <label className="form-label">Email Address *</label>
              <div className="form-input-wrap">
                <span className="form-input-icon">✉️</span>
                <input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="your@email.com" autoComplete="email" />
              </div>
            </div>
            <div className="form-field">
              <label className="form-label">Phone (optional)</label>
              <div className="form-input-wrap">
                <span className="form-input-icon">📱</span>
                <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+1-555-0100" />
              </div>
            </div>
            <div className="form-field">
              <label className="form-label">Password *</label>
              <div className="form-input-wrap">
                <span className="form-input-icon">🔒</span>
                <input type="password" value={form.password} onChange={e => update('password', e.target.value)} placeholder="••••••••" autoComplete="new-password" />
              </div>
            </div>
            <div className="form-field">
              <label className="form-label">Confirm Password *</label>
              <div className="form-input-wrap">
                <span className="form-input-icon">🔐</span>
                <input type="password" value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} placeholder="••••••••" />
              </div>
            </div>

            <button type="submit" className="btn-gradient full" disabled={loading}>
              {loading ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : 'Create Account →'}
            </button>
          </form>

          <div className="form-footer-row">
            <span className="form-footer-text">Already have an account?</span>
            <button className="form-footer-link" onClick={() => navigate('/login')}>Sign In</button>
          </div>
        </div>
      </div>
    </div>
  );
}
