'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, X, User } from 'lucide-react';

const STATUS_OPTIONS = [
  'New Lead',
  'Contacted',
  'Quotation Sent',
  'Follow-up',
  'Confirmed',
  'Completed',
  'Lost',
];

interface LeadFormData {
  clientName: string;
  phoneNumber: string;
  requirement: string;
  location: string;
  budget: string;
  source: string;
  status: string;
  lastFollowupDate: string;
  nextFollowupDate: string;
  creatorAssigned: string;
  remarks: string;
  closureDate: string;
  followupHistory?: string[];
  date: string;
}

interface LeadFormProps {
  initialData?: Partial<LeadFormData>;
  leadId?: string;
  mode: 'create' | 'edit';
  onCancel?: () => void;
}

const emptyForm: LeadFormData = {
  clientName: '',
  phoneNumber: '',
  requirement: '',
  location: '',
  budget: '',
  source: 'UpReels',
  status: 'New Lead',
  lastFollowupDate: '',
  nextFollowupDate: '',
  creatorAssigned: '',
  remarks: '',
  closureDate: '',
  followupHistory: [],
  date: '',
};

function toInputDate(val?: string): string {
  if (!val) return '';
  try {
    return new Date(val).toISOString().split('T')[0];
  } catch {
    return '';
  }
}

export default function LeadForm({ initialData, leadId, mode, onCancel }: LeadFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<LeadFormData>({
    ...emptyForm,
    ...initialData,
    lastFollowupDate: toInputDate(initialData?.lastFollowupDate),
    nextFollowupDate: toInputDate(initialData?.nextFollowupDate),
    closureDate: toInputDate(initialData?.closureDate),
    followupHistory: (initialData?.followupHistory || []).map((d) => toInputDate(String(d))),
    date: initialData?.date || toInputDate(new Date().toISOString()),
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [members, setMembers] = useState<string[]>([]);

  // Derive if current value is a known member / reserved value, or a custom free-text entry
  const isCustomCreator =
    form.creatorAssigned !== '' &&
    form.creatorAssigned !== 'Not Assigned' &&
    !members.includes(form.creatorAssigned);
  const [creatorSelectValue, setCreatorSelectValue] = useState(
    isCustomCreator ? '__custom__' : (form.creatorAssigned || 'Not Assigned')
  );
  const [customCreator, setCustomCreator] = useState(isCustomCreator ? form.creatorAssigned : '');

  useEffect(() => {
    fetch('/api/members')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          const names: string[] = d.data.map((m: { name: string }) => m.name);
          setMembers(names);
          // If current value is a known member, sync select
          if (names.includes(form.creatorAssigned)) {
            setCreatorSelectValue(form.creatorAssigned);
          }
        }
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreatorSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setCreatorSelectValue(val);
    if (val === '__custom__') {
      setForm((prev) => ({ ...prev, creatorAssigned: customCreator }));
    } else {
      setCustomCreator('');
      setForm((prev) => ({ ...prev, creatorAssigned: val === 'Not Assigned' ? '' : val }));
    }
  };

  const handleCustomCreatorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomCreator(e.target.value);
    setForm((prev) => ({ ...prev, creatorAssigned: e.target.value }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const url = mode === 'create' ? '/api/leads' : `/api/leads/${leadId}`;
      const method = mode === 'create' ? 'POST' : 'PUT';

      const payload = { ...form };
      // Convert empty date strings to undefined
      if (!payload.lastFollowupDate) delete (payload as Partial<LeadFormData>).lastFollowupDate;
      if (!payload.nextFollowupDate) delete (payload as Partial<LeadFormData>).nextFollowupDate;
      if (!payload.closureDate) delete (payload as Partial<LeadFormData>).closureDate;
      if (payload.followupHistory) {
        payload.followupHistory = payload.followupHistory.filter((d) => !!d);
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Something went wrong');
      }

      if (mode === 'create') {
        router.push(`/leads/${data.data.leadId}`);
      } else {
        router.push(`/leads/${leadId}`);
        router.refresh();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ paddingBottom: '24px' }}>
      {error && (
        <div
          className="glass-card"
          style={{ padding: '12px 16px', marginBottom: '16px', borderColor: 'rgba(248,113,113,0.3)', color: '#f87171', fontSize: '13px', fontWeight: 600 }}
        >
          {error}
        </div>
      )}

      {/* ── Client Info ── */}
      <div className="detail-section-title" style={{ marginBottom: '14px' }}>
        <span>Client Information</span>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="clientName">Client Name *</label>
        <input
          id="clientName"
          name="clientName"
          className="form-input"
          placeholder="Enter client name"
          value={form.clientName}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="phoneNumber">Phone Number *</label>
        <input
          id="phoneNumber"
          name="phoneNumber"
          className="form-input"
          placeholder="+91 00000 00000"
          value={form.phoneNumber}
          onChange={handleChange}
          required
          type="tel"
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="location">Location</label>
        <input
          id="location"
          name="location"
          className="form-input"
          placeholder="City / Area"
          value={form.location}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="requirement">Requirement</label>
        <textarea
          id="requirement"
          name="requirement"
          className="form-textarea"
          placeholder="e.g. Wedding photography, 2-day shoot..."
          value={form.requirement}
          onChange={handleChange}
          rows={3}
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="budget">Budget</label>
        <input
          id="budget"
          name="budget"
          className="form-input"
          placeholder="e.g. ₹50,000 – ₹80,000"
          value={form.budget}
          onChange={handleChange}
        />
      </div>

      <div className="divider" />

      {/* ── Lead Info ── */}
      <div className="detail-section-title" style={{ marginBottom: '14px' }}>
        <span>Lead Details</span>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="source">Source</label>
        <input
          id="source"
          name="source"
          className="form-input"
          placeholder="Source"
          value={form.source}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="date">Program Date</label>
        <input
          id="date"
          name="date"
          className="form-input"
          placeholder="e.g. 2026-06-26 or 25th June"
          value={form.date}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="creatorAssigned">
          <User size={13} style={{ display: 'inline', marginRight: 5, verticalAlign: 'middle' }} />
          Creator Assigned
        </label>
        <select
          id="creatorAssigned"
          className="form-select"
          value={creatorSelectValue}
          onChange={handleCreatorSelect}
        >
          <option value="Not Assigned">— Not Assigned —</option>
          {members.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
          <option value="__custom__">Custom...</option>
        </select>
        {creatorSelectValue === '__custom__' && (
          <input
            id="creatorAssignedCustom"
            className="form-input"
            placeholder="Type photographer / videographer name"
            value={customCreator}
            onChange={handleCustomCreatorChange}
            style={{ marginTop: 8 }}
            autoFocus
          />
        )}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="status">Status</label>
        <select
          id="status"
          name="status"
          className="form-select"
          value={form.status}
          onChange={handleChange}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="divider" />

      {/* ── Follow-up ── */}
      <div className="detail-section-title" style={{ marginBottom: '14px' }}>
        <span>Follow-up & Dates</span>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="lastFollowupDate">Last Follow-up Date</label>
        <input
          id="lastFollowupDate"
          name="lastFollowupDate"
          type="date"
          className="form-input"
          value={form.lastFollowupDate}
          onChange={handleChange}
          style={{ colorScheme: 'dark' }}
        />
      </div>

      {/* Previous Follow-up Dates */}
      {mode === 'edit' && (
        <div className="form-group" style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border)', marginBottom: '16px' }}>
          <label className="form-label" style={{ display: 'block', marginBottom: '8px' }}>Previous Follow-up Dates</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(form.followupHistory || []).map((hDate, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="date"
                  className="form-input"
                  value={hDate}
                  onChange={(e) => {
                    const newHist = [...(form.followupHistory || [])];
                    newHist[idx] = e.target.value;
                    setForm((prev) => ({ ...prev, followupHistory: newHist }));
                  }}
                  style={{ colorScheme: 'dark', flex: 1 }}
                />
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    const newHist = (form.followupHistory || []).filter((_, i) => i !== idx);
                    setForm((prev) => ({ ...prev, followupHistory: newHist }));
                  }}
                  style={{ padding: '8px 12px', height: '42px', minWidth: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <X size={15} style={{ color: '#f87171' }} />
                </button>
              </div>
            ))}
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => {
                const todayStr = toInputDate(new Date().toISOString());
                setForm((prev) => ({
                  ...prev,
                  followupHistory: [...(prev.followupHistory || []), todayStr],
                }));
              }}
              style={{ alignSelf: 'flex-start', marginTop: '4px', fontSize: '11px', padding: '6px 12px' }}
            >
              + Add Date
            </button>
          </div>
        </div>
      )}

      <div className="form-group">
        <label className="form-label" htmlFor="nextFollowupDate">Next Follow-up Date</label>
        <input
          id="nextFollowupDate"
          name="nextFollowupDate"
          type="date"
          className="form-input"
          value={form.nextFollowupDate}
          onChange={handleChange}
          style={{ colorScheme: 'dark' }}
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="closureDate">Closure Date</label>
        <input
          id="closureDate"
          name="closureDate"
          type="date"
          className="form-input"
          value={form.closureDate}
          onChange={handleChange}
          style={{ colorScheme: 'dark' }}
        />
      </div>

      <div className="divider" />

      {/* ── Remarks ── */}
      <div className="form-group">
        <label className="form-label" htmlFor="remarks">Remarks</label>
        <textarea
          id="remarks"
          name="remarks"
          className="form-textarea"
          placeholder="Any additional notes..."
          value={form.remarks}
          onChange={handleChange}
          rows={3}
        />
      </div>

      {/* ── Actions ── */}
      <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
        {onCancel && (
          <button type="button" className="btn btn-ghost" onClick={onCancel} style={{ flex: 1 }}>
            <X size={16} />
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="btn btn-primary"
          style={{ flex: 2 }}
          disabled={saving}
        >
          {saving ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
              Saving...
            </span>
          ) : (
            <>
              <Save size={16} />
              {mode === 'create' ? 'Create Lead' : 'Save Changes'}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
