import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { eldersApi } from '../api/api';

export default function ElderAdd() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    name: '', age: '', phone: '', emergency_contact: '', emergency_phone: '',
    medical_notes: '', address: '',
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update(field: keyof typeof form, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) { setPhotoFile(file); setPhotoPreview(URL.createObjectURL(file)); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { alert("Please enter the elder's name."); return; }
    setLoading(true);
    try {
      const res = await eldersApi.create({ ...form, age: form.age ? parseInt(form.age) : null });
      if (photoFile && res.data?.id) {
        eldersApi.uploadPhoto(res.data.id, photoFile).catch(e => console.warn('Photo upload:', e));
      }
      alert(`✅ ${form.name} has been added to your care list.`);
      navigate('/');
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Failed to add elder. Please try again.');
    } finally { setLoading(false); }
  }

  return (
    <div className="form-page">
      <div className="form-page-header">
        <div>
          <div className="page-title">Add New Elder</div>
          <div className="page-sub">Add a new elder to your care list</div>
        </div>
        <button className="btn-cancel" onClick={() => navigate(-1)}>✕ Cancel</button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-layout">
          {/* Photo column */}
          <div className="photo-upload-col">
            <div onClick={() => fileInputRef.current?.click()}>
              {photoPreview
                ? <img src={photoPreview} className="photo-preview-circle" alt="Elder" />
                : <div className="photo-placeholder-circle">
                    <span className="photo-camera-emoji">📷</span>
                    <span className="photo-hint">Add Photo</span>
                  </div>
              }
            </div>
            <div className="photo-btns">
              <button type="button" className="photo-btn" onClick={() => fileInputRef.current?.click()}>📂 Library</button>
              <button type="button" className="photo-btn" onClick={() => { if (fileInputRef.current) { fileInputRef.current.setAttribute('capture', 'camera'); fileInputRef.current.click(); } }}>📸 Camera</button>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
          </div>

          {/* Fields column */}
          <div className="form-fields-col">
            <div className="form-section-card">
              <div className="form-row">
                <div className="field-group">
                  <label className="field-label">👤 Full Name *</label>
                  <input className="field-input" type="text" value={form.name} onChange={e => update('name', e.target.value)} placeholder="e.g. Margaret Thompson" />
                </div>
                <div className="field-group">
                  <label className="field-label">🎂 Age</label>
                  <input className="field-input" type="number" value={form.age} onChange={e => update('age', e.target.value)} placeholder="e.g. 78" />
                </div>
              </div>
              <div className="form-row">
                <div className="field-group">
                  <label className="field-label">📱 Phone Number</label>
                  <input className="field-input" type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="e.g. +1-555-0100" />
                </div>
                <div className="field-group">
                  <label className="field-label">🏠 Home Address</label>
                  <input className="field-input" type="text" value={form.address} onChange={e => update('address', e.target.value)} placeholder="e.g. 123 Oak Street, Springfield" />
                </div>
              </div>
              <div className="form-row">
                <div className="field-group">
                  <label className="field-label">🆘 Emergency Contact Name</label>
                  <input className="field-input" type="text" value={form.emergency_contact} onChange={e => update('emergency_contact', e.target.value)} placeholder="e.g. Linda Thompson" />
                </div>
                <div className="field-group">
                  <label className="field-label">📞 Emergency Contact Phone</label>
                  <input className="field-input" type="tel" value={form.emergency_phone} onChange={e => update('emergency_phone', e.target.value)} placeholder="e.g. +1-555-0200" />
                </div>
              </div>
              <div className="field-group">
                <label className="field-label">🏥 Medical Notes</label>
                <textarea className="field-input field-textarea" value={form.medical_notes} onChange={e => update('medical_notes', e.target.value)} placeholder="Medications, conditions, allergies, special instructions..." />
              </div>
            </div>

            <button type="submit" className="btn-gradient" disabled={loading}>
              {loading ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : '✓ Add Elder to Care List'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
