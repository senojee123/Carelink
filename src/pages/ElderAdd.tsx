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
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { alert("Please enter the elder's name."); return; }
    setLoading(true);
    try {
      const res = await eldersApi.create({ ...form, age: form.age ? parseInt(form.age) : null });
      if (photoFile && res.data?.id) {
        eldersApi.uploadPhoto(res.data.id, photoFile).catch(e => console.warn('Photo upload skipped:', e));
      }
      alert(`✅ ${form.name} has been added to your care list.`);
      navigate(-1);
    } catch (err: any) {
      alert(err?.response?.data?.error || err?.message || 'Failed to add elder. Please try again.');
    } finally {
      setLoading(false);
    }
  }

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
        <div className="modal-page-title">Add Elder</div>
        <div style={{ width: 80 }} />
      </div>

      <form onSubmit={handleSubmit}>
        {/* Photo picker */}
        <div className="photo-section">
          <div onClick={() => fileInputRef.current?.click()} style={{ cursor: 'pointer', position: 'relative' }}>
            {photoPreview
              ? <img src={photoPreview} className="photo-preview" alt="Elder" />
              : <div className="photo-placeholder">
                  <span className="camera-emoji">📷</span>
                  <span className="photo-hint">Add Photo</span>
                </div>
            }
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
          {loading ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2, display: 'inline-block', verticalAlign: 'middle' }} /> : '✓ Add Elder to Care List'}
        </button>
      </form>
    </div>
  );
}
