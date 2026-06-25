import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
  ArrowLeft, Phone, MapPin, DollarSign, User, Tag,
  Calendar, Clock, Pencil, MessageSquare, CheckCircle2, Trash2
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import DeleteLeadButton from './DeleteLeadButton';
import Lead, { ILead, LeadStatus } from '@/models/Lead';
import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';
import ThemeToggle from '@/components/ThemeToggle';

dayjs.extend(relativeTime);

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getLead(id: string): Promise<ILead | null> {
  try {
    await dbConnect();
    // Try leadId slug first
    const bySlug = await Lead.findOne({ leadId: id.toUpperCase() }).lean();
    if (bySlug) return JSON.parse(JSON.stringify(bySlug)) as ILead;

    // Fallback to MongoDB _id (for any existing links)
    if (mongoose.isValidObjectId(id)) {
      const byId = await Lead.findById(id).lean();
      if (byId) return JSON.parse(JSON.stringify(byId)) as ILead;
    }
    return null;
  } catch (error) {
    console.error('getLead error:', error);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const lead = await getLead(id);
  return {
    title: lead ? `${lead.clientName} | UpReels CRM` : 'Lead | UpReels CRM',
  };
}

const statusOrder: LeadStatus[] = [
  'New Lead', 'Contacted', 'Quotation Sent', 'Follow-up', 'Confirmed', 'Completed', 'Lost'
];

const statusColorMap: Record<LeadStatus, string> = {
  'New Lead': '#4f8ef7',
  'Contacted': '#22d3ee',
  'Quotation Sent': '#a78bfa',
  'Follow-up': '#fbbf24',
  'Confirmed': '#34d399',
  'Completed': '#10b981',
  'Lost': '#f87171',
};

function DetailRow({ label, value, icon: Icon }: { label: string; value?: string; icon?: React.ElementType }) {
  if (!value) return null;
  return (
    <div className="detail-row">
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
        {Icon && <Icon size={11} color="var(--text-muted)" />}
        <span className="detail-row-label">{label}</span>
      </div>
      <span className="detail-row-value">{value}</span>
    </div>
  );
}

export default async function LeadDetailPage({ params }: PageProps) {
  const { id } = await params;
  const lead = await getLead(id);

  if (!lead) notFound();

  const today = dayjs().startOf('day');
  const nextF = lead.nextFollowupDate ? dayjs(lead.nextFollowupDate) : null;
  const isOverdue = nextF && nextF.isBefore(today) && !['Completed', 'Lost'].includes(lead.status);
  const currentStatusIdx = statusOrder.indexOf(lead.status as LeadStatus);
  const slug = lead.leadId;

  return (
    <div>
      {/* ── Header ── */}
      <div
        style={{
          background: 'linear-gradient(160deg, rgba(79,142,247,0.12) 0%, rgba(139,92,246,0.06) 100%)',
          padding: '20px 16px 24px',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <Link href="/leads">
            <button className="back-btn">
              <ArrowLeft size={16} />
              All Leads
            </button>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ThemeToggle />
            <Link href={`/leads/${slug}/edit`}>
              <button className="btn btn-ghost btn-sm">
                <Pencil size={14} />
                Edit
              </button>
            </Link>
          </div>
        </div>

        {/* Avatar + Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 56, height: 56, borderRadius: 16,
              background: 'linear-gradient(135deg, #4f8ef7, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, fontWeight: 900, color: 'white', flexShrink: 0,
            }}
          >
            {lead.clientName[0]?.toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1
              style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px', marginBottom: 3 }}
            >
              {lead.clientName}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <StatusBadge status={lead.status as LeadStatus} />
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{lead.leadId}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <a href={`tel:${lead.phoneNumber}`} style={{ flex: 1, textDecoration: 'none' }}>
            <button className="btn btn-primary btn-full" style={{ fontSize: 13 }}>
              <Phone size={15} />
              Call Client
            </button>
          </a>
          <a href={`https://wa.me/${lead.phoneNumber?.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" style={{ flex: 1, textDecoration: 'none' }}>
            <button className="btn btn-ghost btn-full" style={{ fontSize: 13 }}>
              <MessageSquare size={15} />
              WhatsApp
            </button>
          </a>
        </div>
      </div>

      <div className="page-content">

        {/* ── Overdue Alert ── */}
        {isOverdue && (
          <div
            className="glass-card"
            style={{ padding: '12px 16px', marginBottom: 16, borderColor: 'rgba(248,113,113,0.3)', background: 'rgba(248,113,113,0.06)', display: 'flex', alignItems: 'center', gap: 10 }}
          >
            <Clock size={16} color="#f87171" />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#f87171' }}>
              Follow-up was due {nextF!.fromNow()}
            </span>
          </div>
        )}

        {/* ── Status Pipeline ── */}
        <div className="glass-card" style={{ padding: '16px', marginBottom: 16 }}>
          <div className="detail-section-title" style={{ marginBottom: 12 }}>
            <CheckCircle2 size={12} />
            Status Pipeline
          </div>
          <div className="status-pipeline">
            {statusOrder.filter(s => s !== 'Lost').map((s, idx) => {
              const isActive = idx <= currentStatusIdx && lead.status !== 'Lost';
              const color = statusColorMap[s];
              return (
                <div key={s} className="pipeline-step">
                  <div
                    className={`pipeline-dot ${isActive ? 'active' : ''}`}
                    style={isActive ? { '--s-color': color, '--s-bg': `${color}20` } as React.CSSProperties : {}}
                    title={s}
                  >
                    {idx + 1}
                  </div>
                  {idx < statusOrder.filter(s => s !== 'Lost').length - 1 && (
                    <div className={`pipeline-line ${isActive && idx < currentStatusIdx ? 'active' : ''}`} />
                  )}
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 8 }}>
            {statusOrder.filter(s => s !== 'Lost').map((s) => (
              <span key={s} style={{ fontSize: 9, color: 'var(--text-muted)', flex: '0 0 auto' }}>{s.split(' ')[0]}</span>
            ))}
          </div>
        </div>

        {/* ── Client Info ── */}
        <div className="glass-card" style={{ padding: '16px', marginBottom: 16 }}>
          <div className="detail-section-title">
            <User size={12} />
            Client Information
          </div>
          <DetailRow label="Phone" value={lead.phoneNumber} icon={Phone} />
          <DetailRow label="Location" value={lead.location} icon={MapPin} />
          <DetailRow label="Budget" value={lead.budget} icon={DollarSign} />
          <DetailRow label="Requirement" value={lead.requirement} />
        </div>

        {/* ── Lead Info ── */}
        <div className="glass-card" style={{ padding: 14, marginBottom: 16 }}>
          <div className="detail-section-title" style={{ marginBottom: 8 }}>
            <Tag size={12} />
            Lead
          </div>
          <DetailRow label="Source" value={lead.source} />
          <DetailRow label="Creator" value={lead.creatorAssigned} />
          <DetailRow label="Date Added" value={dayjs(lead.date).format('DD MMM YYYY')} icon={Calendar} />
        </div>

        {/* ── Follow-up ── */}
        <div className="glass-card" style={{ padding: '16px', marginBottom: 16 }}>
          <div className="detail-section-title">
            <Clock size={12} />
            Follow-up & Dates
          </div>
          <DetailRow
            label="Last Follow-up"
            value={lead.lastFollowupDate ? dayjs(lead.lastFollowupDate).format('DD MMM YYYY') : undefined}
            icon={Calendar}
          />
          <DetailRow
            label="Next Follow-up"
            value={lead.nextFollowupDate ? dayjs(lead.nextFollowupDate).format('DD MMM YYYY') : undefined}
            icon={Calendar}
          />
          <DetailRow
            label="Closure Date"
            value={lead.closureDate ? dayjs(lead.closureDate).format('DD MMM YYYY') : undefined}
            icon={Calendar}
          />
          {lead.followupHistory && lead.followupHistory.length > 0 && (
            <div style={{ marginTop: '14px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                Previous Follow-up Dates
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {lead.followupHistory.map((d: any, index: number) => (
                  <span
                    key={index}
                    style={{
                      fontSize: '11px',
                      color: 'var(--text-secondary)',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border)',
                      borderRadius: '99px',
                      padding: '4px 10px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <Calendar size={10} color="var(--text-muted)" />
                    {dayjs(d).format('DD MMM YYYY')}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Remarks ── */}
        {lead.remarks && (
          <div className="glass-card" style={{ padding: '16px', marginBottom: 16 }}>
            <div className="detail-section-title">
              <MessageSquare size={12} />
              Remarks
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {lead.remarks}
            </p>
          </div>
        )}

        {/* ── Meta ── */}
        <div style={{ padding: '0 4px', marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>
            Created {dayjs(lead.createdAt).format('DD MMM YYYY, h:mm A')}
          </div>
          {lead.updatedAt && lead.updatedAt !== lead.createdAt && (
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Updated {dayjs(lead.updatedAt).format('DD MMM YYYY, h:mm A')}
            </div>
          )}
        </div>

        {/* ── Danger Zone ── */}
        <div className="glass-card" style={{ padding: '16px', borderColor: 'rgba(248,113,113,0.15)', marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#f87171', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Danger Zone
          </div>
          <DeleteLeadButton leadId={id} />
        </div>

      </div>
    </div>
  );
}
