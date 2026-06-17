import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { schedulesApi, eldersApi } from '../api/api';
import { Colors } from '../constants/theme';

const TIME_OPTIONS = ['07:00','08:00','08:30','09:00','10:00','12:00','12:30','13:00','14:00','16:00','18:00','18:30','19:00','20:00','21:00','22:00'];
const RECURRENCES = ['daily', 'weekdays', 'weekends', 'weekly', 'once'];
const TYPES = [
  { key: 'medication', label: 'Medication', icon: '💊' },
  { key: 'meal', label: 'Meal', icon: '🍽️' },
  { key: 'activity', label: 'Activity', icon: '🏃' },
];

function ScheduleForm({ initial, onSubmit, onCancel, submitLabel }: any) {
  const [type, setType] = useState(initial?.type || 'medication');
  const [label, setLabel] = useState(initial?.label || '');
  const [time, setTime] = useState(initial?.scheduled_time?.slice(0, 5) || '08:00');
  const [recurrence, setRecurrence] = useState(initial?.recurrence || 'daily');
  const [notes, setNotes] = useState(initial?.notes || '');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!label.trim()) { alert('Please enter a label.'); return; }
    setLoading(true);
    try {
      await onSubmit({ type, label: label.trim(), scheduled_time: time, recurrence, notes: notes.trim() || null });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="field-group" style={{ marginTop: 0 }}>
        <label className="field-label">Type</label>
        <div style={{ display: 'flex', gap: 10 }}>
          {TYPES.map(t => (
            <button
              key={t.key}
              type="button"
              onClick={() => setType(t.key)}
              style={{
                flex: 1, background: type === t.key ? Colors.primaryGlow : '#1A2640',
                border: `1px solid ${type === t.key ? Colors.primary : '#243050'}`,
                borderRadius: 12, padding: '12px 8px', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              }}
            >
              <span style={{ fontSize: 22 }}>{t.icon}</span>
              <span style={{ fontSize: 12, color: type === t.key ? Colors.primary : '#94A3B8', fontWeight: 600 }}>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="field-group">
        <label className="field-label">Label / Name</label>
        <input className="field-input" value={label} onChange={e => setLabel(e.target.value)} placeholder="e.g. Metformin 500mg" />
      </div>

      <div className="field-group">
        <label className="field-label">Time</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {TIME_OPTIONS.map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setTime(t)}
              style={{
                background: time === t ? Colors.primaryGlow : '#1A2640',
                border: `1px solid ${time === t ? Colors.primary : '#243050'}`,
                borderRadius: 10, padding: '8px 12px', cursor: 'pointer',
                color: time === t ? Colors.primary : '#94A3B8', fontSize: 13,
                fontWeight: time === t ? 700 : 500,
              }}
            >{t}</button>
          ))}
        </div>
      </div>

      <div className="field-group">
        <label className="field-label">Recurrence</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {RECURRENCES.map(r => (
            <button
              key={r}
              type="button"
              onClick={() => setRecurrence(r)}
              style={{
                background: recurrence === r ? Colors.primaryGlow : '#1A2640',
                border: `1px solid ${recurrence === r ? Colors.primary : '#243050'}`,
                borderRadius: 16, padding: '7px 14px', cursor: 'pointer',
                color: recurrence === r ? Colors.primary : '#94A3B8', fontSize: 12, fontWeight: 500,
              }}
            >{r}</button>
          ))}
        </div>
      </div>

      <div className="field-group">
        <label className="field-label">Notes (optional)</label>
        <input className="field-input" value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. Take with food" />
      </div>

      <div className="modal-actions">
        <button type="button" className="modal-cancel-btn" onClick={onCancel}>Cancel</button>
        <button type="submit" className="modal-confirm-btn" disabled={loading}>
          {loading ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2, display: 'inline-block' }} /> : submitLabel}
        </button>
      </div>
    </form>
  );
}

export default function ElderScheduler() {
  const { elderId } = useParams<{ elderId: string }>();
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState<any[]>([]);
  const [elderName, setElderName] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editSchedule, setEditSchedule] = useState<any>(null);

  const loadData = useCallback(async () => {
    try {
      const [schedRes, elderRes] = await Promise.all([
        schedulesApi.list(elderId!),
        eldersApi.get(elderId!),
      ]);
      setSchedules(schedRes.data);
      setElderName(elderRes.data.name);
    } catch {
      alert('Failed to load schedules');
    } finally {
      setLoading(false);
    }
  }, [elderId]);

  useEffect(() => { loadData(); }, [loadData]);

  async function deleteSchedule(id: string, label: string) {
    if (window.confirm(`Remove "${label}" from schedule?`)) {
      await schedulesApi.delete(id);
      setSchedules(prev => prev.filter(s => s.id !== id));
    }
  }

  const icons: any = { medication: '💊', meal: '🍽️', activity: '🏃' };
  const grouped: any = { medication: [], meal: [], activity: [] };
  schedules.forEach(s => { if (grouped[s.type]) grouped[s.type].push(s); });

  return (
    <div className="scheduler-page">
      <div className="scheduler-header" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#F1F5F9' }}>📅 Schedule</div>
          <div style={{ fontSize: 13, color: '#94A3B8', marginTop: 2 }}>{elderName}</div>
        </div>
        <button
          className="add-btn"
          onClick={() => setShowAdd(true)}
          style={{ whiteSpace: 'nowrap' }}
        >+ Add</button>
      </div>

      {loading ? (
        <div className="loading-screen"><div className="spinner" /></div>
      ) : (
        <div>
          {Object.entries(grouped).filter(([, items]: any) => items.length > 0).map(([type, items]: any) => (
            <div key={type} style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#F1F5F9', marginBottom: 12 }}>
                {icons[type]} {type.charAt(0).toUpperCase() + type.slice(1)}s
              </div>
              {items.map((s: any) => (
                <div key={s.id} className="schedule-item-card">
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, color: '#F1F5F9', fontWeight: 600 }}>{s.label}</div>
                    <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 3 }}>{s.recurrence} · {s.scheduled_time?.slice(0, 5)}</div>
                    {s.notes && <div style={{ fontSize: 12, color: '#4B6285', marginTop: 2 }}>{s.notes}</div>}
                  </div>
                  <button
                    style={{ background: Colors.primaryGlow, border: `1px solid ${Colors.primary}`, width: 32, height: 32, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 14, marginLeft: 8 }}
                    onClick={() => setEditSchedule(s)}
                  >✏️</button>
                  <button
                    className="schedule-del-btn"
                    onClick={() => deleteSchedule(s.id, s.label)}
                  >✕</button>
                </div>
              ))}
            </div>
          ))}

          {schedules.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">📅</div>
              <div className="empty-title">No schedules yet</div>
              <div className="empty-text">Tap + Add to create one</div>
            </div>
          )}
        </div>
      )}

      {/* Add modal */}
      {showAdd && (
        <div className="modal-overlay">
          <div className="menu-modal" style={{ maxWidth: 460 }} onClick={e => e.stopPropagation()}>
            <div className="menu-title" style={{ marginBottom: 20 }}>Add Schedule Item</div>
            <ScheduleForm
              submitLabel="Add Schedule"
              onCancel={() => setShowAdd(false)}
              onSubmit={async (data: any) => {
                await schedulesApi.create({ elder_id: elderId, ...data });
                setShowAdd(false);
                loadData();
              }}
            />
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editSchedule && (
        <div className="modal-overlay">
          <div className="menu-modal" style={{ maxWidth: 460 }} onClick={e => e.stopPropagation()}>
            <div className="menu-title" style={{ marginBottom: 20 }}>Edit Schedule Item</div>
            <ScheduleForm
              initial={editSchedule}
              submitLabel="Save Changes"
              onCancel={() => setEditSchedule(null)}
              onSubmit={async (data: any) => {
                await schedulesApi.update(editSchedule.id, data);
                setEditSchedule(null);
                loadData();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
