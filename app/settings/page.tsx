import { Metadata } from 'next';
import { Camera, GitBranch, Database, Phone } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Settings | UpReels CRM',
};

export default function SettingsPage() {
  return (
    <div>
      <div
        style={{
          padding: '28px 16px 20px',
          borderBottom: '1px solid var(--border)',
          background: 'linear-gradient(160deg, rgba(139,92,246,0.1) 0%, transparent 80%)',
        }}
      >
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
          Settings
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
          UpReels CRM Configuration
        </p>
      </div>

      <div className="page-content">

        {/* ── About ── */}
        <div className="glass-card" style={{ padding: 20, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
            <div
              style={{
                width: 52, height: 52, borderRadius: 16,
                background: 'linear-gradient(135deg, #4f8ef7, #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Camera size={24} color="white" />
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>
                UpReels CRM
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                Client Management System v1.0
              </div>
            </div>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Purpose-built for photographers and videographers on the UpReels platform.
            Track leads, manage follow-ups, and close more shoots.
          </p>
        </div>

        {/* ── Tech Stack ── */}
        <div className="section-label">Tech Stack</div>
        <div className="glass-card" style={{ padding: '4px 0', marginBottom: 16 }}>
          {[
            { icon: Database, label: 'Database', value: 'MongoDB + Mongoose' },
            { icon: GitBranch, label: 'Backend', value: 'Node.js + Next.js API Routes' },
            { icon: Phone, label: 'Frontend', value: 'Next.js 14 (App Router)' },
            { icon: Camera, label: 'Platform', value: 'UpReels' },
          ].map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 16px', borderBottom: '1px solid var(--border)',
              }}
              className="detail-row"
            >
              <div
                style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'rgba(79,142,247,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon size={16} color="#4f8ef7" />
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
                <div style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 500 }}>{value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Status Guide ── */}
        <div className="section-label">Status Guide</div>
        <div className="glass-card" style={{ padding: '16px', marginBottom: 24 }}>
          {[
            { status: 'New Lead', desc: 'Just received, not yet contacted', color: '#4f8ef7', bg: 'rgba(79,142,247,0.12)' },
            { status: 'Contacted', desc: 'Initial contact made', color: '#22d3ee', bg: 'rgba(34,211,238,0.12)' },
            { status: 'Quotation Sent', desc: 'Pricing shared with client', color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
            { status: 'Follow-up', desc: 'Waiting for client response', color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' },
            { status: 'Confirmed', desc: 'Client confirmed the booking', color: '#34d399', bg: 'rgba(52,211,153,0.12)' },
            { status: 'Completed', desc: 'Shoot/project done', color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
            { status: 'Lost', desc: 'Lead did not convert', color: '#f87171', bg: 'rgba(248,113,113,0.12)' },
          ].map(({ status, desc, color, bg }) => (
            <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <span
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '4px 10px', borderRadius: 99,
                  fontSize: 11, fontWeight: 600,
                  background: bg, color: color,
                  border: `1px solid ${color}40`,
                  whiteSpace: 'nowrap', flexShrink: 0, minWidth: 120,
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, display: 'inline-block' }} />
                {status}
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{desc}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
