import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { callsApi } from '../api/api';
import { Colors } from '../constants/theme';

function MedBadge({ status }: { status: string }) {
  const map: any = {
    taken:  { color: Colors.success, bg: Colors.successGlow, icon: '✅', label: 'Taken' },
    missed: { color: Colors.danger,  bg: Colors.dangerGlow,  icon: '❌', label: 'Missed' },
    na:     { color: Colors.textMuted, bg: Colors.border,    icon: '—',  label: 'N/A' },
  };
  const s = map[status] || map.na;
  return (
    <div className="med-badge-inline" style={{ backgroundColor: s.bg, borderColor: s.color }}>
      <span style={{ fontSize: 12 }}>{s.icon}</span>
      <span style={{ color: s.color }}>{s.label}</span>
    </div>
  );
}

function TurnBubble({ turn }: { turn: { speaker: string; text: string; timestamp?: string } }) {
  const isElder = turn.speaker === 'ELDER';
  return (
    <div className={`turn-row${isElder ? ' elder-row' : ''}`}>
      {!isElder && <span className="speaker-icon">🤖</span>}
      <div className={`bubble ${isElder ? 'elder-bubble' : 'ai-bubble'}`}>
        <div className={`bubble-speaker${isElder ? ' elder-color' : ''}`}>
          {isElder ? '👴 Elder' : 'AI Assistant'}
        </div>
        <div className={`bubble-text${isElder ? ' elder-text' : ''}`}>{turn.text}</div>
        {turn.timestamp && <div className="bubble-timestamp">{turn.timestamp}</div>}
      </div>
      {isElder && <span className="speaker-icon">👴</span>}
    </div>
  );
}

export default function CallDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [call, setCall] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await callsApi.get(id!);
        setCall(res.data);
      } catch {
        alert('Failed to load call details');
        navigate(-1);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigate]);

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!call) return null;

  const analysis = call.llm_analysis;
  const turns = call.raw_transcript?.turns || [];
  const duration = call.duration_seconds ? `${Math.floor(call.duration_seconds / 60)}m ${call.duration_seconds % 60}s` : 'N/A';
  const moodIcon: any = { positive: '😊', neutral: '😐', low: '😟', distressed: '😰' };
  const scoreColor = analysis?.compliance_score >= 80 ? Colors.success : analysis?.compliance_score >= 50 ? Colors.warning : Colors.danger;

  return (
    <div className="call-detail-page">
      {/* Header */}
      <div style={{ paddingTop: 56, marginBottom: 24 }}>
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
        <div style={{ fontSize: 26, fontWeight: 800, color: '#F1F5F9' }}>Call Summary</div>
        <div style={{ fontSize: 13, color: '#94A3B8', marginTop: 4 }}>
          {call.elder_name} · {new Date(call.call_timestamp).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* Call meta */}
      <div className="call-meta-row">
        <div className="call-meta-card"><div className="call-meta-num">{duration}</div><div className="call-meta-label">Duration</div></div>
        <div className="call-meta-card"><div className="call-meta-num" style={{ color: scoreColor }}>{analysis?.compliance_score ?? '—'}%</div><div className="call-meta-label">Compliance</div></div>
        <div className="call-meta-card"><div className="call-meta-num">{moodIcon[analysis?.mood] || '—'}</div><div className="call-meta-label">Mood</div></div>
        <div className="call-meta-card"><div className="call-meta-num">{analysis?.distress_flag ? '🚨' : '✅'}</div><div className="call-meta-label">Distress</div></div>
      </div>

      {/* Summary */}
      {analysis?.summary && (
        <div className="detail-section">
          <div className="detail-section-title">📋 AI Summary</div>
          <div className="summary-card">
            <div className="summary-text">{analysis.summary}</div>
            {analysis._source === 'keyword_fallback' && (
              <div className="fallback-note">⚡ Keyword analysis (Gemini quota exceeded)</div>
            )}
          </div>
        </div>
      )}

      {/* Medications */}
      {analysis?.medications?.length > 0 && (
        <div className="detail-section">
          <div className="detail-section-title">💊 Medications</div>
          {analysis.medications.map((med: any, i: number) => (
            <div key={i} className="med-detail-row">
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, color: '#F1F5F9', fontWeight: 600 }}>{med.name}</div>
                <div style={{ fontSize: 12, color: '#4B6285', marginTop: 2 }}>{med.scheduled_time?.slice(0, 5)}</div>
              </div>
              <MedBadge status={med.status} />
            </div>
          ))}
        </div>
      )}

      {/* Meals */}
      {analysis?.meals && (
        <div className="detail-section">
          <div className="detail-section-title">🍽️ Meals</div>
          {Object.entries(analysis.meals).map(([meal, status]) => {
            const s = status as string;
            const mealIcon = meal === 'breakfast' ? '🌅' : meal === 'lunch' ? '☀️' : '🌙';
            const statusColor = s === 'eaten' ? Colors.success : s === 'skipped' ? Colors.danger : s === 'partial' ? Colors.warning : Colors.textMuted;
            return (
              <div key={meal} className="meal-detail-row">
                <span style={{ fontSize: 20, width: 30 }}>{mealIcon}</span>
                <span style={{ flex: 1, fontSize: 14, color: '#F1F5F9', fontWeight: 500 }}>{meal.charAt(0).toUpperCase() + meal.slice(1)}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: statusColor }}>{s === 'na' ? 'N/A' : s.charAt(0).toUpperCase() + s.slice(1)}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Concerns */}
      {analysis?.raw_concerns?.length > 0 && (
        <div className="detail-section">
          <div className="detail-section-title">⚠️ Concerns Noted</div>
          {analysis.raw_concerns.map((c: string, i: number) => (
            <div key={i} className="concern-detail-row">
              <span className="concern-dot">•</span>
              <span className="concern-detail-text">{c}</span>
            </div>
          ))}
        </div>
      )}

      {/* Transcript */}
      {turns.length > 0 && (
        <div className="detail-section">
          <div className="detail-section-title">🎙️ Call Transcript</div>
          <div className="transcript-card">
            {turns.map((turn: any, i: number) => <TurnBubble key={i} turn={turn} />)}
          </div>
        </div>
      )}
    </div>
  );
}
