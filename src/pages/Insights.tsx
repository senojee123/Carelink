import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { insightsApi } from '../api/api';
import { Colors } from '../constants/theme';
import {
  TrendingUp,
  Users,
  MessageSquare,
  Pill,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  TrendingDown,
  Volume2
} from 'lucide-react';

function ComplianceTrend({ data }: { data: Array<{ call_date: string; avg_score: number; call_count: number }> }) {
  if (!data || data.length === 0)
    return <div style={{ color: 'var(--text-muted)', fontSize: 13, padding: '20px 0' }}>No call data in the last 14 days</div>;
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return (
    <div className="chart-wrap">
      {data.map(d => {
        const score = Number(d.avg_score) || 0;
        const barH = Math.max(4, (score / 100) * 80);
        const barColor = score >= 80 ? Colors.success : score >= 50 ? Colors.warning : Colors.danger;
        const dayName = days[new Date(d.call_date).getDay()];
        return (
          <div key={d.call_date} className="bar-col">
            <span className="bar-value" style={{ color: barColor }}>{score}%</span>
            <div className="bar-bg"><div className="bar-rect" style={{ height: barH, backgroundColor: barColor }} /></div>
            <span className="day-label">{dayName}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function Insights() {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadInsights = useCallback(async () => {
    try {
      const res = await insightsApi.get();
      setData(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadInsights(); }, [loadInsights]);

  if (loading) return <div className="loading-screen"><div className="spinner" /><div className="loading-text">Analysing care data...</div></div>;

  const summary = data?.summary || {};
  const trend = data?.compliance_trend || [];
  const concerns = data?.top_concerns || [];
  const missedMeds = data?.missed_medications || [];
  const elderBreakdown = data?.elder_breakdown || [];

  const complianceColor = summary.avg_compliance == null ? 'var(--text-muted)'
    : summary.avg_compliance >= 80 ? Colors.success
    : summary.avg_compliance >= 50 ? Colors.warning
    : Colors.danger;

  const statRings = [
    { label: 'Urgent', count: summary.critical_count || 0, color: Colors.statusCritical, icon: <AlertTriangle size={18} /> },
    { label: 'Attention', count: summary.warning_count || 0, color: Colors.statusWarning, icon: <AlertCircle size={18} /> },
    { label: 'All Good', count: summary.ok_count || 0, color: Colors.statusOk, icon: <CheckCircle2 size={18} /> },
  ];
  const total = summary.total_elders || 0;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={26} style={{ color: 'var(--accent-teal)' }} /> AI Wellbeing Insights
          </div>
          <div className="page-sub">Last 14 days · {total} elders monitored</div>
        </div>
      </div>

      {/* Hero stat */}
      <div className="hero-stat">
        <div className="hero-stat-left">
          <div className="hero-stat-label">Average Compliance Score</div>
          <div className="hero-stat-num" style={{ color: complianceColor }}>
            {summary.avg_compliance != null ? `${summary.avg_compliance}%` : '—'}
          </div>
          <div className="hero-stat-sub">across all family members this week</div>
        </div>
        <div className="hero-stat-right">
          <div className="hero-mini-stat">
            <div className="hero-mini-num">{total}</div>
            <div className="hero-mini-label">Elders</div>
          </div>
          <div className="hero-mini-stat">
            <div className="hero-mini-num" style={{ color: summary.critical_count > 0 ? Colors.danger : 'var(--text-muted)' }}>
              {summary.critical_count || 0}
            </div>
            <div className="hero-mini-label">Urgent</div>
          </div>
        </div>
      </div>

      {/* Two-column grid */}
      <div className="insights-grid">
        {/* Status breakdown */}
        <div className="insight-card">
          <div className="insight-card-title">
            <Users size={16} style={{ color: 'var(--accent-teal)' }} /> Status Breakdown
          </div>
          <div className="ring-row">
            {statRings.map(s => (
              <div key={s.label} className="ring-cell">
                <span className="ring-emoji" style={{ color: s.color }}>{s.icon}</span>
                <span className="ring-count" style={{ color: s.color }}>{s.count}</span>
                <span className="ring-label">{s.label}</span>
                <span className="ring-pct">{total > 0 ? Math.round((s.count / total) * 100) : 0}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Compliance trend */}
        <div className="insight-card">
          <div className="insight-card-title">
            <TrendingUp size={16} style={{ color: 'var(--accent-teal)' }} /> 14-Day Compliance Trend
          </div>
          <ComplianceTrend data={trend} />
        </div>

        {/* Top concerns */}
        {concerns.length > 0 && (
          <div className="insight-card">
            <div className="insight-card-title">
              <MessageSquare size={16} style={{ color: 'var(--accent-teal)' }} /> Top Concerns This Week
            </div>
            {concerns.map((c: any, i: number) => (
              <div key={i} className="concern-row">
                <div className="concern-rank">{i + 1}</div>
                <span className="concern-text">{c.concern}</span>
                <div className="concern-badge"><span className="concern-count">{c.occurrences}×</span></div>
              </div>
            ))}
          </div>
        )}

        {/* Missed meds */}
        {missedMeds.length > 0 && (
          <div className="insight-card">
            <div className="insight-card-title">
              <Pill size={16} style={{ color: 'var(--accent-teal)' }} /> Most Missed Medications
            </div>
            {missedMeds.map((m: any, i: number) => (
              <div key={i} className="med-insight-row">
                <span className="med-icon" style={{ display: 'flex', alignItems: 'center' }}><Pill size={18} /></span>
                <span className="med-name">{m.medication}</span>
                <div className="med-badge"><span className="med-count">{m.missed_count} missed</span></div>
              </div>
            ))}
          </div>
        )}

        {/* Elder breakdown (full width) */}
        {elderBreakdown.length > 0 && (
          <div className="insight-card" style={{ gridColumn: '1 / -1' }}>
            <div className="insight-card-title">
              <AlertTriangle size={16} style={{ color: 'var(--accent-teal)' }} /> Elders Needing Attention
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 }}>
              {elderBreakdown.map((e: any) => {
                const score = e.avg_score != null ? parseInt(e.avg_score) : null;
                const scoreColor = score == null ? '#94A3B8' : score >= 80 ? Colors.success : score >= 50 ? Colors.warning : Colors.danger;
                return (
                  <div key={e.elder_id} className="elder-insight-row" onClick={() => navigate(`/elder/${e.elder_id}`)}>
                    <div className="elder-initial">{e.elder_name[0]}</div>
                    <div style={{ flex: 1 }}>
                      <div className="elder-insight-name">{e.elder_name}</div>
                      <div className="elder-insight-meta">{e.total_calls || 0} calls this week</div>
                    </div>
                    <span className="elder-insight-score" style={{ color: scoreColor }}>{score != null ? `${score}%` : '—'}</span>
                    <span className="elder-insight-arrow" style={{ display: 'flex', alignItems: 'center' }}><ChevronRight size={18} style={{ color: 'var(--text-muted)' }} /></span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {concerns.length === 0 && missedMeds.length === 0 && trend.length === 0 && (
        <div className="empty-state">
          <CheckCircle2 size={56} style={{ color: Colors.success, marginBottom: 20 }} />
          <div className="empty-title">All clear!</div>
          <div className="empty-sub">Run some AI check-in calls to see insights appear here.</div>
        </div>
      )}
    </div>
  );
}
