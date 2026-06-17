import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eldersApi } from '../api/api';

export default function ElderEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    name: '', age: '', phone: '', emergency_contact: '', emergency_phone: '',
    medical_notes: '', address: '',
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [existingPhotoUrl, setExistingPhotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await eldersApi.get(id!);
        const e = res.data;
        setForm({
          name: e.name || '', age: e.age ? String(e.age) : '',
          phone: e.phone || '', emergency_contact: e.emergency_contact || '',
          emergency_phone: e.emergency_phone || '', medical_notes: e.medical_notes || '',
          address: e.address || '',
        });
        setExistingPhotoUrl(e.photo_url || null);
      } catch {
        alert('Failed to load elder details');
        navigate(-1);
      } finally {
        setInitialLoad(false);
      }
    })();
  }, [id, navigate]);

  function update(field: keyof typeof form, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { alert("Please enter the elder's name."); return; }
    setLoading(true);
    try {
      await eldersApi.update(id!, { ...form, age: form.age ? parseInt(form.age) : null });
      if (photoFile) {
        eldersApi.uploadPhoto(id!, photoFile).catch(e => console.warn('Photo upload skipped:', e));
      }
      alert(`✅ ${form.name}'s profile has been updated.`);
      navigate(-1);
    } catch (err: any) {
      alert(err?.response?.data?.error || err?.message || 'Failed to save changes. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (initialLoad) return <div className="loading-screen"><div className="spinner" /></div>;

  const displayPhoto = photoPreview || existingPhotoUrl;
  const fields = [
    { key: 'name', label: '👤 Full Name *', placeholder: 'e.g. Margaret Thompson', type: 'text' },
    { key: 'age', label: '🎂 Age', placeholder: 'e.g. 78', type: 'number' },
    { key: 'phone', label: '📱 Phone Number', placeholder: 'e.g. +1-555-0100', type: 'tel' },
    { key: 'emergency_contact', label: '🆘 Emergency Contact Name', placeholder: 'e.g. Linda Thompson', type: 'text' },
    { key: 'emergency_phone', label: '📞 Emergency Contact Phone', placeholder: 'e.g. +1-555-0200', type: 'tel' },
    { key: 'address', label: '🏠 Home Address', placeholder: 'e.g. 123 Oak Street, Springfield', type: 'text' },
  ];

  return (
    <div className="modal-page">
      <div className="modal-page-header">
        <button className="cancel-btn" onClick={() => navigate(-1)}>✕ Cancel</button>
        <div className="modal-page-title">Edit Elder</div>
        <div style={{ width: 80 }} />
      </div>

      <form onSubmit={handleSave}>
        {/* Photo section */}
        <div className="photo-section">
          <div onClick={() => fileInputRef.current?.click()} style={{ cursor: 'pointer', position: 'relative' }}>
            {displayPhoto
              ? <img src={displayPhoto} className="photo-preview" alt="Elder" />
              : <div className="photo-placeholder" style={{ fontSize: 40, fontWeight: 700, color: '#F1F5F9' }}>
                  {form.name[0] || '?'}
                </div>
            }
            <div style={{
              position: 'absolute', bottom: 0, right: 0,
              background: '#4E8EFF', width: 30, height: 30, borderRadius: 15,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
            }}>📷</div>
          </div>
          <div className="photo-buttons">
            <button type="button" className="photo-btn" onClick={() => fileInputRef.current?.click()}>📂 Library</button>
            <button type="button" className="photo-btn" onClick={() => { if (fileInputRef.current) { fileInputRef.current.setAttribute('capture', 'camera'); fileInputRef.current.click(); } }}>📸 Camera</button>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
        </div>

        <div className="form-card">
          {fields.map(field => (
            <div key={field.key} className="field-group">
              <label className="field-label">{field.label}</label>
              <input
                className="field-input"
                type={field.type}
                value={form[field.key as keyof typeof form]}
                onChange={e => update(field.key as keyof typeof form, e.target.value)}
                placeholder={field.placeholder}
              />
            </div>
          ))}
          <div className="field-group">
            <label className="field-label">🏥 Medical Notes</label>
            <textarea
              className="field-input field-textarea"
              value={form.medical_notes}
              onChange={e => update('medical_notes', e.target.value)}
              placeholder="Medications, conditions, allergies, special instructions..."
            />
          </div>
        </div>

        <button type="submit" className="btn-gradient" disabled={loading} style={{ borderRadius: 16, fontSize: 16, padding: 18 }}>
          {loading ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2, display: 'inline-block', verticalAlign: 'middle' }} /> : '✓ Save Changes'}
        </button>
      </form>
    </div>
  );
}
