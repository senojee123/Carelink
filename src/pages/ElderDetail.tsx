import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eldersApi, alertsApi, reportsApi } from '../api/api';
import { Colors } from '../constants/theme';

function ComplianceChart({ data }: { data: Array<{ call_date: string; avg_score: number }> }) {
  if (!data || data.length === 0) {
    return <div style={{ color: Colors.textMuted, fontSize: 13 }}>No call history yet</div>;
  }
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return (
    <div className="h-chart">
      {data.map(d => {
        const score = Number(d.avg_score) || 0;
        const barColor = score >= 80 ? Colors.success : score >= 50 ? Colors.warning : Colors.danger;
        const dayName = days[new Date(d.call_date).getDay()];
        return (
          <div key={d.call_date} className="h-bar-row">
            <span className="h-day-label">{dayName}</span>
            <div className="h-bar-bg">
              <div className="h-bar" style={{ width: `${score}%`, backgroundColor: barColor }} />
            </div>
            <span className="h-score" style={{ color: barColor }}>{score}%</span>
          </div>
        );
      })}
    </div>
  );
}

function MealRow({ label, status }: { label: string; status: string }) {
  const map: Record<string, { color: string; icon: string }> = {
    eaten: { color: Colors.success, icon: '✅' },
    skipped: { color: Colors.danger, icon: '❌' },
    partial: { color: Colors.warning, icon: '🟡' },
    na: { color: Colors.textMuted, icon: '—' },
  };
  const s = map[status] || map.na;
  return (
    <div className="meal-row">
      <span className="meal-icon">{s.icon}</span>
      <span className="meal-label">{label}</span>
      <span className="meal-status" style={{ color: s.color }}>{status === 'na' ? 'N/A' : status.charAt(0).toUpperCase() + status.slice(1)}</span>
    </div>
  );
}

export default function ElderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [elder, setElder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const res = await eldersApi.get(id!);
      setElder(res.data);
    } catch {
      alert('Failed to load elder details');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!elder) return null;

  const statusColor = elder.status === 'critical' ? Colors.statusCritical : elder.status === 'warning' ? Colors.statusWarning : Colors.statusOk;
  const lastCall = elder.recent_calls?.[0];

  return (
    <div className="elder-detail-page">
      {/* Hero */}
      <div className="hero-section" style={{ background: 'linear-gradient(180deg, #050B18, #0B1120)' }}>
        <div style={{ position: 'absolute', top: 60, left: 20, zIndex: 10 }}>
          <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
        </div>

        <div className="hero-photo" style={{ borderColor: statusColor, boxShadow: `0 0 20px ${statusColor}66` }}>
          {elder.photo_url
            ? <img src={elder.photo_url} alt={elder.name} />
            : <div className="hero-photo-fallback">{elder.name[0]}</div>
          }
        </div>

        <div className="hero-name">{elder.name}</div>
        <div className="hero-uid">{elder.elder_uid} · Age {elder.age}</div>

        <div className="hero-status-pill" style={{ backgroundColor: statusColor + '22', borderColor: statusColor }}>
          <div className="hero-status-dot" style={{ backgroundColor: statusColor }} />
          <span className="hero-status-text" style={{ color: statusColor }}>
            {elder.status === 'critical' ? '⚠️ Needs Immediate Attention' : elder.status === 'warning' ? '🔔 Needs Attention' : '✅ Doing Well'}
          </span>
        </div>
      </div>

      <div className="detail-body">
        {/* Quick actions */}
        <div className="quick-actions">
          <button className="qa-btn" onClick={() => navigate(`/elder/scheduler/${elder.id}`)}>
            <span className="qa-icon">📅</span>
            <span className="qa-label">Schedule</span>
          </button>
          <button className="qa-btn" onClick={() => elder.phone && alert(`Calling ${elder.name} at ${elder.phone}`)}>
            <span className="qa-icon">📱</span>
            <span className="qa-label">Call</span>
          </button>
          <button className="qa-btn" onClick={() => navigate(`/elder/edit/${elder.id}`)}>
            <span className="qa-icon">✏️</span>
            <span className="qa-label">Edit</span>
          </button>
          <button className="qa-btn" onClick={() => window.open(reportsApi.getElderReportUrl(elder.id), '_blank')}>
            <span className="qa-icon">📄</span>
            <span className="qa-label">Report</span>
          </button>
        </div>

        {/* Latest call analysis */}
        {lastCall?.mood && (
          <div className="detail-section">
            <div className="detail-section-title">📊 Latest Call Analysis</div>
            <div className="analysis-card">
              <div className="analysis-row">
                <div className="analysis-stat">
                  <span className="analysis-stat-num">{lastCall.compliance_score ?? '—'}%</span>
                  <span className="analysis-stat-label">Compliance</span>
                </div>
                <div className="analysis-divider" />
                <div className="analysis-stat">
                  <span className="analysis-stat-num" style={{ fontSize: 28 }}>
                    {({ positive: '😊', neutral: '😐', low: '😟', distressed: '😰' } as any)[lastCall.mood] || '—'}
                  </span>
                  <span className="analysis-stat-label">Mood</span>
                </div>
                <div className="analysis-divider" />
                <div className="analysis-stat">
                  <span className="analysis-stat-num" style={{ fontSize: 18 }}>{lastCall.distress_flag ? '🚨' : '✅'}</span>
                  <span className="analysis-stat-label">Distress</span>
                </div>
              </div>
              {lastCall.summary && <div className="analysis-summary">{lastCall.summary}</div>}
            </div>

            {lastCall.llm_analysis && (
              <div className="meal-section">
                <div className="sub-title">Meals</div>
                <MealRow label="Breakfast" status={lastCall.llm_analysis?.meals?.breakfast || 'na'} />
                <MealRow label="Lunch" status={lastCall.llm_analysis?.meals?.lunch || 'na'} />
                <MealRow label="Dinner" status={lastCall.llm_analysis?.meals?.dinner || 'na'} />
              </div>
            )}
          </div>
        )}

        {/* Unread alerts */}
        {elder.unread_alerts?.length > 0 && (
          <div className="detail-section">
            <div className="detail-section-header">
              <div className="detail-section-title">🚨 Active Alerts ({elder.unread_alerts.length})</div>
              <button className="section-action" onClick={async () => { await alertsApi.markAllRead(elder.id); loadData(); }}>
                Mark all read
              </button>
            </div>
            {elder.unread_alerts.slice(0, 3).map((alert: any) => (
              <div key={alert.id} className="alert-row-inline" style={{
                borderLeftColor: alert.severity === 'URGENT' ? Colors.danger : alert.severity === 'HIGH' ? '#F97316' : alert.severity === 'MEDIUM' ? Colors.warning : Colors.primary,
              }}>
                <div className="alert-severity">{alert.severity}</div>
                <div className="alert-msg-text">{alert.message}</div>
              </div>
            ))}
          </div>
        )}

        {/* Weekly compliance */}
        <div className="detail-section">
          <div className="detail-section-title">📈 7-Day Compliance</div>
          <ComplianceChart data={elder.weekly_compliance || []} />
        </div>

        {/* Medical info */}
        <div className="detail-section">
          <div className="detail-section-title">🏥 Medical Information</div>
          {[
            { label: 'Phone', value: elder.phone || 'Not set' },
            { label: 'Address', value: elder.address || 'Not set' },
            { label: 'Emergency Contact', value: elder.emergency_contact || 'Not set' },
            { label: 'Emergency Phone', value: elder.emergency_phone || 'Not set' },
          ].map(({ label, value }) => (
            <div key={label} className="info-row">
              <span className="info-label">{label}</span>
              <span className="info-value">{value}</span>
            </div>
          ))}
          {elder.medical_notes && (
            <div className="info-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
              <span className="info-label">Medical Notes</span>
              <span style={{ fontSize: 14, color: '#F1F5F9', fontWeight: 500 }}>{elder.medical_notes}</span>
            </div>
          )}
        </div>

        {/* Schedule */}
        <div className="detail-section">
          <div className="detail-section-header">
            <div className="detail-section-title">📅 Schedule</div>
            <button className="section-action" onClick={() => navigate(`/elder/scheduler/${elder.id}`)}>Manage →</button>
          </div>
          {elder.schedules?.length > 0
            ? elder.schedules.map((s: any) => (
              <div key={s.id} className="sched-item">
                <span className="sched-icon">{({ medication: '💊', meal: '🍽️', activity: '🏃' } as any)[s.type] || '📋'}</span>
                <div style={{ flex: 1 }}>
                  <div className="sched-label">{s.label}</div>
                  {s.notes && <div className="sched-note">{s.notes}</div>}
                </div>
                <span className="sched-time">{s.scheduled_time?.slice(0, 5)}</span>
              </div>
            ))
            : <div className="empty-text">No schedule set up yet</div>}
        </div>

        {/* Recent calls */}
        <div className="detail-section">
          <div className="detail-section-title">📞 Recent Calls</div>
          {elder.recent_calls?.length > 0
            ? elder.recent_calls.map((c: any) => {
              const score = c.compliance_score ?? null;
              const scoreColor = score !== null ? (score >= 80 ? Colors.success : score >= 50 ? Colors.warning : Colors.danger) : Colors.textMuted;
              const moodIcons: any = { positive: '😊', neutral: '😐', low: '😟', distressed: '😰' };
              return (
                <div key={c.id} className="call-row" onClick={() => navigate(`/call/${c.id}`)}>
                  <span className="call-icon">{moodIcons[c.mood] || '📞'}</span>
                  <div style={{ flex: 1 }}>
                    <div className="call-time">{new Date(c.call_timestamp).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                    <div className="call-summary">{c.summary || 'Analysis pending...'}</div>
                  </div>
                  {score !== null && <span className="call-score" style={{ color: scoreColor }}>{score}%</span>}
                  {c.distress_flag && <span>🚨</span>}
                  <span className="call-arrow">›</span>
                </div>
              );
            })
            : <div className="empty-text">No calls recorded yet</div>}
        </div>
      </div>
    </div>
  );
}
