import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { eldersApi, callsApi } from '../api/api';
import { Colors } from '../constants/theme';
import {
  HeartHandshake,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Phone,
  Eye,
  Bot,
  Calendar,
  Edit,
  Smile,
  Frown,
  Meh,
  XCircle,
  Bell,
  Plus,
  Users,
  PhoneCall,
  Search,
  MoreVertical
} from 'lucide-react';

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

function getStatusIcon(status: string, size = 16) {
  if (status === 'critical') return <AlertTriangle size={size} style={{ color: Colors.statusCritical }} />;
  if (status === 'warning') return <AlertCircle size={size} style={{ color: Colors.statusWarning }} />;
  return <CheckCircle2 size={size} style={{ color: Colors.statusOk }} />;
}

function ElderCard({ elder, onMenu }: { elder: any; onMenu: (e: any) => void }) {
  const navigate = useNavigate();
  const statusColor = getStatusColor(elder.status);
  const statusGlow = elder.status === 'critical' ? 'rgba(225,29,72,0.06)' : elder.status === 'warning' ? 'rgba(217,119,6,0.06)' : 'rgba(22,163,74,0.06)';
  const compliance = elder.last_compliance_score ?? null;

  return (
    <div
      className="elder-card"
      style={{ borderColor: elder.status !== 'ok' ? statusColor : '#E2E8F0' }}
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
        {getStatusIcon(elder.status, 14)}
        <span style={{ color: statusColor, fontSize: 11, fontWeight: 700, letterSpacing: '0.3px', marginLeft: 4 }}>
          {elder.status === 'critical' ? 'Needs Immediate Attention'
            : elder.status === 'warning' ? 'Needs Attention'
            : 'Doing Well'}
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
        <span>
          <Phone size={12} style={{ color: Colors.textMuted }} />
          {elder.last_call_at ? formatRelativeTime(elder.last_call_at) : 'No calls yet'}
        </span>
        <div className="elder-card-actions" onClick={e => e.stopPropagation()}>
          <button className="card-action-btn" onClick={() => navigate(`/elder/edit/${elder.id}`)}>Edit</button>
          <button className="card-action-btn" onClick={e => { e.stopPropagation(); onMenu(elder); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px' }}>
            <MoreVertical size={14} />
          </button>
        </div>
      </div>

      <button
        className="elder-card-menu"
        onClick={e => { e.stopPropagation(); onMenu(elder); }}
        title="Options"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px' }}
      >
        <MoreVertical size={16} />
      </button>
    </div>
  );
}

function ElderMenuModal({ elder, onClose, onSimulate }: { elder: any; onClose: () => void; onSimulate: (e: any) => void }) {
  if (!elder) return null;
  const navigate = useNavigate();
  const items = [
    { icon: <Eye size={16} />, label: 'View Full Details', action: () => { onClose(); navigate(`/elder/${elder.id}`); } },
    { icon: <Bot size={16} />, label: 'Simulate AI Check-in Call', action: () => { onClose(); onSimulate(elder); } },
    { icon: <Calendar size={16} />, label: 'Manage Schedule', action: () => { onClose(); navigate(`/elder/scheduler/${elder.id}`); } },
    { icon: <Edit size={16} />, label: 'Edit Profile', action: () => { onClose(); navigate(`/elder/edit/${elder.id}`); } },
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
    { key: 'positive', icon: <Smile size={16} style={{ color: Colors.success }} />, label: 'Positive check-in', desc: 'All meds taken, good mood' },
    { key: 'concerned', icon: <Frown size={16} style={{ color: Colors.warning }} />, label: 'Missed medications', desc: 'Skipped meds, low mood' },
    { key: 'urgent', icon: <AlertTriangle size={16} style={{ color: Colors.danger }} />, label: 'Urgent distress', desc: 'Chest pain, needs help' },
    { key: 'mixed', icon: <Meh size={16} style={{ color: Colors.textMuted }} />, label: 'Mixed result', desc: 'Some meds, feels lonely' },
  ];

  async function runSimulation() {
    setLoading(true);
    try {
      await callsApi.simulate(elder.id, selected);
      setResult('Simulation complete! Gemini AI is analysing the transcript. Refresh in a moment to see results.');
      setTimeout(() => { onClose(); onDone(); }, 2500);
    } catch (err: any) {
      setResult('Error: ' + (err?.response?.data?.error || 'Simulation failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  }

  const isSuccessResult = result && !result.startsWith('Error');

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 460 }} onClick={e => e.stopPropagation()}>
        <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Bot size={22} style={{ color: Colors.primary }} />
          Simulate AI Check-in Call
        </div>
        <div className="modal-sub">{elder.name} · {elder.elder_uid}</div>
        <div className="modal-divider" />

        {result ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: isSuccessResult ? Colors.success : Colors.danger, fontSize: 14, padding: '16px 0', lineHeight: 1.6 }}>
            {isSuccessResult ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
            <div>{result}</div>
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
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <span style={{ marginTop: 2 }}>{s.icon}</span>
                    <div>
                      <div className="scenario-label">{s.label}</div>
                      <div className="scenario-desc">{s.desc}</div>
                    </div>
                  </div>
                  {selected === s.key && <span className="scenario-check">✓</span>}
                </div>
              ))}
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={onClose}>Cancel</button>
              <button className="btn-confirm" onClick={runSimulation} disabled={loading}>
                {loading ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : 'Run Simulation'}
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
          <div className="page-title">Good {getTimeOfDay()}, {caregiver?.name?.split(' ')[0]}</div>
          <div className="page-sub">Here's the latest wellbeing status of the elders in your family</div>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link to="/alerts" className="topbar-alert-btn" style={{ position: 'relative' }}>
            <Bell size={18} />
            {(urgentCount + warningCount) > 0 && (
              <div className="topbar-badge">{urgentCount + warningCount}</div>
            )}
          </Link>
          <button className="topbar-add-btn" onClick={() => navigate('/elder/add')}>
            <Plus size={16} /> Add Elder
          </button>
        </div>
      </div>

      {/* ── Stats strip ── */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--accent-teal-light)', color: 'var(--accent-teal)' }}>
            <Users size={22} />
          </div>
          <div>
            <div className="stat-num">{elders.length}</div>
            <div className="stat-label">Total Elders</div>
          </div>
        </div>
        <div className="stat-card" style={{ borderColor: urgentCount > 0 ? 'rgba(225, 29, 72, 0.4)' : 'var(--border-color)' }}>
          <div className="stat-icon" style={{ background: 'var(--accent-rose-light)', color: 'var(--accent-rose)' }}>
            <AlertTriangle size={22} />
          </div>
          <div>
            <div className="stat-num" style={{ color: urgentCount > 0 ? Colors.danger : 'var(--text-muted)' }}>{urgentCount}</div>
            <div className="stat-label">Urgent Care</div>
          </div>
        </div>
        <div className="stat-card" style={{ borderColor: warningCount > 0 ? 'rgba(217, 119, 6, 0.4)' : 'var(--border-color)' }}>
          <div className="stat-icon" style={{ background: 'var(--accent-amber-light)', color: 'var(--accent-amber)' }}>
            <AlertCircle size={22} />
          </div>
          <div>
            <div className="stat-num" style={{ color: warningCount > 0 ? Colors.warning : 'var(--text-muted)' }}>{warningCount}</div>
            <div className="stat-label">Need Attention</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--accent-green-light)', color: 'var(--accent-green)' }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div className="stat-num" style={{ color: Colors.success }}>{okCount}</div>
            <div className="stat-label">All Good</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--accent-lavender-light)', color: 'var(--accent-lavender)' }}>
            <PhoneCall size={22} />
          </div>
          <div>
            <div className="stat-num">{totalCalls}</div>
            <div className="stat-label">Total AI Calls</div>
          </div>
        </div>
      </div>

      {/* ── Elders section ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
          Elders in Your Care
          <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500, marginLeft: 8 }}>({filtered.length})</span>
        </div>
        {elders.length > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 10,
            padding: '8px 14px',
            boxShadow: 'var(--card-shadow)'
          }}>
            <Search size={14} style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search elders..."
              style={{
                background: 'transparent', border: 'none', outline: 'none',
                color: 'var(--text-primary)', fontSize: 14, width: 160,
              }}
            />
          </div>
        )}
      </div>

      {elders.length === 0 ? (
        <div className="empty-state">
          <Users size={56} style={{ color: 'var(--text-muted)', marginBottom: 20 }} />
          <div className="empty-title">No elders yet</div>
          <div className="empty-sub">Add your first elder to start monitoring their wellbeing and connection status</div>
          <button className="btn-gradient" onClick={() => navigate('/elder/add')}><Plus size={16} /> Add Your First Elder</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state" style={{ paddingTop: 40 }}>
          <Search size={56} style={{ color: 'var(--text-muted)', marginBottom: 20 }} />
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
