import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eldersApi, alertsApi, reportsApi } from '../api/api';
import { Colors } from '../constants/theme';

function ComplianceChart({ data }: { data: Array<{ call_date: string; avg_score: number }> }) {
  if (!data || data.length === 0)
    return <div className="empty-text">No call history yet</div>;
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return (
    <div className="h-chart">
      {data.map(d => {
        const score = Number(d.avg_score) || 0;
        const barColor = score >= 80 ? Colors.success : score >= 50 ? Colors.warning : Colors.danger;
        return (
          <div key={d.call_date} className="h-bar-row">
            <span className="h-day-label">{days[new Date(d.call_date).getDay()]}</span>
            <div className="h-bar-bg"><div className="h-bar" style={{ width: `${score}%`, backgroundColor: barColor }} /></div>
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
    } finally { setLoading(false); }
  }, [id, navigate]);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!elder) return null;

  const statusColor = elder.status === 'critical' ? Colors.statusCritical : elder.status === 'warning' ? Colors.statusWarning : Colors.statusOk;
  const lastCall = elder.recent_calls?.[0];
  const moodIcons: any = { positive: '😊', neutral: '😐', low: '😟', distressed: '😰' };

  return (
    <div>
      <button className="back-btn" onClick={() => navigate(-1)}>← Back to Dashboard</button>

      <div className="elder-detail-layout">
        {/* Left panel — Profile */}
        <div>
          <div className="elder-profile-card">
            <div className="elder-hero-photo" style={{ borderColor: statusColor, boxShadow: `0 0 20px ${statusColor}44` }}>
              {elder.photo_url
                ? <img src={elder.photo_url} alt={elder.name} />
                : <div className="elder-hero-fallback">{elder.name[0]}</div>
              }
            </div>
            <div className="elder-profile-name">{elder.name}</div>
            <div className="elder-profile-uid">{elder.elder_uid} · Age {elder.age}</div>

            <div className="elder-status-pill" style={{ backgroundColor: statusColor + '22', borderColor: statusColor }}>
              <div className="elder-status-dot" style={{ backgroundColor: statusColor }} />
              <span className="elder-status-text" style={{ color: statusColor }}>
                {elder.status === 'critical' ? '⚠️ Needs Immediate Attention'
                  : elder.status === 'warning' ? '🔔 Needs Attention'
                  : '✅ Doing Well'}
              </span>
            </div>

            <div className="quick-actions">
              <button className="qa-btn" onClick={() => navigate(`/elder/scheduler/${elder.id}`)}>
                <span className="qa-icon">📅</span><span className="qa-label">Schedule</span>
              </button>
              <button className="qa-btn" onClick={() => elder.phone && alert(`Calling ${elder.name} at ${elder.phone}`)}>
                <span className="qa-icon">📱</span><span className="qa-label">Call</span>
              </button>
              <button className="qa-btn" onClick={() => navigate(`/elder/edit/${elder.id}`)}>
                <span className="qa-icon">✏️</span><span className="qa-label">Edit</span>
              </button>
              <button className="qa-btn" onClick={() => window.open(reportsApi.getElderReportUrl(elder.id), '_blank')}>
                <span className="qa-icon">📄</span><span className="qa-label">Report</span>
              </button>
            </div>

            {/* Medical info */}
            <div style={{ width: '100%', borderTop: '1px solid #1E2C45', paddingTop: 16, marginTop: 4 }}>
              {[
                { label: '📱 Phone', value: elder.phone || 'Not set' },
                { label: '🆘 Emergency', value: elder.emergency_contact || 'Not set' },
                { label: '📞 Emergency Phone', value: elder.emergency_phone || 'Not set' },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1E2C45', fontSize: 13 }}>
                  <span style={{ color: '#4B6285' }}>{label}</span>
                  <span style={{ color: '#F1F5F9', fontWeight: 500, textAlign: 'right', maxWidth: 140 }}>{value}</span>
                </div>
              ))}
              {elder.medical_notes && (
                <div style={{ paddingTop: 12, fontSize: 13, color: '#94A3B8', lineHeight: 1.6 }}>
                  <div style={{ color: '#4B6285', fontWeight: 600, marginBottom: 4 }}>🏥 Medical Notes</div>
                  {elder.medical_notes}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right panel — Details */}
        <div>
          {/* Latest call analysis */}
          {lastCall?.mood && (
            <div className="detail-section">
              <div className="detail-card">
                <div className="detail-card-header">
                  <span className="detail-card-title">📊 Latest Call Analysis</span>
                  <button className="section-action" onClick={() => navigate(`/call/${lastCall.id}`)}>View full call →</button>
                </div>
                <div className="analysis-stats">
                  <div className="analysis-stat">
                    <span className="analysis-stat-num">{lastCall.compliance_score ?? '—'}%</span>
                    <span className="analysis-stat-label">Compliance</span>
                  </div>
                  <div className="analysis-stat">
                    <span className="analysis-stat-num" style={{ fontSize: 30 }}>
                      {moodIcons[lastCall.mood] || '—'}
                    </span>
                    <span className="analysis-stat-label">Mood</span>
                  </div>
                  <div className="analysis-stat">
                    <span className="analysis-stat-num">{lastCall.distress_flag ? '🚨' : '✅'}</span>
                    <span className="analysis-stat-label">Distress</span>
                  </div>
                </div>
                {lastCall.summary && <div className="analysis-summary">{lastCall.summary}</div>}
              </div>
              {lastCall.llm_analysis && (
                <div className="detail-card" style={{ marginTop: 12 }}>
                  <div className="detail-card-header"><span className="detail-card-title">🍽️ Meal Report</span></div>
                  <MealRow label="Breakfast" status={lastCall.llm_analysis?.meals?.breakfast || 'na'} />
                  <MealRow label="Lunch" status={lastCall.llm_analysis?.meals?.lunch || 'na'} />
                  <MealRow label="Dinner" status={lastCall.llm_analysis?.meals?.dinner || 'na'} />
                </div>
              )}
            </div>
          )}

          {/* Active alerts */}
          {elder.unread_alerts?.length > 0 && (
            <div className="detail-section">
              <div className="detail-card">
                <div className="detail-card-header">
                  <span className="detail-card-title">🚨 Active Alerts ({elder.unread_alerts.length})</span>
                  <button className="section-action" onClick={async () => { await alertsApi.markAllRead(elder.id); loadData(); }}>Mark all read</button>
                </div>
                <div className="detail-card-body">
                  {elder.unread_alerts.slice(0, 3).map((alert: any) => (
                    <div key={alert.id} className="alert-inline" style={{
                      borderLeftColor: alert.severity === 'URGENT' ? Colors.danger : alert.severity === 'HIGH' ? '#F97316' : alert.severity === 'MEDIUM' ? Colors.warning : Colors.primary,
                    }}>
                      <div className="alert-inline-severity" style={{ color: alert.severity === 'URGENT' ? Colors.danger : Colors.warning }}>{alert.severity}</div>
                      <div className="alert-inline-msg">{alert.message}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Weekly compliance */}
          <div className="detail-section">
            <div className="detail-card">
              <div className="detail-card-header"><span className="detail-card-title">📈 7-Day Compliance</span></div>
              <div className="detail-card-body">
                <ComplianceChart data={elder.weekly_compliance || []} />
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="detail-section">
            <div className="detail-card">
              <div className="detail-card-header">
                <span className="detail-card-title">📅 Schedule</span>
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
          </div>

          {/* Recent calls */}
          <div className="detail-section">
            <div className="detail-card">
              <div className="detail-card-header"><span className="detail-card-title">📞 Recent Calls</span></div>
              {elder.recent_calls?.length > 0
                ? elder.recent_calls.map((c: any) => {
                  const score = c.compliance_score ?? null;
                  const scoreColor = score !== null ? (score >= 80 ? Colors.success : score >= 50 ? Colors.warning : Colors.danger) : '#94A3B8';
                  return (
                    <div key={c.id} className="call-row" onClick={() => navigate(`/call/${c.id}`)}>
                      <span className="call-icon">{moodIcons[c.mood] || '📞'}</span>
                      <div style={{ flex: 1 }}>
                        <div className="call-time">{new Date(c.call_timestamp).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                        <div className="call-summary-text">{c.summary || 'Analysis pending...'}</div>
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
      </div>
    </div>
  );
}
