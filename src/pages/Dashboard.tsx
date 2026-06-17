import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { eldersApi, callsApi } from '../api/api';
import { Colors } from '../constants/theme';

function formatRelativeTime(timestamp: string) {
  const diff = Date.now() - new Date(timestamp).getTime();
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  return 'Just now';
}

function getTimeOfDay() {
  const h = new Date().getHours();
  return h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
}

function getStatusColor(status: string) {
  return status === 'critical' ? Colors.statusCritical : status === 'warning' ? Colors.statusWarning : Colors.statusOk;
}

function ElderCard({ elder, onMenu }: any) {
  const navigate = useNavigate();
  const statusColor = getStatusColor(elder.status);
  const statusGlow = elder.status === 'critical' ? 'rgba(239,68,68,0.2)' : elder.status === 'warning' ? 'rgba(245,158,11,0.2)' : 'rgba(62,207,142,0.2)';
  const compliance = elder.last_compliance_score ?? null;

  return (
    <div
      className="elder-card"
      style={{ borderColor: statusColor, cursor: 'pointer' }}
      onClick={() => navigate(`/elder/${elder.id}`)}
    >
      <div className="photo-section">
        <div className="photo-ring" style={{ borderColor: statusColor, boxShadow: `0 0 10px ${statusColor}55` }}>
          {elder.photo_url
            ? <img src={elder.photo_url} alt={elder.name} />
            : <div className="photo-fallback">{elder.name[0]}</div>
          }
        </div>
        {elder.unread_alerts > 0 && (
          <div className="alert-badge" style={{ backgroundColor: statusColor }}>
            {elder.unread_alerts > 9 ? '9+' : elder.unread_alerts}
          </div>
        )}
      </div>

      <div className="elder-name">{elder.name}</div>
      <div className="elder-uid">{elder.elder_uid}</div>

      <div className="status-pill" style={{ backgroundColor: statusGlow }}>
        <div className="status-pill-dot" style={{ backgroundColor: statusColor }} />
        <span className="status-pill-text" style={{ color: statusColor }}>
          {elder.status === 'critical' ? 'URGENT' : elder.status === 'warning' ? 'Needs Attention' : 'All Good'}
        </span>
      </div>

      {compliance !== null && (
        <div className="compliance-section">
          <div className="compliance-bar">
            <div className="compliance-fill" style={{
              width: `${compliance}%`,
              backgroundColor: compliance >= 80 ? Colors.success : compliance >= 50 ? Colors.warning : Colors.danger,
            }} />
          </div>
          <div className="compliance-text">{compliance}% compliance</div>
        </div>
      )}

      {elder.last_call_at && (
        <div className="last-call">📞 {formatRelativeTime(elder.last_call_at)}</div>
      )}

      <button
        className="menu-btn"
        onClick={e => { e.stopPropagation(); onMenu(elder); }}
      >···</button>
    </div>
  );
}

function ElderMenuModal({ elder, onClose, onSimulate }: any) {
  if (!elder) return null;
  const navigate = useNavigate();
  const items = [
    { icon: '👁️', label: 'View Full Details', action: () => { onClose(); navigate(`/elder/${elder.id}`); } },
    { icon: '📊', label: 'Last Call Summary', action: () => { onClose(); navigate(`/elder/${elder.id}`); } },
    { icon: '🤖', label: 'Simulate Check-in Call', action: () => { onClose(); onSimulate(elder); } },
    { icon: '📅', label: 'Manage Schedule', action: () => { onClose(); navigate(`/elder/scheduler/${elder.id}`); } },
  ];
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="menu-modal" onClick={e => e.stopPropagation()}>
        <div className="menu-header">
          <div className="menu-title">{elder.name}</div>
          <div className="menu-sub">{elder.elder_uid}</div>
        </div>
        {items.map(item => (
          <button key={item.label} className="menu-item" onClick={item.action}>
            <span className="menu-item-icon">{item.icon}</span>
            <span className="menu-item-label">{item.label}</span>
            <span className="menu-item-arrow">›</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function SimulateModal({ elder, onClose, onDone }: any) {
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState('positive');
  const [result, setResult] = useState('');
  if (!elder) return null;

  const scenarios = [
    { key: 'positive', label: '😊 Positive check-in', desc: 'All meds taken, good mood' },
    { key: 'concerned', label: '😟 Missed medications', desc: 'Skipped meds, low mood' },
    { key: 'urgent', label: '🚨 Urgent distress', desc: 'Chest pain, needs help' },
    { key: 'mixed', label: '😐 Mixed result', desc: 'Some meds, feels lonely' },
  ];

  async function runSimulation() {
    setLoading(true);
    try {
      await callsApi.simulate(elder.id, selected);
      setResult('✅ Call Simulated — Gemini AI is analysing the transcript. Check back in a moment for the results.');
      setTimeout(() => { onClose(); onDone(); }, 2500);
    } catch (err: any) {
      setResult('❌ ' + (err?.response?.data?.error || 'Simulation failed'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay">
      <div className="menu-modal" style={{ maxWidth: 380 }} onClick={e => e.stopPropagation()}>
        <div className="menu-title">🤖 Simulate AI Call</div>
        <div className="menu-sub">{elder.name} · {elder.elder_uid}</div>
        <div className="modal-divider" />
        {result ? (
          <div style={{ color: result.startsWith('✅') ? Colors.success : Colors.danger, fontSize: 14, padding: '12px 0' }}>{result}</div>
        ) : (
          <>
            {scenarios.map(s => (
              <div
                key={s.key}
                className={`scenario-row${selected === s.key ? ' selected' : ''}`}
                onClick={() => setSelected(s.key)}
              >
                <div style={{ flex: 1 }}>
                  <div className="scenario-label">{s.label}</div>
                  <div className="scenario-desc">{s.desc}</div>
                </div>
                {selected === s.key && <span style={{ color: Colors.primary, fontSize: 18 }}>✓</span>}
              </div>
            ))}
            <div className="modal-actions">
              <button className="modal-cancel-btn" onClick={onClose}>Cancel</button>
              <button className="modal-confirm-btn" onClick={runSimulation} disabled={loading}>
                {loading ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2, display: 'inline-block' }} /> : 'Run Simulation'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { caregiver } = useAuth();
  const navigate = useNavigate();
  const [elders, setElders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuElder, setMenuElder] = useState<any>(null);
  const [simulateElder, setSimulateElder] = useState<any>(null);

  const loadElders = useCallback(async () => {
    try {
      const res = await eldersApi.list();
      setElders(res.data);
    } catch (err) {
      console.error('Failed to load elders:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadElders(); }, [loadElders]);

  const urgentCount = elders.filter(e => e.status === 'critical').length;
  const warningCount = elders.filter(e => e.status === 'warning').length;

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <div className="loading-text">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-bg">
      <div className="page-scroll">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <div className="header-greeting">Good {getTimeOfDay()},</div>
            <div className="header-name">{caregiver?.name?.split(' ')[0]} 👋</div>
          </div>
          <Link to="/alerts" className="notif-btn">
            🔔
            {(urgentCount + warningCount) > 0 && (
              <div className="notif-badge">{urgentCount + warningCount}</div>
            )}
          </Link>
        </div>

        {/* Summary */}
        <div className="summary-row">
          <div className="summary-card">
            <div className="summary-num">{elders.length}</div>
            <div className="summary-label">Elders</div>
          </div>
          <div className="summary-card" style={{ borderColor: urgentCount > 0 ? Colors.statusCritical : '#243050' }}>
            <div className="summary-num" style={{ color: urgentCount > 0 ? Colors.danger : '#94A3B8' }}>{urgentCount}</div>
            <div className="summary-label">Urgent 🔴</div>
          </div>
          <div className="summary-card" style={{ borderColor: warningCount > 0 ? Colors.statusWarning : '#243050' }}>
            <div className="summary-num" style={{ color: warningCount > 0 ? Colors.warning : '#94A3B8' }}>{warningCount}</div>
            <div className="summary-label">Attention 🟡</div>
          </div>
        </div>

        {/* Section header */}
        <div className="section-header">
          <div className="section-title">Your Elders</div>
          <button className="add-btn" onClick={() => navigate('/elder/add')}>+ Add Elder</button>
        </div>

        {/* Elder grid */}
        {elders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👴</div>
            <div className="empty-title">No elders yet</div>
            <div className="empty-text">Add your first elder to get started</div>
            <button className="add-btn" style={{ padding: '12px 24px', fontSize: 15 }} onClick={() => navigate('/elder/add')}>+ Add Elder</button>
          </div>
        ) : (
          <div className="elder-grid">
            {elders.map(elder => (
              <ElderCard key={elder.id} elder={elder} onMenu={(e: any) => setMenuElder(e)} />
            ))}
          </div>
        )}
      </div>

      {menuElder && (
        <ElderMenuModal
          elder={menuElder}
          onClose={() => setMenuElder(null)}
          onSimulate={(e: any) => { setMenuElder(null); setTimeout(() => setSimulateElder(e), 300); }}
        />
      )}
      {simulateElder && (
        <SimulateModal
          elder={simulateElder}
          onClose={() => setSimulateElder(null)}
          onDone={loadElders}
        />
      )}
    </div>
  );
}
