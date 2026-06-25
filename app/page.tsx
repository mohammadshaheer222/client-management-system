import { Metadata } from 'next';
import Link from 'next/link';
import dayjs from 'dayjs';
import { Users, AlertCircle, Clock, TrendingUp, Plus, ChevronRight, Camera } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import { LeadStatus } from '@/models/Lead';

export const metadata: Metadata = {
  title: 'Dashboard | UpReels CRM',
};

export const dynamic = 'force-dynamic';

interface StatsData {
  totalLeads: number;
  statusMap: Record<string, number>;
  overdueFollowups: number;
  todayFollowups: number;
  newThisMonth: number;
  recentLeads: Array<{
    _id: string;
    leadId: string;
    clientName: string;
    phoneNumber: string;
    status: LeadStatus;
    location?: string;
    createdAt: string;
    nextFollowupDate?: string;
  }>;
}

async function getStats(): Promise<StatsData | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/leads/stats`, { cache: 'no-store' });
    const data = await res.json();
    return data.success ? data.data : null;
  } catch {
    return null;
  }
}

const STATUS_LIST: LeadStatus[] = [
  'New Lead', 'Contacted', 'Quotation Sent', 'Follow-up', 'Confirmed', 'Completed', 'Lost'
];

export default async function DashboardPage() {
  const stats = await getStats();

  const total = stats?.totalLeads ?? 0;
  const overdue = stats?.overdueFollowups ?? 0;
  const todayF = stats?.todayFollowups ?? 0;
  const newMonth = stats?.newThisMonth ?? 0;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div>
      {/* ── Hero Header ── */}
      <div
        style={{
          background: 'linear-gradient(160deg, rgba(79,142,247,0.15) 0%, rgba(139,92,246,0.08) 100%)',
          padding: '28px 20px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 38, height: 38, borderRadius: 12,
                background: 'linear-gradient(135deg, #4f8ef7, #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Camera size={18} color="white" />
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>UpReels CRM</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>{greeting()} 👋</div>
            </div>
          </div>
          <Link href="/leads/new">
            <button className="btn btn-primary btn-sm" style={{ gap: 6 }}>
              <Plus size={14} />
              New Lead
            </button>
          </Link>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8 }}>
          {dayjs().format('dddd, MMMM D YYYY')}
        </p>
      </div>

      <div className="page-content">

        {/* ── Alert Cards ── */}
        {(overdue > 0 || todayF > 0) && (
          <div style={{ marginBottom: 16 }}>
            {overdue > 0 && (
              <div
                className="glass-card"
                style={{
                  padding: '12px 16px',
                  borderColor: 'rgba(248,113,113,0.25)',
                  background: 'rgba(248,113,113,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  marginBottom: 8,
                }}
              >
                <AlertCircle size={18} color="#f87171" />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#f87171' }}>
                    {overdue} Overdue Follow-up{overdue > 1 ? 's' : ''}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Action required immediately</div>
                </div>
                <Link href="/leads?filter=overdue" style={{ marginLeft: 'auto' }}>
                  <ChevronRight size={16} color="var(--text-muted)" />
                </Link>
              </div>
            )}
            {todayF > 0 && (
              <div
                className="glass-card"
                style={{
                  padding: '12px 16px',
                  borderColor: 'rgba(251,191,36,0.25)',
                  background: 'rgba(251,191,36,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <Clock size={18} color="#fbbf24" />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#fbbf24' }}>
                    {todayF} Follow-up{todayF > 1 ? 's' : ''} Due Today
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Don&apos;t miss them</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Stats Grid ── */}
        <div className="stats-grid">
          <div className="glass-card stat-card">
            <div className="stat-card-icon" style={{ background: 'rgba(79,142,247,0.12)' }}>
              <Users size={18} color="#4f8ef7" />
            </div>
            <div className="stat-card-value gradient-text">{total}</div>
            <div className="stat-card-label">Total Leads</div>
          </div>

          <div className="glass-card stat-card">
            <div className="stat-card-icon" style={{ background: 'rgba(52,211,153,0.12)' }}>
              <TrendingUp size={18} color="#34d399" />
            </div>
            <div className="stat-card-value" style={{ color: '#34d399' }}>{newMonth}</div>
            <div className="stat-card-label">This Month</div>
          </div>

          <div className="glass-card stat-card">
            <div className="stat-card-icon" style={{ background: 'rgba(248,113,113,0.12)' }}>
              <AlertCircle size={18} color="#f87171" />
            </div>
            <div className="stat-card-value" style={{ color: '#f87171' }}>{overdue}</div>
            <div className="stat-card-label">Overdue</div>
          </div>

          <div className="glass-card stat-card">
            <div className="stat-card-icon" style={{ background: 'rgba(251,191,36,0.12)' }}>
              <Clock size={18} color="#fbbf24" />
            </div>
            <div className="stat-card-value" style={{ color: '#fbbf24' }}>{todayF}</div>
            <div className="stat-card-label">Today</div>
          </div>
        </div>

        {/* ── Status Breakdown ── */}
        <div className="section-label">Status Breakdown</div>
        <div className="glass-card" style={{ padding: '16px', marginBottom: 20 }}>
          {STATUS_LIST.map((status) => {
            const count = stats?.statusMap?.[status] ?? 0;
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div key={status} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <StatusBadge status={status} size="sm" />
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {count}
                  </span>
                </div>
                <div style={{ height: 4, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${pct}%`,
                      background: 'linear-gradient(90deg, #4f8ef7, #8b5cf6)',
                      borderRadius: 99,
                      transition: 'width 0.6s ease',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Recent Leads ── */}
        {stats?.recentLeads && stats.recentLeads.length > 0 && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div className="section-label" style={{ marginBottom: 0 }}>Recent Leads</div>
              <Link href="/leads" style={{ fontSize: 12, color: 'var(--accent-blue)', fontWeight: 600, textDecoration: 'none' }}>
                See all →
              </Link>
            </div>

            {stats.recentLeads.map((lead) => (
              <Link key={lead._id} href={`/leads/${lead.leadId}`} style={{ textDecoration: 'none', display: 'block' }}>
                <div className="glass-card glass-card-hover" style={{ padding: '12px 16px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 40, height: 40, borderRadius: 12,
                      background: 'linear-gradient(135deg, rgba(79,142,247,0.2), rgba(139,92,246,0.2))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 15, fontWeight: 800, color: '#4f8ef7', flexShrink: 0,
                    }}
                  >
                    {lead.clientName[0]?.toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {lead.clientName}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                      {lead.leadId} · {dayjs(lead.createdAt).fromNow()}
                    </div>
                  </div>
                  <StatusBadge status={lead.status} size="sm" />
                </div>
              </Link>
            ))}
          </>
        )}

        {total === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Camera size={28} />
            </div>
            <div className="empty-state-title">No leads yet</div>
            <div className="empty-state-subtitle">Start adding client leads to track them</div>
            <Link href="/leads/new" style={{ display: 'inline-block', marginTop: 16 }}>
              <button className="btn btn-primary">
                <Plus size={16} />
                Add First Lead
              </button>
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
