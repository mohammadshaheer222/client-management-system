import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import LeadForm from '@/components/LeadForm';

export const metadata: Metadata = {
  title: 'Add New Lead | UpReels CRM',
};

export default function NewLeadPage() {
  return (
    <div>
      {/* ── Header ── */}
      <div
        style={{
          padding: '20px 16px 16px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <Link href="/leads">
          <button className="back-btn" aria-label="Back">
            <ArrowLeft size={16} />
            Back
          </button>
        </Link>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
            New Lead
          </h1>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 1 }}>
            Add a new client lead
          </p>
        </div>
      </div>

      <div className="page-content">
        <LeadForm mode="create" />
      </div>
    </div>
  );
}
