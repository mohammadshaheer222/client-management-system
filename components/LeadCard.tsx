'use client';

import Link from 'next/link';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Phone, MapPin, DollarSign, AlertCircle, Clock, User, Calendar } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { LeadStatus } from '@/models/Lead';

dayjs.extend(relativeTime);

const statusClassMap: Record<LeadStatus, string> = {
  'New Lead': 'status-new-lead',
  'Contacted': 'status-contacted',
  'Quotation Sent': 'status-quotation-sent',
  'Follow-up': 'status-follow-up',
  'Confirmed': 'status-confirmed',
  'Completed': 'status-completed',
  'Lost': 'status-lost',
};

interface Lead {
  _id: string;
  leadId: string;
  clientName: string;
  phoneNumber: string;
  requirement?: string;
  location?: string;
  budget?: string;
  status: LeadStatus;
  assignedTo?: string;
  creatorAssigned?: string;
  nextFollowupDate?: string;
  createdAt: string;
  date?: string;
}

interface LeadCardProps {
  lead: Lead;
}

export default function LeadCard({ lead }: LeadCardProps) {
  const statusCls = statusClassMap[lead.status] || 'status-new-lead';

  const today = dayjs().startOf('day');
  const nextFollowup = lead.nextFollowupDate ? dayjs(lead.nextFollowupDate) : null;
  const isOverdue = nextFollowup && nextFollowup.isBefore(today) && !['Completed', 'Lost'].includes(lead.status);
  const isToday = nextFollowup && nextFollowup.isSame(today, 'day');

  return (
    <Link href={`/leads/${lead.leadId}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div className={`glass-card glass-card-hover lead-card ${statusCls} fade-in`}>
        <div className="lead-card-header">
          <div>
            <div className="lead-card-name">{lead.clientName}</div>
            <div className="lead-card-id">{lead.leadId}</div>
          </div>
          <StatusBadge status={lead.status} size="sm" />
        </div>

        <div className="lead-card-meta">
          {lead.phoneNumber && (
            <div className="lead-meta-row">
              <Phone size={13} />
              <span>{lead.phoneNumber}</span>
            </div>
          )}
          {lead.location && (
            <div className="lead-meta-row">
              <MapPin size={13} />
              <span>{lead.location}</span>
            </div>
          )}
          {lead.budget && (
            <div className="lead-meta-row">
              <DollarSign size={13} />
              <span>{lead.budget}</span>
            </div>
          )}
          {lead.date && (
            <div className="lead-meta-row">
              <Calendar size={13} style={{ color: 'var(--accent-blue)' }} />
              <span style={{ fontWeight: 500 }}>
                Program: {lead.date}
              </span>
            </div>
          )}
          <div className="lead-meta-row" style={{ marginTop: 2 }}>
            <User size={13} style={{ opacity: lead.creatorAssigned ? 1 : 0.4 }} />
            <span
              style={{
                fontSize: '12px',
                fontWeight: lead.creatorAssigned ? 600 : 400,
                color: lead.creatorAssigned
                  ? 'var(--accent)'
                  : 'var(--text-muted)',
                fontStyle: lead.creatorAssigned ? 'normal' : 'italic',
              }}
            >
              {lead.creatorAssigned || 'Not Assigned'}
            </span>
          </div>
        </div>

        <div className="lead-card-footer">
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            {dayjs(lead.createdAt).fromNow()}
          </span>

          {isOverdue && (
            <span className="followup-overdue">
              <AlertCircle size={11} />
              Overdue follow-up
            </span>
          )}
          {isToday && !isOverdue && (
            <span className="followup-upcoming">
              <Clock size={11} />
              Follow-up today
            </span>
          )}
          {nextFollowup && !isOverdue && !isToday && (
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Follow-up {nextFollowup.fromNow()}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
