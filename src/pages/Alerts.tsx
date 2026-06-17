import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { alertsApi } from '../api/api';
import { Colors } from '../constants/theme';

function formatTime(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  const mins = Math.floor(diff / 60000);
  return mins > 0 ? `${mins}m ago` : 'Just now';
}

const SEVERITY_MAP: Record<string, { color: string; bg: string; border: string; icon: string }> = {
  URGENT: { color: Colors.danger, bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', icon: '🚨' },
  HIGH:   { color: '#F97316', bg: 'rgba(249,115,22,0.1)', border: 'rgba(249,115,22,0.3)', icon: '⚠️' },
  MEDIUM: { color: Colors.warning, bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', icon: '🔔' },
  LOW:    { color: Colors.primary, bg: 'rgba(78,142,255,0.1)', border: 'rgba(78,142,255,0.3)', icon: 'ℹ️' },
};

function borderColor(sev: string) {
  return sev === 'URGENT' ? Colors.danger : sev === 'HIGH' ? '#F97316' : sev === 'MEDIUM' ? Colors.warning : Colors.primary;
}

export default function Alerts() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);

  const loadAlerts = useCallback(async () => {
    try {
      const res = await alertsApi.list({ unread_only: false });
      setAlerts(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadAlerts(); }, [loadAlerts]);

  async function handlePress(alert: any) {
    if (!alert.is_read) {
      await alertsApi.markRead(alert.id);
      setAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, is_read: true } : a));
    }
    navigate(`/elder/${alert.elder_id}`);
  }

  async function markAllRead() {
    await alertsApi.markAllRead();
    setAlerts(prev => prev.map(a => ({ ...a, is_read: true })));
  }

  const FILTERS: (string | null)[] = [null, 'URGENT', 'HIGH', 'MEDIUM', 'LOW'];
  const filtered = filter ? alerts.filter(a => a.severity === filter) : alerts;
  const unreadCount = alerts.filter(a => !a.is_read).length;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">🔔 Alert Inbox</div>
          <div className="page-sub">{unreadCount} unread · {alerts.length} total alerts</div>
        </div>
        {unreadCount > 0 && (
          <button className="btn-cancel" onClick={markAllRead} style={{ color: '#4E8EFF', borderColor: 'rgba(78,142,255,0.3)' }}>
            ✓ Mark all read
          </button>
        )}
      </div>

      <div className="filter-bar">
        {FILTERS.map(f => (
          <button
            key={String(f)}
            className={`filter-chip${filter === f ? ' active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f ?? 'All'} ({f ? alerts.filter(a => a.severity === f).length : alerts.length})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-screen"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">✅</div>
          <div className="empty-title">No alerts</div>
          <div className="empty-sub">All elders are doing well right now.</div>
        </div>
      ) : (
        <div className="alerts-table">
          {filtered.map(alert => {
            const s = SEVERITY_MAP[alert.severity] || SEVERITY_MAP.LOW;
            return (
              <div
                key={alert.id}
                className={`alert-row${!alert.is_read ? ' unread' : ''}`}
                style={{ borderLeftColor: borderColor(alert.severity) }}
                onClick={() => handlePress(alert)}
              >
                <div className="alert-row-left">
                  <div className="severity-badge" style={{ backgroundColor: s.bg, borderColor: s.border }}>
                    <span className="badge-icon">{s.icon}</span>
                    <span className="badge-text" style={{ color: s.color }}>{alert.severity}</span>
                  </div>
                  <span className="alert-time">{formatTime(alert.created_at)}</span>
                </div>

                <div className="alert-row-mid">
                  <div className="alert-elder-row">
                    <span className="alert-elder-name">{alert.elder_name}</span>
                    <span className="alert-elder-uid">{alert.elder_uid}</span>
                  </div>
                  <div className="alert-message">{alert.message}</div>
                </div>

                <div className="alert-row-right">
                  {!alert.is_read && <div className="unread-dot" />}
                  <span style={{ color: '#4B6285', fontSize: 18 }}>›</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
