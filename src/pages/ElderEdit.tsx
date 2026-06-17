import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eldersApi } from '../api/api';
import { Camera, Image as ImageIcon, X } from 'lucide-react';

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
      } catch { alert('Failed to load elder details'); navigate(-1); }
      finally { setInitialLoad(false); }
    })();
  }, [id, navigate]);

  function update(field: keyof typeof form, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) { setPhotoFile(file); setPhotoPreview(URL.createObjectURL(file)); }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { alert("Please enter the elder's name."); return; }
    setLoading(true);
    try {
      await eldersApi.update(id!, { ...form, age: form.age ? parseInt(form.age) : null });
      if (photoFile) eldersApi.uploadPhoto(id!, photoFile).catch(e => console.warn('Photo upload:', e));
      alert(`${form.name}'s profile has been updated.`);
      navigate(-1);
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Failed to save changes. Please try again.');
    } finally { setLoading(false); }
  }

  if (initialLoad) return <div className="loading-screen"><div className="spinner" /></div>;

  const displayPhoto = photoPreview || existingPhotoUrl;

  return (
    <div className="form-page">
      <div className="form-page-header">
        <div>
          <div className="page-title">Edit Elder</div>
          <div className="page-sub">Update {form.name}'s profile</div>
        </div>
        <button className="btn-cancel" onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <X size={14} /> Cancel
        </button>
      </div>

      <form onSubmit={handleSave}>
        <div className="form-layout">
          <div className="photo-upload-col">
            <div onClick={() => fileInputRef.current?.click()} style={{ position: 'relative', cursor: 'pointer' }}>
              {displayPhoto
                ? <img src={displayPhoto} className="photo-preview-circle" alt="Elder" />
                : <div className="photo-placeholder-circle" style={{ fontSize: 40, fontWeight: 700, color: 'var(--text-secondary)' }}>
                    {form.name[0] || '?'}
                  </div>
              }
              <div style={{ position: 'absolute', bottom: 4, right: 4, background: 'var(--accent-teal)', width: 28, height: 28, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF' }}>
                <Camera size={14} />
              </div>
            </div>
            <div className="photo-btns">
              <button type="button" className="photo-btn" onClick={() => fileInputRef.current?.click()} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <ImageIcon size={12} /> Library
              </button>
              <button type="button" className="photo-btn" onClick={() => { if (fileInputRef.current) { fileInputRef.current.setAttribute('capture', 'camera'); fileInputRef.current.click(); } }} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Camera size={12} /> Camera
              </button>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
          </div>

          <div className="form-fields-col">
            <div className="form-section-card">
              <div className="form-row">
                <div className="field-group">
                  <label className="field-label">Full Name *</label>
                  <input className="field-input" type="text" value={form.name} onChange={e => update('name', e.target.value)} placeholder="e.g. Margaret Thompson" />
                </div>
                <div className="field-group">
                  <label className="field-label">Age</label>
                  <input className="field-input" type="number" value={form.age} onChange={e => update('age', e.target.value)} placeholder="e.g. 78" />
                </div>
              </div>
              <div className="form-row">
                <div className="field-group">
                  <label className="field-label">Phone Number</label>
                  <input className="field-input" type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="e.g. +1-555-0100" />
                </div>
                <div className="field-group">
                  <label className="field-label">Home Address</label>
                  <input className="field-input" type="text" value={form.address} onChange={e => update('address', e.target.value)} placeholder="e.g. 123 Oak Street" />
                </div>
              </div>
              <div className="form-row">
                <div className="field-group">
                  <label className="field-label">Emergency Contact Name</label>
                  <input className="field-input" type="text" value={form.emergency_contact} onChange={e => update('emergency_contact', e.target.value)} placeholder="e.g. Linda Thompson" />
                </div>
                <div className="field-group">
                  <label className="field-label">Emergency Contact Phone</label>
                  <input className="field-input" type="tel" value={form.emergency_phone} onChange={e => update('emergency_phone', e.target.value)} placeholder="e.g. +1-555-0200" />
                </div>
              </div>
              <div className="field-group">
                <label className="field-label">Wellbeing & Care Notes</label>
                <textarea className="field-input field-textarea" value={form.medical_notes} onChange={e => update('medical_notes', e.target.value)} placeholder="Medications, conditions, allergies, special instructions..." />
              </div>
            </div>
            <button type="submit" className="btn-gradient" disabled={loading}>
              {loading ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
