import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eldersApi, alertsApi, reportsApi } from '../api/api';
import { Colors } from '../constants/theme';
import {
  ArrowLeft,
  Calendar,
  Phone,
  Edit,
  FileText,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Meh,
  Smile,
  Frown,
  LineChart,
  Utensils,
  Bell,
  TrendingUp,
  Pill,
  Activity,
  Clock,
  ChevronRight,
  Shield,
  PhoneCall,
  User,
  Heart
} from 'lucide-react';

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
  const map: Record<string, { color: string; icon: React.ReactNode }> = {
    eaten: { color: Colors.success, icon: <CheckCircle2 size={16} style={{ color: Colors.success }} /> },
    skipped: { color: Colors.danger, icon: <XCircle size={16} style={{ color: Colors.danger }} /> },
    partial: { color: Colors.warning, icon: <AlertCircle size={16} style={{ color: Colors.warning }} /> },
    na: { color: Colors.textMuted, icon: <Clock size={16} style={{ color: Colors.textMuted }} /> },
  };
  const s = map[status] || map.na;
  return (
    <div className="meal-row">
      <span className="meal-icon" style={{ display: 'flex', alignItems: 'center' }}>{s.icon}</span>
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

  const moodIcons: Record<string, React.ReactNode> = {
    positive: <Smile size={20} style={{ color: Colors.success }} />,
    neutral: <Meh size={20} style={{ color: Colors.textSecondary }} />,
    low: <Frown size={20} style={{ color: Colors.warning }} />,
    distressed: <AlertTriangle size={20} style={{ color: Colors.danger }} />
  };

  const getStatusIcon = (status: string) => {
    if (status === 'critical') return <AlertTriangle size={16} style={{ color: Colors.statusCritical }} />;
    if (status === 'warning') return <AlertCircle size={16} style={{ color: Colors.statusWarning }} />;
    return <CheckCircle2 size={16} style={{ color: Colors.statusOk }} />;
  };

  return (
    <div>
      <button className="back-btn" onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <ArrowLeft size={14} /> Back to Dashboard
      </button>

      <div className="elder-detail-layout">
        {/* Left panel — Profile */}
        <div>
          <div className="elder-profile-card">
            <div className="elder-hero-photo" style={{ borderColor: statusColor }}>
              {elder.photo_url
                ? <img src={elder.photo_url} alt={elder.name} />
                : <div className="elder-hero-fallback">{elder.name[0]}</div>
              }
            </div>
            <div className="elder-profile-name">{elder.name}</div>
            <div className="elder-profile-uid">{elder.elder_uid} · Age {elder.age}</div>

            <div className="elder-status-pill" style={{ backgroundColor: statusColor + '0A', borderColor: statusColor + '44' }}>
              {getStatusIcon(elder.status)}
              <span className="elder-status-text" style={{ color: statusColor, marginLeft: 4 }}>
                {elder.status === 'critical' ? 'Needs Immediate Attention'
                  : elder.status === 'warning' ? 'Needs Attention'
                  : 'Doing Well'}
              </span>
            </div>

            <div className="quick-actions">
              <button className="qa-btn" onClick={() => navigate(`/elder/scheduler/${elder.id}`)}>
                <span className="qa-icon"><Calendar size={18} /></span>
                <span className="qa-label">Schedule</span>
              </button>
              <button className="qa-btn" onClick={() => elder.phone && alert(`Calling ${elder.name} at ${elder.phone}`)}>
                <span className="qa-icon"><Phone size={18} /></span>
                <span className="qa-label">Call</span>
              </button>
              <button className="qa-btn" onClick={() => navigate(`/elder/edit/${elder.id}`)}>
                <span className="qa-icon"><Edit size={18} /></span>
                <span className="qa-label">Edit</span>
              </button>
              <button className="qa-btn" onClick={() => window.open(reportsApi.getElderReportUrl(elder.id), '_blank')}>
                <span className="qa-icon"><FileText size={18} /></span>
                <span className="qa-label">Report</span>
              </button>
            </div>

            {/* Medical info */}
            <div style={{ width: '100%', borderTop: '1px solid var(--border-color)', paddingTop: 16, marginTop: 4 }}>
              {[
                { icon: <Phone size={14} style={{ color: 'var(--text-muted)' }} />, label: 'Phone', value: elder.phone || 'Not set' },
                { icon: <User size={14} style={{ color: 'var(--text-muted)' }} />, label: 'Emergency Contact', value: elder.emergency_contact || 'Not set' },
                { icon: <PhoneCall size={14} style={{ color: 'var(--text-muted)' }} />, label: 'Emergency Phone', value: elder.emergency_phone || 'Not set' },
              ].map(({ icon, label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border-color)', fontSize: 13 }}>
                  <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    {icon} {label}
                  </span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500, textAlign: 'right', maxWidth: 140 }}>{value}</span>
                </div>
              ))}
              {elder.medical_notes && (
                <div style={{ paddingTop: 12, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, textAlign: 'left' }}>
                  <div style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Shield size={14} style={{ color: 'var(--accent-teal)' }} /> Wellbeing & Care Notes
                  </div>
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
                  <span className="detail-card-title"><LineChart size={16} style={{ color: 'var(--accent-teal)' }} /> Latest Call Analysis</span>
                  <button className="section-action" onClick={() => navigate(`/call/${lastCall.id}`)}>View full call →</button>
                </div>
                <div className="analysis-stats">
                  <div className="analysis-stat">
                    <span className="analysis-stat-num">{lastCall.compliance_score ?? '—'}%</span>
                    <span className="analysis-stat-label">Compliance</span>
                  </div>
                  <div className="analysis-stat">
                    <span className="analysis-stat-num" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {moodIcons[lastCall.mood] || <Smile size={20} />}
                    </span>
                    <span className="analysis-stat-label">Mood</span>
                  </div>
                  <div className="analysis-stat">
                    <span className="analysis-stat-num" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {lastCall.distress_flag
                        ? <AlertTriangle size={24} style={{ color: Colors.danger }} />
                        : <CheckCircle2 size={24} style={{ color: Colors.success }} />
                      }
                    </span>
                    <span className="analysis-stat-label">Distress Status</span>
                  </div>
                </div>
                {lastCall.summary && <div className="analysis-summary">{lastCall.summary}</div>}
              </div>
              {lastCall.llm_analysis && (
                <div className="detail-card" style={{ marginTop: 12 }}>
                  <div className="detail-card-header">
                    <span className="detail-card-title"><Utensils size={16} style={{ color: 'var(--accent-teal)' }} /> Meal Report</span>
                  </div>
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
                  <span className="detail-card-title"><Bell size={16} style={{ color: 'var(--accent-teal)' }} /> Active Alerts ({elder.unread_alerts.length})</span>
                  <button className="section-action" onClick={async () => { await alertsApi.markAllRead(elder.id); loadData(); }}>Mark all read</button>
                </div>
                <div className="detail-card-body">
                  {elder.unread_alerts.slice(0, 3).map((alert: any) => (
                    <div key={alert.id} className="alert-inline" style={{
                      borderLeftColor: alert.severity === 'URGENT' ? Colors.danger : alert.severity === 'HIGH' ? '#EA580C' : alert.severity === 'MEDIUM' ? Colors.warning : Colors.primary,
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
              <div className="detail-card-header">
                <span className="detail-card-title"><TrendingUp size={16} style={{ color: 'var(--accent-teal)' }} /> 7-Day Compliance</span>
              </div>
              <div className="detail-card-body">
                <ComplianceChart data={elder.weekly_compliance || []} />
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="detail-section">
            <div className="detail-card">
              <div className="detail-card-header">
                <span className="detail-card-title"><Calendar size={16} style={{ color: 'var(--accent-teal)' }} /> Care Schedule</span>
                <button className="section-action" onClick={() => navigate(`/elder/scheduler/${elder.id}`)}>Manage →</button>
              </div>
              {elder.schedules?.length > 0
                ? elder.schedules.map((s: any) => {
                    const iconMap: Record<string, React.ReactNode> = {
                      medication: <Pill size={16} style={{ color: 'var(--accent-teal)' }} />,
                      meal: <Utensils size={16} style={{ color: 'var(--accent-lavender)' }} />,
                      activity: <Activity size={16} style={{ color: 'var(--accent-blue)' }} />,
                    };
                    const icon = iconMap[s.type] || <Clock size={16} />;
                    return (
                      <div key={s.id} className="sched-item">
                        <span className="sched-icon" style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>
                        <div style={{ flex: 1 }}>
                          <div className="sched-label">{s.label}</div>
                          {s.notes && <div className="sched-note">{s.notes}</div>}
                        </div>
                        <span className="sched-time">{s.scheduled_time?.slice(0, 5)}</span>
                      </div>
                    );
                  })
                : <div className="empty-text">No schedule set up yet</div>}
            </div>
          </div>

          {/* Recent calls */}
          <div className="detail-section">
            <div className="detail-card">
              <div className="detail-card-header">
                <span className="detail-card-title"><PhoneCall size={16} style={{ color: 'var(--accent-teal)' }} /> Recent Calls</span>
              </div>
              {elder.recent_calls?.length > 0
                ? elder.recent_calls.map((c: any) => {
                  const score = c.compliance_score ?? null;
                  const scoreColor = score !== null ? (score >= 80 ? Colors.success : score >= 50 ? Colors.warning : Colors.danger) : '#94A3B8';
                  return (
                    <div key={c.id} className="call-row" onClick={() => navigate(`/call/${c.id}`)}>
                      <span className="call-icon" style={{ display: 'flex', alignItems: 'center' }}>
                        {moodIcons[c.mood] || <PhoneCall size={18} style={{ color: 'var(--accent-teal)' }} />}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div className="call-time">{new Date(c.call_timestamp).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                        <div className="call-summary-text">{c.summary || 'Analysis pending...'}</div>
                      </div>
                      {score !== null && <span className="call-score" style={{ color: scoreColor }}>{score}%</span>}
                      {c.distress_flag && <span style={{ display: 'flex', alignItems: 'center', marginRight: 4 }}><AlertTriangle size={16} style={{ color: Colors.danger }} /></span>}
                      <span className="call-arrow" style={{ display: 'flex', alignItems: 'center' }}><ChevronRight size={18} /></span>
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
