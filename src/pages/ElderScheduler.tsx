import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { schedulesApi, eldersApi } from '../api/api';
import { Colors } from '../constants/theme';
import {
  ArrowLeft,
  Calendar,
  Pill,
  Utensils,
  Activity,
  Plus,
  Edit,
  Trash2,
  Clock,
  ChevronLeft
} from 'lucide-react';

const TIME_OPTIONS = ['07:00','08:00','08:30','09:00','10:00','12:00','12:30','13:00','14:00','16:00','18:00','18:30','19:00','20:00','21:00','22:00'];
const RECURRENCES = ['daily', 'weekdays', 'weekends', 'weekly', 'once'];

const TYPES = [
  { key: 'medication', label: 'Medication', icon: <Pill size={18} /> },
  { key: 'meal', label: 'Meal', icon: <Utensils size={18} /> },
  { key: 'activity', label: 'Activity', icon: <Activity size={18} /> },
];

const ICONS: Record<string, React.ReactNode> = {
  medication: <Pill size={18} style={{ color: 'var(--accent-teal)' }} />,
  meal: <Utensils size={18} style={{ color: 'var(--accent-lavender)' }} />,
  activity: <Activity size={18} style={{ color: 'var(--accent-blue)' }} />
};

function ScheduleForm({ initial, onSubmit, submitLabel }: any) {
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
    try { await onSubmit({ type, label: label.trim(), scheduled_time: time, recurrence, notes: notes.trim() || null }); }
    finally { setLoading(false); }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="field-group">
        <label className="field-label">Type</label>
        <div style={{ display: 'flex', gap: 8 }}>
          {TYPES.map(t => {
            const isSelected = type === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setType(t.key)}
                style={{
                  flex: 1,
                  background: isSelected ? 'var(--accent-teal-light)' : 'var(--bg-secondary)',
                  border: `1px solid ${isSelected ? 'var(--accent-teal)' : 'var(--border-color)'}`,
                  color: isSelected ? 'var(--accent-teal)' : 'var(--text-secondary)',
                  borderRadius: 10, padding: '10px 6px', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center' }}>{t.icon}</span>
                <span style={{ fontSize: 11, fontWeight: 600 }}>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="field-group">
        <label className="field-label">Label / Name</label>
        <input className="field-input" value={label} onChange={e => setLabel(e.target.value)} placeholder="e.g. Metformin 500mg" />
      </div>

      <div className="field-group">
        <label className="field-label">Time</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {TIME_OPTIONS.map(t => {
            const isSelected = time === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setTime(t)}
                style={{
                  background: isSelected ? 'var(--accent-teal-light)' : 'var(--bg-secondary)',
                  border: `1px solid ${isSelected ? 'var(--accent-teal)' : 'var(--border-color)'}`,
                  color: isSelected ? 'var(--accent-teal)' : 'var(--text-secondary)',
                  borderRadius: 8, padding: '6px 10px', cursor: 'pointer',
                  fontSize: 12, fontWeight: isSelected ? 700 : 500,
                }}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      <div className="field-group">
        <label className="field-label">Recurrence</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {RECURRENCES.map(r => {
            const isSelected = recurrence === r;
            return (
              <button
                key={r}
                type="button"
                onClick={() => setRecurrence(r)}
                style={{
                  background: isSelected ? 'var(--accent-teal-light)' : 'var(--bg-secondary)',
                  border: `1px solid ${isSelected ? 'var(--accent-teal)' : 'var(--border-color)'}`,
                  color: isSelected ? 'var(--accent-teal)' : 'var(--text-secondary)',
                  borderRadius: 16, padding: '6px 14px', cursor: 'pointer',
                  fontSize: 12, fontWeight: 500,
                }}
              >
                {r}
              </button>
            );
          })}
        </div>
      </div>

      <div className="field-group">
        <label className="field-label">Notes (optional)</label>
        <input className="field-input" value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. Take with food" />
      </div>

      <button type="submit" className="btn-gradient" style={{ width: '100%' }} disabled={loading}>
        {loading ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : submitLabel}
      </button>
    </form>
  );
}

export default function ElderScheduler() {
  const { elderId } = useParams<{ elderId: string }>();
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState<any[]>([]);
  const [elderName, setElderName] = useState('');
  const [loading, setLoading] = useState(true);
  const [editSchedule, setEditSchedule] = useState<any>(null);
  const [addMode, setAddMode] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [schedRes, elderRes] = await Promise.all([schedulesApi.list(elderId!), eldersApi.get(elderId!)]);
      setSchedules(schedRes.data);
      setElderName(elderRes.data.name);
    } catch { alert('Failed to load schedules'); }
    finally { setLoading(false); }
  }, [elderId]);

  useEffect(() => { loadData(); }, [loadData]);

  async function deleteSchedule(id: string, label: string) {
    if (window.confirm(`Remove "${label}" from schedule?`)) {
      await schedulesApi.delete(id);
      setSchedules(prev => prev.filter(s => s.id !== id));
    }
  }

  const grouped: any = { medication: [], meal: [], activity: [] };
  schedules.forEach(s => { if (grouped[s.type]) grouped[s.type].push(s); });

  return (
    <div>
      <button className="back-btn" onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <ArrowLeft size={14} /> Back
      </button>

      <div className="page-header">
        <div>
          <div className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Calendar size={26} style={{ color: 'var(--accent-teal)' }} /> Schedule Manager
          </div>
          <div className="page-sub">{elderName}</div>
        </div>
      </div>

      {loading ? (
        <div className="loading-screen"><div className="spinner" /></div>
      ) : (
        <div className="scheduler-layout">
          {/* Schedule list */}
          <div>
            {Object.entries(grouped).filter(([, items]: any) => items.length > 0).map(([type, items]: any) => (
              <div key={type} style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                  {ICONS[type]} {type.charAt(0).toUpperCase() + type.slice(1)}s
                </div>
                {items.map((s: any) => (
                  <div key={s.id} className="schedule-item-card">
                    <span style={{ display: 'flex', alignItems: 'center' }}>{ICONS[s.type]}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 600 }}>{s.label}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{s.recurrence} · {s.scheduled_time?.slice(0, 5)}</div>
                      {s.notes && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{s.notes}</div>}
                    </div>
                    <button className="schedule-edit-btn" onClick={() => { setEditSchedule(s); setAddMode(false); }}>Edit</button>
                    <button
                      className="schedule-del-btn"
                      onClick={() => deleteSchedule(s.id, s.label)}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ))}

            {schedules.length === 0 && (
              <div className="empty-state" style={{ paddingTop: 60 }}>
                <Calendar size={56} style={{ color: 'var(--text-muted)', marginBottom: 20 }} />
                <div className="empty-title">No schedules yet</div>
                <div className="empty-sub">Use the form on the right to add medications, meals and activities.</div>
              </div>
            )}
          </div>

          {/* Add / Edit panel */}
          <div className="add-schedule-panel">
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              <button
                onClick={() => setAddMode(true)}
                style={{
                  flex: 1, padding: '9px', borderRadius: 8, border: '1px solid',
                  borderColor: addMode ? 'var(--accent-teal)' : 'var(--border-color)',
                  background: addMode ? 'var(--accent-teal-light)' : 'var(--bg-secondary)',
                  color: addMode ? 'var(--accent-teal)' : 'var(--text-secondary)',
                  fontWeight: 600, cursor: 'pointer', fontSize: 13,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4
                }}
              >
                <Plus size={14} /> Add New
              </button>
              {editSchedule && (
                <button
                  onClick={() => setAddMode(false)}
                  style={{
                    flex: 1, padding: '9px', borderRadius: 8, border: '1px solid',
                    borderColor: !addMode ? 'var(--accent-teal)' : 'var(--border-color)',
                    background: !addMode ? 'var(--accent-teal-light)' : 'var(--bg-secondary)',
                    color: !addMode ? 'var(--accent-teal)' : 'var(--text-secondary)',
                    fontWeight: 600, cursor: 'pointer', fontSize: 13,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4
                  }}
                >
                  <Edit size={14} /> Edit
                </button>
              )}
            </div>

            {addMode ? (
              <ScheduleForm
                key="add"
                submitLabel="Add to Schedule"
                onSubmit={async (data: any) => {
                  await schedulesApi.create({ elder_id: elderId, ...data });
                  loadData();
                }}
              />
            ) : editSchedule && (
              <ScheduleForm
                key={editSchedule.id}
                initial={editSchedule}
                submitLabel="Save Changes"
                onSubmit={async (data: any) => {
                  await schedulesApi.update(editSchedule.id, data);
                  setEditSchedule(null);
                  setAddMode(true);
                  loadData();
                }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
