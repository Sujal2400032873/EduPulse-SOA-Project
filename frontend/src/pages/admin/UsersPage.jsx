import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, UserCog, Search, Filter, Plus, Mail, Shield, 
  CheckCircle2, RefreshCw, KeyRound, AlertCircle, Calendar 
} from 'lucide-react';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../../components/common/Modal';
import { TableSkeleton, EmptyState, ErrorState } from '../../components/common/LoadingSkeleton';

export default function UsersPage() {
  const { isAdmin } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Create Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const initialForm = {
    username: '',
    email: '',
    password: '',
    role: 'ROLE_FACULTY',
  };
  const [formData, setFormData] = useState(initialForm);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    loadUsers();
  }, [roleFilter]);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (roleFilter !== 'ALL') params.role = roleFilter;
      const data = await authService.getAllUsers(params);
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load users:', err);
      setError(err.message || 'Unable to retrieve users from Auth Service.');
      toastError(err.message, 'User Directory Error');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        (u.username && u.username.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q));
      return matchesQuery;
    });
  }, [users, searchQuery]);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError(null);

    try {
      const payload = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password.trim(),
        role: formData.role,
      };

      const res = await authService.createUserByAdmin(payload);
      toastSuccess(`User ${res.username} (${res.role}) successfully provisioned!`, 'User Created');
      setCreateModalOpen(false);
      setFormData(initialForm);
      await loadUsers();
    } catch (err) {
      setFormError(err.message || 'Failed to create user. Verify password format and uniqueness.');
      toastError(err.message, 'User Creation Failed');
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="inst-card p-6 bg-surface border border-surface-border rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-ink-primary">
              Institutional User Directory &amp; Security Administration
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
              Auth-Service (Port 8081)
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-1">
            Central identity management, role-based authorization assignment, and system user provisioning
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadUsers}
            className="p-2.5 rounded-xl border border-surface-border text-ink-secondary hover:text-primary hover:bg-surface-hover transition cursor-pointer"
            title="Refresh Users"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {isAdmin && (
            <button
              type="button"
              onClick={() => {
                setFormData(initialForm);
                setFormError(null);
                setCreateModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold shadow-inst-sm transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Provision User</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 bg-surface border border-surface-border rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute inset-y-0 left-3 my-auto text-ink-muted pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search username or email..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-surface-border text-xs text-ink-primary placeholder-ink-light bg-surface-soft focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-xs text-ink-secondary">
            <Filter className="w-3.5 h-3.5 text-ink-muted" />
            <span>Role Filter:</span>
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-surface-border text-xs bg-surface-soft text-ink-primary font-medium focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
          >
            <option value="ALL">All Roles ({users.length})</option>
            <option value="ROLE_ADMIN">Administrators (ROLE_ADMIN)</option>
            <option value="ROLE_FACULTY">Faculty &amp; Professors (ROLE_FACULTY)</option>
            <option value="ROLE_STUDENT">Student Scholars (ROLE_STUDENT)</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-surface border border-surface-border rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <TableSkeleton rows={5} cols={5} />
        ) : error ? (
          <div className="p-6">
            <ErrorState message={error} onRetry={loadUsers} />
          </div>
        ) : filteredUsers.length === 0 ? (
          <EmptyState
            title="No Users Found"
            description="No system user accounts match the current filters."
            actionText={isAdmin ? 'Provision First User' : undefined}
            onAction={isAdmin ? () => setCreateModalOpen(true) : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-surface-border bg-surface-soft/80 text-[11px] font-bold text-ink-muted uppercase tracking-wider">
                  <th className="py-3.5 px-4">User ID</th>
                  <th className="py-3.5 px-4">Username</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Authorized Role</th>
                  <th className="py-3.5 px-4">Registration Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border text-xs">
                {filteredUsers.map((u) => {
                  const roleName = u.role ? u.role.replace('ROLE_', '') : 'STUDENT';
                  const roleBadgeClass =
                    roleName === 'ADMIN'
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : roleName === 'FACULTY'
                      ? 'bg-blue-100 text-blue-900 border-blue-300'
                      : 'bg-emerald-100 text-emerald-900 border-emerald-300';

                  return (
                    <tr key={u.id} className="hover:bg-surface-hover/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-ink-muted">#{u.id}</td>
                      <td className="py-3.5 px-4 font-bold text-ink-primary font-mono">{u.username}</td>
                      <td className="py-3.5 px-4 text-ink-secondary">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-ink-muted" />
                          <span>{u.email}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${roleBadgeClass}`}>
                          <Shield className="w-3 h-3" />
                          <span>{u.role}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-ink-muted text-[11px]">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PROVISION USER MODAL */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Provision Institutional User Account"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-ink-secondary mb-1">
              Username * (3 to 50 characters)
            </label>
            <input
              type="text"
              required
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="e.g. prof_ananya or STU1005"
              className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs bg-surface-soft font-mono focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-secondary mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="user@edupulse.edu"
              className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs bg-surface-soft focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-secondary mb-1">
              Initial Password * (minimum 8 characters)
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Enter secure initial password"
              className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs bg-surface-soft focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-secondary mb-1">
              Authorized Role *
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs bg-surface-soft font-bold focus:ring-2 focus:ring-primary focus:outline-none cursor-pointer"
            >
              <option value="ROLE_FACULTY">Faculty &amp; Examination (ROLE_FACULTY)</option>
              <option value="ROLE_STUDENT">Student Scholar (ROLE_STUDENT)</option>
              <option value="ROLE_ADMIN">Central Administrator (ROLE_ADMIN)</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-border">
            <button
              type="button"
              disabled={formSubmitting}
              onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-surface-border text-xs font-semibold text-ink-secondary hover:bg-surface-hover cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formSubmitting}
              className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold shadow-inst-sm transition flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {formSubmitting ? 'Provisioning...' : 'Provision Account'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
