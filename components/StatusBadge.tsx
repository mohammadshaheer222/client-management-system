import { LeadStatus } from '@/models/Lead';

const statusClassMap: Record<LeadStatus, string> = {
  'New Lead': 'status-new-lead',
  'Contacted': 'status-contacted',
  'Quotation Sent': 'status-quotation-sent',
  'Follow-up': 'status-follow-up',
  'Confirmed': 'status-confirmed',
  'Completed': 'status-completed',
  'Lost': 'status-lost',
};

interface StatusBadgeProps {
  status: LeadStatus;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const cls = statusClassMap[status] || 'status-new-lead';
  return (
    <span className={`status-badge ${cls}`} style={size === 'sm' ? { fontSize: '10px', padding: '3px 8px' } : {}}>
      <span className="status-dot" />
      {status}
    </span>
  );
}
