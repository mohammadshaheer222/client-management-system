'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Users, SlidersHorizontal, Plus, User } from 'lucide-react';
import Link from 'next/link';
import LeadCard from '@/components/LeadCard';
import { LeadStatus } from '@/models/Lead';
import ThemeToggle from '@/components/ThemeToggle';

const STATUS_FILTERS: (LeadStatus | 'All')[] = [
  'All', 'New Lead', 'Contacted', 'Quotation Sent', 'Follow-up', 'Confirmed', 'Completed', 'Lost'
];

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

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeStatus, setActiveStatus] = useState<LeadStatus | 'All'>('All');
  const [activeCreator, setActiveCreator] = useState<string>('All');
  const [memberNames, setMemberNames] = useState<string[]>([]);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  // Fetch member names for creator filter
  useEffect(() => {
    fetch('/api/members')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setMemberNames(d.data.map((m: { name: string }) => m.name));
      })
      .catch(() => {});
  }, []);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (activeStatus !== 'All') params.set('status', activeStatus);
      if (activeCreator !== 'All') params.set('creator', activeCreator);

      const res = await fetch(`/api/leads?${params.toString()}`);
      const data = await res.json();
      if (data.success) setLeads(data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, activeStatus, activeCreator]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchLeads();
  }, [fetchLeads]);

  return (
    <div>
      {/* ── Header ── */}
      <div
        style={{
          padding: '20px 16px 0',
          background: 'linear-gradient(160deg, rgba(79,142,247,0.08) 0%, transparent 80%)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <h1
              style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px', marginBottom: 2 }}
            >
              All Leads
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              {leads.length} lead{leads.length !== 1 ? 's' : ''} found
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ThemeToggle />
            <Link href="/leads/new">
              <button className="btn btn-primary btn-sm">
                <Plus size={14} />
                Add
              </button>
            </Link>
          </div>
        </div>

        {/* ── Search ── */}
        <div className="search-bar-wrapper">
          <Search size={15} className="search-bar-icon" />
          <input
            type="text"
            className="search-bar-input"
            placeholder="Search by name, phone, ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="lead-search"
          />
        </div>

        {/* ── Filter Pills – Status ── */}
        <div className="filter-pills" style={{ paddingBottom: 8 }}>
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              className={`filter-pill ${activeStatus === s ? 'active' : ''}`}
              onClick={() => setActiveStatus(s)}
              id={`filter-${s.replace(/\s/g, '-').toLowerCase()}`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* ── Filter Pills – Creator ── */}
        <div className="filter-pills" style={{ paddingBottom: 16 }}>
          {(['All', 'Not Assigned', ...memberNames] as string[]).map((c) => (
            <button
              key={c}
              className={`filter-pill ${activeCreator === c ? 'active' : ''}`}
              onClick={() => setActiveCreator(c)}
              id={`creator-filter-${c.replace(/\s/g, '-').toLowerCase()}`}
              style={{ display: 'flex', alignItems: 'center', gap: 4 }}
            >
              {c === 'All' ? null : <User size={11} />}
              {c === 'All' ? 'All Creators' : c}
            </button>
          ))}
        </div>
      </div>

      {/* ── Lead List ── */}
      <div className="page-content" style={{ paddingTop: 12 }}>
        {loading ? (
          <div className="loader-container">
            <div className="spinner" />
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Loading leads...</span>
          </div>
        ) : leads.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Users size={28} />
            </div>
            <div className="empty-state-title">No leads found</div>
            <div className="empty-state-subtitle">
              {search || activeStatus !== 'All'
                ? 'Try adjusting your search or filters'
                : 'Add your first lead to get started'}
            </div>
            {!search && activeStatus === 'All' && (
              <Link href="/leads/new" style={{ display: 'inline-block', marginTop: 16 }}>
                <button className="btn btn-primary">
                  <Plus size={16} />
                  Add Lead
                </button>
              </Link>
            )}
          </div>
        ) : (
          <div className="fade-in">
            {leads.map((lead) => (
              <LeadCard key={lead._id} lead={lead} />
            ))}
          </div>
        )}
      </div>

      {/* ── FAB ── */}
      <Link href="/leads/new">
        <button className="fab" aria-label="Add new lead" id="fab-add-lead">
          <SlidersHorizontal size={22} />
        </button>
      </Link>
    </div>
  );
}
