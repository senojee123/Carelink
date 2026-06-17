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
  const mins = Math.floor(diff / 60000);
  return mins > 0 ? `${mins}m ago` : 'Just now';
}

function getTimeOfDay() {
  const h = new Date().getHours();
  return h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
}

function getStatusColor(status: string) {
  return status === 'critical' ? Colors.statusCritical : status === 'warning' ? Colors.statusWarning : Colors.statusOk;
}

function ElderCard({ elder, onMenu }: { elder: any; onMenu: (e: any) => void }) {
  const navigate = useNavigate();
  const statusColor = getStatusColor(elder.status);
  const statusGlow = elder.status === 'critical' ? 'rgba(239,68,68,0.1)' : elder.status === 'warning' ? 'rgba(245,158,11,0.1)' : 'rgba(62,207,142,0.1)';
  const compliance = elder.last_compliance_score ?? null;

  return (
    <div
      className="elder-card"
      style={{ borderColor: elder.status !== 'ok' ? statusColor : '#1E2C45' }}
      onClick={() => navigate(`/elder/${elder.id}`)}
    >
      <div className="elder-card-top">
        <div className="elder-photo-wrap">
          {elder.photo_url
            ? <img src={elder.photo_url} alt={elder.name} className="elder-photo" style={{ borderColor: statusColor }} />
            : <div className="elder-photo-fallback" style={{ borderColor: statusColor }}>{elder.name[0]}</div>
          }
          {elder.unread_alerts > 0 && (
            <div className="elder-alert-dot" style={{ backgroundColor: statusColor }}>
              {elder.unread_alerts > 9 ? '9+' : elder.unread_alerts}
            </div>
          )}
        </div>
        <div className="elder-card-info">
          <div className="elder-card-name">{elder.name}</div>
          <div className="elder-card-uid">{elder.elder_uid} · Age {elder.age}</div>
        </div>
      </div>

      <div className="status-pill" style={{ backgroundColor: statusGlow }}>
        <div className="status-dot" style={{ backgroundColor: statusColor }} />
        <span style={{ color: statusColor, fontSize: 11, fontWeight: 700, letterSpacing: '0.3px' }}>
          {elder.status === 'critical' ? '⚠️ Needs Immediate Attention'
            : elder.status === 'warning' ? '🔔 Needs Attention'
            : '✅ Doing Well'}
        </span>
      </div>

      {compliance !== null && (
        <div className="compliance-wrap">
          <div className="compliance-label">
            <span>Compliance</span>
            <span style={{ color: compliance >= 80 ? Colors.success : compliance >= 50 ? Colors.warning : Colors.danger }}>
              {compliance}%
            </span>
          </div>
          <div className="compliance-bar">
            <div className="compliance-fill" style={{
              width: `${compliance}%`,
              backgroundColor: compliance >= 80 ? Colors.success : compliance >= 50 ? Colors.warning : Colors.danger,
            }} />
          </div>
        </div>
      )}

      <div className="elder-card-footer">
        <span>{elder.last_call_at ? `📞 ${formatRelativeTime(elder.last_call_at)}` : '📞 No calls yet'}</span>
        <div className="elder-card-actions" onClick={e => e.stopPropagation()}>
          <button className="card-action-btn" onClick={() => navigate(`/elder/edit/${elder.id}`)}>Edit</button>
          <button className="card-action-btn" onClick={e => { e.stopPropagation(); onMenu(elder); }}>···</button>
        </div>
      </div>

      <button
        className="elder-card-menu"
        onClick={e => { e.stopPropagation(); onMenu(elder); }}
        title="Options"
      >···</button>
    </div>
  );
}

function ElderMenuModal({ elder, onClose, onSimulate }: { elder: any; onClose: () => void; onSimulate: (e: any) => void }) {
  if (!elder) return null;
  const navigate = useNavigate();
  const items = [
    { icon: '👁️', label: 'View Full Details', action: () => { onClose(); navigate(`/elder/${elder.id}`); } },
    { icon: '🤖', label: 'Simulate AI Check-in Call', action: () => { onClose(); onSimulate(elder); } },
    { icon: '📅', label: 'Manage Schedule', action: () => { onClose(); navigate(`/elder/scheduler/${elder.id}`); } },
    { icon: '✏️', label: 'Edit Profile', action: () => { onClose(); navigate(`/elder/edit/${elder.id}`); } },
  ];
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 360 }} onClick={e => e.stopPropagation()}>
        <div className="modal-title">{elder.name}</div>
        <div className="modal-sub">{elder.elder_uid}</div>
        <div className="modal-divider" />
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

function SimulateModal({ elder, onClose, onDone }: { elder: any; onClose: () => void; onDone: () => void }) {
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
      setResult('✅ Simulation complete! Gemini AI is analysing the transcript. Refresh in a moment to see results.');
      setTimeout(() => { onClose(); onDone(); }, 2500);
    } catch (err: any) {
      setResult('❌ ' + (err?.response?.data?.error || 'Simulation failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 460 }} onClick={e => e.stopPropagation()}>
        <div className="modal-title">🤖 Simulate AI Check-in Call</div>
        <div className="modal-sub">{elder.name} · {elder.elder_uid}</div>
        <div className="modal-divider" />

        {result ? (
          <div style={{ color: result.startsWith('✅') ? Colors.success : Colors.danger, fontSize: 14, padding: '16px 0', lineHeight: 1.6 }}>
            {result}
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
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
                  {selected === s.key && <span className="scenario-check">✓</span>}
                </div>
              ))}
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={onClose}>Cancel</button>
              <button className="btn-confirm" onClick={runSimulation} disabled={loading}>
                {loading ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : '▶ Run Simulation'}
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
  const [search, setSearch] = useState('');

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
  const okCount = elders.filter(e => e.status === 'ok').length;
  const totalCalls = elders.reduce((sum, e) => sum + (e.total_calls || 0), 0);

  const filtered = search.trim()
    ? elders.filter(e => e.name.toLowerCase().includes(search.toLowerCase()) || e.elder_uid?.toLowerCase().includes(search.toLowerCase()))
    : elders;

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <div className="loading-text">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div>
      {/* ── Page header ── */}
      <div className="page-header">
        <div>
          <div className="page-title">Good {getTimeOfDay()}, {caregiver?.name?.split(' ')[0]} 👋</div>
          <div className="page-sub">Here's the latest status of all elders in your care</div>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link to="/alerts" className="topbar-alert-btn" style={{ position: 'relative' }}>
            🔔
            {(urgentCount + warningCount) > 0 && (
              <div className="topbar-badge">{urgentCount + warningCount}</div>
            )}
          </Link>
          <button className="topbar-add-btn" onClick={() => navigate('/elder/add')}>
            ➕ Add Elder
          </button>
        </div>
      </div>

      {/* ── Stats strip ── */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(78,142,255,0.12)' }}>👥</div>
          <div>
            <div className="stat-num">{elders.length}</div>
            <div className="stat-label">Total Elders</div>
          </div>
        </div>
        <div className="stat-card" style={{ borderColor: urgentCount > 0 ? 'rgba(239,68,68,0.4)' : '#1E2C45' }}>
          <div className="stat-icon" style={{ background: 'rgba(239,68,68,0.12)' }}>🔴</div>
          <div>
            <div className="stat-num" style={{ color: urgentCount > 0 ? Colors.danger : '#94A3B8' }}>{urgentCount}</div>
            <div className="stat-label">Critical / Urgent</div>
          </div>
        </div>
        <div className="stat-card" style={{ borderColor: warningCount > 0 ? 'rgba(245,158,11,0.4)' : '#1E2C45' }}>
          <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.12)' }}>🟡</div>
          <div>
            <div className="stat-num" style={{ color: warningCount > 0 ? Colors.warning : '#94A3B8' }}>{warningCount}</div>
            <div className="stat-label">Need Attention</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(62,207,142,0.12)' }}>✅</div>
          <div>
            <div className="stat-num" style={{ color: Colors.success }}>{okCount}</div>
            <div className="stat-label">All Good</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(155,127,234,0.12)' }}>📞</div>
          <div>
            <div className="stat-num">{totalCalls}</div>
            <div className="stat-label">Total AI Calls</div>
          </div>
        </div>
      </div>

      {/* ── Elders section ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#F1F5F9' }}>
          Your Elders
          <span style={{ fontSize: 13, color: '#4B6285', fontWeight: 500, marginLeft: 8 }}>({filtered.length})</span>
        </div>
        {elders.length > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: '#111D35', border: '1px solid #1E2C45', borderRadius: 10,
            padding: '8px 14px',
          }}>
            <span style={{ fontSize: 14, color: '#4B6285' }}>🔍</span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search elders..."
              style={{
                background: 'transparent', border: 'none', outline: 'none',
                color: '#F1F5F9', fontSize: 14, width: 160,
              }}
            />
          </div>
        )}
      </div>

      {elders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👴</div>
          <div className="empty-title">No elders yet</div>
          <div className="empty-sub">Add your first elder to start monitoring their health and care</div>
          <button className="btn-gradient" onClick={() => navigate('/elder/add')}>➕ Add Your First Elder</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state" style={{ paddingTop: 40 }}>
          <div className="empty-icon">🔍</div>
          <div className="empty-title">No results</div>
          <div className="empty-sub">No elders match "{search}"</div>
        </div>
      ) : (
        <div className="elder-grid">
          {filtered.map(elder => (
            <ElderCard key={elder.id} elder={elder} onMenu={e => setMenuElder(e)} />
          ))}
        </div>
      )}

      {menuElder && (
        <ElderMenuModal
          elder={menuElder}
          onClose={() => setMenuElder(null)}
          onSimulate={(e: any) => { setMenuElder(null); setTimeout(() => setSimulateElder(e), 200); }}
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
