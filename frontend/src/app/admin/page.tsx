'use client';

import { useEffect, useState } from 'react';
import AuthGuard from '../../components/AuthGuard';
import { apiRequest } from '../../lib/api';
import { readAuth } from '../../lib/auth';
import type { User, UserRole } from '../../lib/types';

const emptyDraft = {
  name: '',
  email: '',
  password: '',
  role: 'user' as UserRole,
  isActive: true
};

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [draft, setDraft] = useState({ ...emptyDraft });

  const auth = readAuth();

  const loadUsers = async () => {
    if (!auth?.token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest<{ data: User[] }>('/api/admin/users', {}, auth.token);
      setUsers(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditingUser(null);
    setDraft({ ...emptyDraft });
    setShowModal(true);
  };

  const openEdit = (user: User) => {
    setEditingUser(user);
    setDraft({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      isActive: user.isActive
    });
    setShowModal(true);
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!auth?.token) return;

    const payload = {
      name: draft.name,
      email: draft.email,
      role: draft.role,
      isActive: draft.isActive,
      ...(draft.password ? { password: draft.password } : {})
    };

    try {
      if (editingUser) {
        await apiRequest(`/api/admin/users/${editingUser.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload)
        }, auth.token);
      } else {
        await apiRequest('/api/admin/users', {
          method: 'POST',
          body: JSON.stringify({ ...payload, password: draft.password })
        }, auth.token);
      }
      setShowModal(false);
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save user.');
    }
  };

  const handleDeactivate = async (userId: number) => {
    if (!auth?.token) return;
    try {
      await apiRequest(`/api/admin/users/${userId}`, { method: 'DELETE' }, auth.token);
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to deactivate user.');
    }
  };

  return (
    <AuthGuard requireAdmin>
      <main className="page">
        <div className="container">
          <section className="hero">
            <div>
              <h1 className="hero-title reveal delay-1">Admin Control Room</h1>
              <p className="hero-text reveal delay-2">
                Manage user accounts, roles, and activation status. Task boards remain
                private to each user.
              </p>
              <div
                className="reveal delay-3"
                style={{ marginTop: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}
              >
                <button className="btn primary" onClick={openCreate}>
                  Add user
                </button>
                <button className="btn ghost" onClick={loadUsers}>
                  Refresh
                </button>
              </div>
            </div>
            <div className="panel reveal delay-2">
              <h3 className="section-title">Admin focus</h3>
              <p className="helper">
                Keep roles accurate, deactivate unused accounts, and keep the system tidy.
              </p>
              <div className="stat-grid">
                <div className="stat-card">
                  <strong>{users.length}</strong>
                  <p className="helper">Total users</p>
                </div>
                <div className="stat-card">
                  <strong>{users.filter((user) => user.role === 'admin').length}</strong>
                  <p className="helper">Admins</p>
                </div>
              </div>
            </div>
          </section>

          {error ? <div className="alert">{error}</div> : null}

          <div className="panel reveal delay-2">
            {loading ? (
              <>
                <div className="skeleton hero"></div>
                <div className="skeleton card"></div>
              </>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.role}</td>
                      <td>
                        <span className={`tag ${user.isActive ? 'active' : 'inactive'}`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                          <button className="btn ghost" onClick={() => openEdit(user)}>
                            Edit
                          </button>
                          <button className="btn secondary" onClick={() => handleDeactivate(user.id)}>
                            Deactivate
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {showModal ? (
          <div className="modal-backdrop" onClick={() => setShowModal(false)}>
            <div className="modal-panel" onClick={(event) => event.stopPropagation()}>
              <h3 className="modal-title">{editingUser ? 'Edit user' : 'New user'}</h3>
              <form className="form" onSubmit={handleSave}>
                <label className="form-row">
                  <span>Name</span>
                  <input
                    className="input"
                    value={draft.name}
                    onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                    required
                  />
                </label>
                <label className="form-row">
                  <span>Email</span>
                  <input
                    className="input"
                    type="email"
                    value={draft.email}
                    onChange={(event) => setDraft({ ...draft, email: event.target.value })}
                    required
                  />
                </label>
                <label className="form-row">
                  <span>Password {editingUser ? '(optional)' : ''}</span>
                  <input
                    className="input"
                    type="password"
                    value={draft.password}
                    onChange={(event) => setDraft({ ...draft, password: event.target.value })}
                    placeholder={editingUser ? 'Leave blank to keep current' : 'Min 8 characters'}
                    required={!editingUser}
                  />
                </label>
                <label className="form-row">
                  <span>Role</span>
                  <select
                    className="select"
                    value={draft.role}
                    onChange={(event) => setDraft({ ...draft, role: event.target.value as UserRole })}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </label>
                <label className="form-row">
                  <span>Active</span>
                  <select
                    className="select"
                    value={draft.isActive ? 'true' : 'false'}
                    onChange={(event) => setDraft({ ...draft, isActive: event.target.value === 'true' })}
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </label>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button className="btn ghost" type="button" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button className="btn primary" type="submit">
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}
      </main>
    </AuthGuard>
  );
}
