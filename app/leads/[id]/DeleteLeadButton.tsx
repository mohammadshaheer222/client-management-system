'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';

export default function DeleteLeadButton({ leadId }: { leadId: string }) {
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/leads/${leadId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        router.push('/leads');
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDeleting(false);
    }
  };

  if (!confirm) {
    return (
      <button
        className="btn btn-danger btn-full"
        onClick={() => setConfirm(true)}
        id="delete-lead-btn"
      >
        <Trash2 size={15} />
        Delete Lead
      </button>
    );
  }

  return (
    <div>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
        Are you sure? This action cannot be undone.
      </p>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          className="btn btn-ghost"
          style={{ flex: 1 }}
          onClick={() => setConfirm(false)}
          disabled={deleting}
        >
          Cancel
        </button>
        <button
          className="btn btn-danger"
          style={{ flex: 1 }}
          onClick={handleDelete}
          disabled={deleting}
          id="confirm-delete-btn"
        >
          {deleting ? 'Deleting...' : 'Yes, Delete'}
        </button>
      </div>
    </div>
  );
}
