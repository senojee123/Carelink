import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { insightsApi } from '../api/api';
import { Colors } from '../constants/theme';

function ComplianceTrend({ data }: { data: Array<{ call_date: string; avg_score: number; call_count: number }> }) {
  if (!data || data.length === 0) {
    return <div style={{ textAlign: 'center', padding: '20px 0', color: Colors.textMuted, fontSize: 13 }}>No call data yet in the last 14 days</div>;
  }
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
            <div className="bar-bg">
              <div className="bar-rect" style={{ height: barH, backgroundColor: barColor }} />
            </div>
            <span className="day-label">{dayName}</span>
          </div>
        );
      })}
    </div>
  );
}

function StatusRing({ critical, warning, ok, total }: { critical: number; warning: number; ok: number; total: number }) {
  const items = [
    { label: 'Urgent', count: critical, color: Colors.statusCritical, emoji: '🔴' },
    { label: 'Attention', count: warning, color: Colors.statusWarning, emoji: '🟡' },
    { label: 'All Good', count: ok, color: Colors.statusOk, emoji: '🟢' },
  ];
  return (
    <div className="ring-row">
      {items.map(item => (
        <div key={item.label} className="ring-cell">
          <span className="ring-emoji">{item.emoji}</span>
          <span className="ring-count" style={{ color: item.color }}>{item.count}</span>
          <span className="ring-label">{item.label}</span>
          <span className="ring-pct">{total > 0 ? Math.round((item.count / total) * 100) : 0}%</span>
        </div>
      ))}
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
    } catch (err) {
      console.error('Failed to load insights:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadInsights(); }, [loadInsights]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <div className="loading-text">Analysing your care data...</div>
      </div>
    );
  }

  const summary = data?.summary || {};
  const trend = data?.compliance_trend || [];
  const concerns = data?.top_concerns || [];
  const missedMeds = data?.missed_medications || [];
  const elderBreakdown = data?.elder_breakdown || [];
  const complianceColor = summary.avg_compliance == null ? Colors.textMuted
    : summary.avg_compliance >= 80 ? Colors.success
    : summary.avg_compliance >= 50 ? Colors.warning
    : Colors.danger;

  return (
    <div className="dashboard-bg">
      <div className="page-scroll" style={{ paddingBottom: 120 }}>
        {/* Header */}
        <div className="insights-header">
          <div className="header-title">AI Insights 🧠</div>
          <div className="header-sub">Last 14 days across {summary.total_elders || 0} elders</div>
        </div>

        {/* Hero card */}
        <div className="hero-card">
          <div className="hero-inner">
            <div className="hero-left">
              <div className="hero-label">Avg Compliance Score</div>
              <div className="hero-num" style={{ color: complianceColor }}>
                {summary.avg_compliance != null ? `${summary.avg_compliance}%` : '—'}
              </div>
              <div className="hero-sub">across all elders this week</div>
            </div>
            <div className="hero-right">
              <div className="hero-stat-row">
                <span className="hero-stat-num">{summary.total_elders || 0}</span>
                <span className="hero-stat-label">Elders</span>
              </div>
              <div className="hero-stat-row">
                <span className="hero-stat-num" style={{ color: summary.critical_count > 0 ? Colors.danger : Colors.textMuted }}>
                  {summary.critical_count || 0}
                </span>
                <span className="hero-stat-label">Urgent</span>
              </div>
            </div>
          </div>
        </div>

        {/* Status breakdown */}
        <div className="insights-section">
          <div className="insights-section-title">📊 Status Breakdown</div>
          <StatusRing
            critical={summary.critical_count || 0}
            warning={summary.warning_count || 0}
            ok={summary.ok_count || 0}
            total={summary.total_elders || 0}
          />
        </div>

        {/* Compliance trend */}
        <div className="insights-section">
          <div className="insights-section-title">📈 14-Day Compliance Trend</div>
          <div className="chart-card">
            <ComplianceTrend data={trend} />
          </div>
        </div>

        {/* Elders needing attention */}
        {elderBreakdown.length > 0 && (
          <div className="insights-section">
            <div className="insights-section-title">⚠️ Elders Needing Attention</div>
            {elderBreakdown.map((e: any) => {
              const score = e.avg_score != null ? parseInt(e.avg_score) : null;
              const scoreColor = score == null ? Colors.textMuted : score >= 80 ? Colors.success : score >= 50 ? Colors.warning : Colors.danger;
              return (
                <div key={e.elder_id} className="elder-row-insight" onClick={() => navigate(`/elder/${e.elder_id}`)}>
                  <div className="elder-initial">{e.elder_name[0]}</div>
                  <div style={{ flex: 1 }}>
                    <div className="elder-insight-name">{e.elder_name}</div>
                    <div className="elder-insight-meta">{e.total_calls || 0} calls this week</div>
                  </div>
                  <span className="elder-score" style={{ color: scoreColor }}>{score != null ? `${score}%` : '—'}</span>
                  <span className="elder-arrow">›</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Top concerns */}
        {concerns.length > 0 && (
          <div className="insights-section">
            <div className="insights-section-title">💬 Top Concerns This Week</div>
            {concerns.map((c: any, i: number) => (
              <div key={i} className="concern-row">
                <div className="concern-rank">{i + 1}</div>
                <span className="concern-text">{c.concern}</span>
                <div className="concern-badge"><span className="concern-count">{c.occurrences}×</span></div>
              </div>
            ))}
          </div>
        )}

        {/* Missed medications */}
        {missedMeds.length > 0 && (
          <div className="insights-section">
            <div className="insights-section-title">💊 Most Missed Medications</div>
            {missedMeds.map((m: any, i: number) => (
              <div key={i} className="med-row">
                <span className="med-icon">💊</span>
                <span className="med-name">{m.medication}</span>
                <div className="med-badge"><span className="med-count">{m.missed_count} missed</span></div>
              </div>
            ))}
          </div>
        )}

        {concerns.length === 0 && missedMeds.length === 0 && trend.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">✅</div>
            <div className="empty-title">All clear!</div>
            <div className="empty-text">Run some AI check-in calls to see insights appear here.</div>
          </div>
        )}
      </div>
    </div>
  );
}
