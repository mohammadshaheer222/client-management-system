'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, ArrowRight, Delete } from 'lucide-react';

interface Member {
  _id: string;
  name: string;
  color: string;
  role: string;
}

const AVATAR_COLORS = [
  '#4f8ef7', '#8b5cf6', '#34d399', '#f59e0b', '#f87171', '#22d3ee', '#a78bfa',
];

export default function LoginPage() {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [selected, setSelected] = useState<Member | null>(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // First-time setup state
  const [setupMode, setSetupMode] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPin, setNewPin] = useState('');
  const [newPin2, setNewPin2] = useState('');
  const [newColor, setNewColor] = useState('#4f8ef7');
  const [setupError, setSetupError] = useState('');
  const [setupLoading, setSetupLoading] = useState(false);

  useEffect(() => {
    fetch('/api/members')
      .then((r) => r.json())
      .then((d) => {
        setMembers(d.data || []);
        if (!d.data || d.data.length === 0) setSetupMode(true);
      })
      .finally(() => setFetching(false));
  }, []);

  // PIN entry via keypad
  const appendPin = (digit: string) => {
    if (pin.length < 4) setPin((p) => p + digit);
  };
  const deletePin = () => setPin((p) => p.slice(0, -1));

  // Auto-submit when 4 digits entered
  useEffect(() => {
    if (pin.length === 4 && selected) handleLogin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin]);

  const handleLogin = async () => {
    if (!selected || pin.length !== 4) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: selected.name, pin }),
      });
      const data = await res.json();
      if (data.success) {
        window.location.href = '/';
      } else {
        setError(data.error || 'Wrong PIN');
        setPin('');
      }
    } catch {
      setError('Something went wrong');
      setPin('');
    } finally {
      setLoading(false);
    }
  };

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSetupError('');
    if (newPin !== newPin2) { setSetupError('PINs do not match'); return; }
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) { setSetupError('PIN must be exactly 4 digits'); return; }
    setSetupLoading(true);
    try {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim(), pin: newPin, color: newColor }),
      });
      const data = await res.json();
      if (data.success) {
        const updated = await fetch('/api/members').then((r) => r.json());
        setMembers(updated.data || []);
        setSetupMode(false);
        setNewName(''); setNewPin(''); setNewPin2('');
      } else {
        setSetupError(data.error || 'Failed to create member');
      }
    } catch {
      setSetupError('Something went wrong');
    } finally {
      setSetupLoading(false);
    }
  };

  if (fetching) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  // ── First-time setup ──
  if (setupMode) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg,#4f8ef7,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 8px 24px rgba(79,142,247,0.4)' }}>
              <Camera size={26} color="white" />
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>Welcome to UpReels CRM</h1>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Add the first team member to get started</p>
          </div>

          <div className="glass-card" style={{ padding: 24 }}>
            <form onSubmit={handleSetup}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" placeholder="e.g. Shaheer" value={newName} onChange={(e) => setNewName(e.target.value)} required />
              </div>

              <div className="form-group">
                <label className="form-label">Pick a Color</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {AVATAR_COLORS.map((c) => (
                    <button key={c} type="button" onClick={() => setNewColor(c)}
                      style={{ width: 32, height: 32, borderRadius: '50%', background: c, border: newColor === c ? `3px solid white` : '3px solid transparent', cursor: 'pointer', transition: 'all 0.2s', transform: newColor === c ? 'scale(1.15)' : 'scale(1)' }} />
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">4-Digit PIN</label>
                <input className="form-input" type="number" placeholder="0000" maxLength={4} value={newPin} onChange={(e) => setNewPin(e.target.value.slice(0, 4))} style={{ letterSpacing: 8, fontSize: 20 }} required />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm PIN</label>
                <input className="form-input" type="number" placeholder="0000" maxLength={4} value={newPin2} onChange={(e) => setNewPin2(e.target.value.slice(0, 4))} style={{ letterSpacing: 8, fontSize: 20 }} required />
              </div>

              {setupError && <div style={{ color: '#f87171', fontSize: 13, fontWeight: 600, marginBottom: 12 }}>{setupError}</div>}

              <button type="submit" className="btn btn-primary btn-full" disabled={setupLoading}>
                {setupLoading ? 'Creating...' : 'Create First Member'}
                <ArrowRight size={16} />
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ── Member select ──
  if (!selected) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg,#4f8ef7,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 8px 24px rgba(79,142,247,0.4)' }}>
            <Camera size={26} color="white" />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>UpReels CRM</h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>Who are you?</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 320 }}>
          {members.map((m) => (
            <button
              key={m._id}
              onClick={() => { setSelected(m); setPin(''); setError(''); }}
              className="glass-card glass-card-hover"
              style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', transition: 'all 0.2s' }}
            >
              <div style={{ width: 48, height: 48, borderRadius: 14, background: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, color: 'white', flexShrink: 0, boxShadow: `0 4px 14px ${m.color}60` }}>
                {m.name[0].toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{m.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{m.role}</div>
              </div>
              <ArrowRight size={16} color="var(--text-muted)" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── PIN entry ──
  const dots = [0, 1, 2, 3];
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      {/* Avatar */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ width: 72, height: 72, borderRadius: 20, background: selected.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 900, color: 'white', margin: '0 auto 12px', boxShadow: `0 8px 28px ${selected.color}60`, animation: 'scaleIn 0.3s cubic-bezier(.2,.8,.3,1)' }}>
          {selected.name[0].toUpperCase()}
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>{selected.name}</div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>Enter your 4-digit PIN</div>
      </div>

      {/* PIN dots */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 24 }}>
        {dots.map((i) => (
          <div key={i} style={{ width: 16, height: 16, borderRadius: '50%', background: i < pin.length ? selected.color : 'var(--border)', transition: 'all 0.2s', transform: i < pin.length ? 'scale(1.2)' : 'scale(1)' }} />
        ))}
      </div>

      {error && (
        <div style={{ color: '#f87171', fontSize: 13, fontWeight: 600, marginBottom: 16, textAlign: 'center' }}>{error}</div>
      )}

      {/* Keypad */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, width: '100%', maxWidth: 280 }}>
        {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((k) => (
          <button
            key={k}
            onClick={() => k === '⌫' ? deletePin() : k !== '' ? appendPin(k) : undefined}
            disabled={loading || k === ''}
            style={{
              height: 64, borderRadius: 14, fontSize: k === '⌫' ? 18 : 22, fontWeight: 700,
              background: k === '' ? 'transparent' : 'var(--bg-card)',
              border: k === '' ? 'none' : '1px solid var(--border)',
              color: 'var(--text-primary)', cursor: k === '' ? 'default' : 'pointer',
              transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'inherit',
            }}
            onMouseDown={(e) => { if (k !== '') (e.currentTarget.style.transform = 'scale(0.92)'); }}
            onMouseUp={(e) => { (e.currentTarget.style.transform = 'scale(1)'); }}
          >
            {k === '⌫' ? <Delete size={20} /> : k}
          </button>
        ))}
      </div>

      <button
        onClick={() => { setSelected(null); setPin(''); setError(''); }}
        className="back-btn"
        style={{ marginTop: 28 }}
      >
        ← Switch member
      </button>
    </div>
  );
}
