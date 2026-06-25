import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import LeadForm from '@/components/LeadForm';
import { ILead } from '@/models/Lead';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getLead(id: string): Promise<ILead | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/leads/${id}`, { cache: 'no-store' });
    const data = await res.json();
    return data.success ? data.data : null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const lead = await getLead(id);
  return {
    title: lead ? `Edit ${lead.clientName} | UpReels CRM` : 'Edit Lead | UpReels CRM',
  };
}

export default async function EditLeadPage({ params }: PageProps) {
  const { id } = await params;
  const lead = await getLead(id);

  if (!lead) notFound();

  // Use leadId slug for back-link
  const slug = lead.leadId;

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
        <Link href={`/leads/${slug}`}>
          <button className="back-btn" aria-label="Back to lead">
            <ArrowLeft size={16} />
            Back
          </button>
        </Link>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
            Edit Lead
          </h1>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 1 }}>
            {lead.clientName} · {lead.leadId}
          </p>
        </div>
      </div>

      <div className="page-content">
        <LeadForm
          mode="edit"
          leadId={id}
          initialData={{
            clientName: lead.clientName,
            phoneNumber: lead.phoneNumber,
            requirement: lead.requirement,
            location: lead.location,
            budget: lead.budget,
            source: lead.source,
            status: lead.status,
            lastFollowupDate: lead.lastFollowupDate?.toString(),
            nextFollowupDate: lead.nextFollowupDate?.toString(),
            creatorAssigned: lead.creatorAssigned,
            remarks: lead.remarks,
            closureDate: lead.closureDate?.toString(),
          }}
        />
      </div>
    </div>
  );
}
