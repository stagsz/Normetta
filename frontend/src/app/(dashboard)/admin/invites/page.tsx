'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { orgInviteApi } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { useAuthStore } from '@/lib/store';
import { Loader2, UserCheck, UserX, Inbox } from 'lucide-react';

interface OrgRole {
  id: string;
  name: string;
}

interface Invite {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export default function AdminInvitesPage() {
  const { user } = useAuthStore();
  const [invites, setInvites] = useState<Invite[]>([]);
  const [orgRoles, setOrgRoles] = useState<OrgRole[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    orgInviteApi.listInvites()
      .then((res) => {
        const data = res.data?.data;
        setInvites(data?.invites ?? []);
        setOrgRoles(data?.orgRoles ?? []);
      })
      .catch(() => {
        toast.error('Failed to load invites');
      })
      .finally(() => setLoading(false));
  }, [user]);

  const handleApprove = async (id: string) => {
    const orgRoleId = selectedRoles[id];
    if (!orgRoleId) {
      toast.error('Please select a role before approving');
      return;
    }
    setActioning(id);
    try {
      await orgInviteApi.resolve(id, 'approve', orgRoleId);
      setInvites((prev) => prev.filter((inv) => inv.id !== id));
      toast.success('Invite approved');
    } catch {
      toast.error('Failed to approve invite');
    } finally {
      setActioning(null);
    }
  };

  const handleReject = async (id: string) => {
    setActioning(id);
    try {
      await orgInviteApi.resolve(id, 'reject');
      setInvites((prev) => prev.filter((inv) => inv.id !== id));
      toast.success('Invite rejected');
    } catch {
      toast.error('Failed to reject invite');
    } finally {
      setActioning(null);
    }
  };

  const roleOptions = orgRoles.map((r) => ({ value: r.id, label: r.name }));
  const pendingInvites = invites.filter((inv) => inv.status === 'pending');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-strong)]">Pending Join Requests</h1>
        <p className="text-[var(--text-muted)]">Approve or reject requests to join your organisation</p>
      </div>

      {loading ? (
        <Card>
          <CardContent className="py-12 flex items-center justify-center">
            <Loader2 className="animate-spin text-[var(--text-subtle)]" size={32} />
          </CardContent>
        </Card>
      ) : pendingInvites.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Inbox className="mx-auto h-12 w-12 text-[var(--text-subtle)] mb-4" />
            <p className="text-[var(--text-muted)]">No pending join requests</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <ul className="divide-y divide-[var(--border-subtle)]">
              {pendingInvites.map((invite) => (
                <li key={invite.id} className="flex flex-col sm:flex-row sm:items-center gap-3 px-6 py-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[var(--text-strong)]">
                      {invite.firstName} {invite.lastName}
                    </p>
                    <p className="text-sm text-[var(--text-muted)]">{invite.email}</p>
                    <p className="text-xs text-[var(--text-subtle)] mt-0.5">
                      Requested {format(new Date(invite.createdAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {roleOptions.length > 0 && (
                      <Select
                        options={roleOptions}
                        placeholder="Select role"
                        value={selectedRoles[invite.id] ?? ''}
                        onChange={(e) =>
                          setSelectedRoles((prev) => ({ ...prev, [invite.id]: e.target.value }))
                        }
                        className="w-40"
                      />
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-[var(--brand-strong)] border-[var(--border-subtle)] hover:bg-[var(--brand-soft)]"
                      onClick={() => handleApprove(invite.id)}
                      disabled={actioning === invite.id}
                      loading={actioning === invite.id}
                    >
                      <UserCheck size={14} className="mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-[var(--status-fail-fg)] border-[var(--status-fail-line)] hover:bg-[var(--status-fail-bg)]"
                      onClick={() => handleReject(invite.id)}
                      disabled={actioning === invite.id}
                      loading={actioning === invite.id}
                    >
                      <UserX size={14} className="mr-1" />
                      Reject
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
