import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { alertsApi } from '../api/api';
import { Colors } from '../constants/theme';

function formatTime(ts: string) {
  const d = new Date(ts);
  const diff = Date.now() - d.getTime();
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  const mins = Math.floor(diff / 60000);
  return mins > 0 ? `${mins}m ago` : 'Just now';
}

const SEVERITY_MAP: Record<string, { color: string; bg: string; icon: string }> = {
  URGENT: { color: Colors.danger, bg: Colors.dangerGlow, icon: '🚨' },
  HIGH: { color: '#F97316', bg: 'rgba(249,115,22,0.15)', icon: '⚠️' },
  MEDIUM: { color: Colors.warning, bg: Colors.warningGlow, icon: '🔔' },
  LOW: { color: Colors.primary, bg: Colors.primaryGlow, icon: 'ℹ️' },
};

function SeverityBadge({ severity }: { severity: string }) {
  const s = SEVERITY_MAP[severity] || SEVERITY_MAP.LOW;
  return (
    <div className="severity-badge" style={{ backgroundColor: s.bg, borderColor: s.color }}>
      <span className="badge-icon">{s.icon}</span>
      <span className="badge-text" style={{ color: s.color }}>{severity}</span>
    </div>
  );
}

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
    } catch (err) {
      console.error('Failed to load alerts:', err);
    } finally {
      setLoading(false);
    }
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

  const FILTERS = [null, 'URGENT', 'HIGH', 'MEDIUM', 'LOW'];
  const filtered = filter ? alerts.filter(a => a.severity === filter) : alerts;
  const unreadCount = alerts.filter(a => !a.is_read).length;

  return (
    <div className="dashboard-bg">
      <div className="page-scroll">
        <div className="alerts-header">
          <div>
            <div className="header-title">Alert Inbox 🔔</div>
            <div className="header-sub">{unreadCount} unread alerts</div>
          </div>
          {unreadCount > 0 && (
            <button className="mark-all-btn" onClick={markAllRead}>Mark all read</button>
          )}
        </div>

        {/* Filter chips */}
        <div className="filter-row">
          {FILTERS.map(f => (
            <button
              key={String(f)}
              className={`filter-chip${filter === f ? ' active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f ?? 'All'} {f ? `(${alerts.filter(a => a.severity === f).length})` : `(${alerts.length})`}
            </button>
          ))}
        </div>

        {/* Alert list */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 60 }}>
            <div className="spinner" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✅</div>
            <div className="empty-title">No alerts</div>
            <div className="empty-text">All elders are doing well!</div>
          </div>
        ) : (
          filtered.map(alert => (
            <div
              key={alert.id}
              className={`alert-card${!alert.is_read ? ' unread' : ''}`}
              style={{ borderLeftColor: borderColor(alert.severity) }}
              onClick={() => handlePress(alert)}
            >
              <div className="alert-top">
                <SeverityBadge severity={alert.severity} />
                <span className="alert-time">{formatTime(alert.created_at)}</span>
              </div>
              <div className="alert-elder-row">
                <span className="alert-elder-name">{alert.elder_name}</span>
                <span className="alert-elder-uid">{alert.elder_uid}</span>
              </div>
              <div className="alert-msg">{alert.message}</div>
              {!alert.is_read && <div className="unread-dot" />}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
