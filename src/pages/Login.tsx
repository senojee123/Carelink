import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DEMO_USERS = [
  { name: 'Sarah Mitchell', email: 'sarah@carelink.com', role: '3 Elders' },
  { name: 'James Okafor', email: 'james@carelink.com', role: '1 Elder' },
  { name: 'Priya Sharma', email: 'priya@carelink.com', role: '1 Elder' },
  { name: 'Elena Vasquez', email: 'elena@carelink.com', role: '0 Elders' },
  { name: 'David Chen', email: 'david@carelink.com', role: '0 Elders' },
];

const FEATURES = [
  { icon: '🤖', title: 'AI-Powered Check-ins', desc: 'Gemini AI makes daily calls to your elders and analyses responses automatically' },
  { icon: '📊', title: 'Real-time Insights', desc: 'Compliance scores, mood tracking, and medication adherence at a glance' },
  { icon: '🚨', title: 'Instant Alerts', desc: 'Get notified immediately when something needs your attention' },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('sarah@carelink.com');
  const [password, setPassword] = useState('CareLink@123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDemo, setShowDemo] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) { setError('Please enter your email and password.'); return; }
    setLoading(true);
    setError('');
    try {
      await login(email.trim().toLowerCase(), password);
      navigate('/');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally { setLoading(false); }
  }

  function selectDemo(user: typeof DEMO_USERS[0]) {
    setEmail(user.email);
    setPassword('CareLink@123');
    setShowDemo(false);
  }

  return (
    <div className="auth-page">
      {/* Left hero */}
      <div className="auth-hero">
        <div className="auth-hero-content">
          <div className="auth-hero-logo">🏥</div>
          <div className="auth-hero-title">CareLink</div>
          <div className="auth-hero-sub">AI-powered elderly care platform — keep your loved ones safe with intelligent monitoring</div>
          <div className="auth-features">
            {FEATURES.map(f => (
              <div key={f.title} className="auth-feature-item">
                <span className="auth-feature-icon">{f.icon}</span>
                <div className="auth-feature-text"><strong>{f.title}</strong><br />{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="auth-form-side">
        <div className="auth-form-container">
          <div className="auth-form-title">Welcome back</div>
          <div className="auth-form-sub">Sign in to your caregiver account</div>

          {error && <div className="form-error">{error}</div>}

          <form onSubmit={handleLogin}>
            <div className="form-field">
              <label className="form-label">Email address</label>
              <div className="form-input-wrap">
                <span className="form-input-icon">✉️</span>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" autoComplete="email" />
              </div>
            </div>
            <div className="form-field">
              <label className="form-label">Password</label>
              <div className="form-input-wrap">
                <span className="form-input-icon">🔒</span>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" />
              </div>
            </div>
            <button type="submit" className="btn-gradient full" disabled={loading}>
              {loading ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : 'Sign In →'}
            </button>
          </form>

          <button type="button" className="form-toggle-link" onClick={() => setShowDemo(!showDemo)} style={{ marginTop: 12 }}>
            {showDemo ? '▲ Hide' : '▼ Browse'} demo accounts
          </button>

          {showDemo && (
            <div className="demo-section">
              <div className="demo-section-title">Demo Caregivers · Password: CareLink@123</div>
              <div className="demo-grid">
                {DEMO_USERS.map(user => (
                  <button key={user.email} type="button" className="demo-user-card" onClick={() => selectDemo(user)}>
                    <div className="demo-avatar">{user.name[0]}</div>
                    <div>
                      <div className="demo-name">{user.name.split(' ')[0]}</div>
                      <div className="demo-email">{user.role}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="form-footer-row">
            <span className="form-footer-text">New to CareLink?</span>
            <button className="form-footer-link" onClick={() => navigate('/register')}>Create an account →</button>
          </div>

          <p style={{ color: '#4B6285', fontSize: 12, textAlign: 'center', marginTop: 32 }}>
            © 2026 CareLink · Powered by Gemini AI
          </p>
        </div>
      </div>
    </div>
  );
}
