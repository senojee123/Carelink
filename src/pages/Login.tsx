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

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('sarah@carelink.com');
  const [password, setPassword] = useState('CareLink@123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDemoUsers, setShowDemoUsers] = useState(false);

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
    } finally {
      setLoading(false);
    }
  }

  function selectDemoUser(user: typeof DEMO_USERS[0]) {
    setEmail(user.email);
    setPassword('CareLink@123');
    setShowDemoUsers(false);
  }

  return (
    <div className="auth-bg">
      <div className="auth-circle1" />
      <div className="auth-circle2" />

      <div className="auth-scroll">
        {/* Logo */}
        <div className="logo-section">
          <div className="logo-container">🏥</div>
          <div className="brand-name">CareLink</div>
          <div className="tagline">AI-Powered Elderly Care Platform</div>
        </div>

        {/* Card */}
        <form className="auth-card" onSubmit={handleLogin}>
          <div className="welcome-title">Welcome back</div>
          <div className="welcome-sub">Sign in to your caregiver account</div>

          {error && (
            <div style={{ color: '#EF4444', fontSize: 13, marginBottom: 16, padding: '10px 14px', background: 'rgba(239,68,68,0.1)', borderRadius: 10, border: '1px solid rgba(239,68,68,0.3)' }}>
              {error}
            </div>
          )}

          <div className="input-group">
            <label className="input-label">Email address</label>
            <div className="input-wrapper">
              <span className="input-icon">✉️</span>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                autoComplete="email"
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
          </div>

          <button type="submit" className="btn-gradient" disabled={loading}>
            {loading ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2, display: 'inline-block', verticalAlign: 'middle' }} /> : 'Sign In →'}
          </button>

          <button type="button" className="demo-toggle" onClick={() => setShowDemoUsers(!showDemoUsers)}>
            {showDemoUsers ? '▲ Hide demo accounts' : '▼ Show demo accounts'}
          </button>

          {showDemoUsers && (
            <div className="demo-list">
              <div className="demo-list-title">Demo Caregivers — Password: CareLink@123</div>
              {DEMO_USERS.map(user => (
                <button key={user.email} type="button" className="demo-user-row" onClick={() => selectDemoUser(user)}>
                  <div className="demo-user-avatar">{user.name[0]}</div>
                  <div className="demo-user-info">
                    <div className="demo-user-name">{user.name}</div>
                    <div className="demo-user-role">{user.email} · {user.role}</div>
                  </div>
                  <span className="demo-user-arrow">→</span>
                </button>
              ))}
            </div>
          )}
        </form>

        <div className="sign-up-row">
          <span className="sign-up-text">New to CareLink? </span>
          <button className="sign-up-link" onClick={() => navigate('/register')}>Create an account →</button>
        </div>

        <div className="auth-footer">© 2026 CareLink · Powered by Gemini AI</div>
      </div>
    </div>
  );
}
