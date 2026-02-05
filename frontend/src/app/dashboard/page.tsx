'use client';

import { useEffect, useMemo, useState } from 'react';
import AuthGuard from '../../components/AuthGuard';
import { apiRequest } from '../../lib/api';
import { readAuth } from '../../lib/auth';
import type { Task, TaskPriority, TaskStatus } from '../../lib/types';

const statusOptions: Array<TaskStatus | 'all'> = ['all', 'todo', 'done', 'hold', 'canceled'];
const priorityOptions: Array<TaskPriority | 'all'> = ['all', 'low', 'medium', 'high'];

const emptyDraft = {
  title: '',
  description: '',
  status: 'todo' as TaskStatus,
  priority: 'medium' as TaskPriority,
  dueDate: ''
};

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [draft, setDraft] = useState({ ...emptyDraft });

  const auth = readAuth();

  const loadTasks = async () => {
    if (!auth?.token) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (priorityFilter !== 'all') params.set('priority', priorityFilter);
      if (search.trim()) params.set('q', search.trim());
      const query = params.toString() ? `?${params.toString()}` : '';
      const data = await apiRequest<{ data: Task[] }>(`/api/tasks${query}`, {}, auth.token);
      setTasks(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, priorityFilter, search]);

  const stats = useMemo(() => {
    return tasks.reduce(
      (acc, task) => {
        acc.total += 1;
        acc[task.status] += 1;
        return acc;
      },
      { total: 0, todo: 0, done: 0, hold: 0, canceled: 0 }
    );
  }, [tasks]);

  const openNewTask = () => {
    setEditingTask(null);
    setDraft({ ...emptyDraft });
    setShowModal(true);
  };

  const openEditTask = (task: Task) => {
    setEditingTask(task);
    setDraft({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate || ''
    });
    setShowModal(true);
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!auth?.token) return;

    const payload = {
      title: draft.title,
      description: draft.description || null,
      status: draft.status,
      priority: draft.priority,
      dueDate: draft.dueDate || null
    };

    try {
      if (editingTask) {
        await apiRequest(`/api/tasks/${editingTask.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload)
        }, auth.token);
      } else {
        await apiRequest('/api/tasks', {
          method: 'POST',
          body: JSON.stringify(payload)
        }, auth.token);
      }
      setShowModal(false);
      await loadTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save task.');
    }
  };

  const handleDelete = async (taskId: number) => {
    if (!auth?.token) return;
    try {
      await apiRequest(`/api/tasks/${taskId}`, { method: 'DELETE' }, auth.token);
      await loadTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task.');
    }
  };

  return (
    <AuthGuard>
      <main className="page">
        <div className="container">
          <section className="hero">
            <div>
              <h1 className="hero-title reveal delay-1">My Task Dashboard</h1>
              <p className="hero-text reveal delay-2">
                Track what matters, shift priorities, and keep momentum with
                clear status lanes.
              </p>
              <div className="stat-grid reveal delay-2">
                <div className="stat-card">
                  <strong>{stats.total}</strong>
                  <p className="helper">Total tasks</p>
                </div>
                <div className="stat-card">
                  <strong>{stats.todo}</strong>
                  <p className="helper">To do</p>
                </div>
                <div className="stat-card">
                  <strong>{stats.done}</strong>
                  <p className="helper">Done</p>
                </div>
              </div>
            </div>
            <div className="panel reveal delay-2">
              <h3 className="section-title">Quick actions</h3>
              <p className="helper">
                Use filters to narrow your focus or add a new task instantly.
              </p>
              <div style={{ marginTop: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button className="btn primary" onClick={openNewTask}>
                  New task
                </button>
                <button className="btn ghost" onClick={loadTasks}>
                  Refresh
                </button>
              </div>
            </div>
          </section>

          <div className="filters reveal delay-3">
            <input
              className="input"
              placeholder="Search tasks"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <select
              className="select"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as TaskStatus | 'all')}
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All status' : status}
                </option>
              ))}
            </select>
            <select
              className="select"
              value={priorityFilter}
              onChange={(event) => setPriorityFilter(event.target.value as TaskPriority | 'all')}
            >
              {priorityOptions.map((priority) => (
                <option key={priority} value={priority}>
                  {priority === 'all' ? 'All priority' : priority}
                </option>
              ))}
            </select>
          </div>

          {error ? <div className="alert">{error}</div> : null}

          {loading ? (
            <div className="panel" style={{ marginTop: '20px' }}>
              <div className="skeleton hero"></div>
              <div className="skeleton card"></div>
              <div className="skeleton card"></div>
            </div>
          ) : (
            <div className="tasks-grid">
              {tasks.length === 0 ? (
                <div className="panel">
                  <h3 className="section-title">No tasks yet</h3>
                  <p className="helper">Create your first task to get started.</p>
                  <button className="btn primary" onClick={openNewTask}>
                    Add task
                  </button>
                </div>
              ) : (
                tasks.map((task) => (
                  <div key={task.id} className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                      <h4>{task.title}</h4>
                      <span className={`badge ${task.status}`}>{task.status}</span>
                    </div>
                    <p className="helper">{task.description || 'No description'}</p>
                    <div style={{ marginTop: '10px' }}>
                      <span className={`badge priority ${task.priority}`}>
                        {task.priority} priority
                      </span>
                      {task.dueDate ? <span className="badge">Due {task.dueDate}</span> : null}
                    </div>
                    <div style={{ marginTop: '14px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <button className="btn ghost" onClick={() => openEditTask(task)}>
                        Edit
                      </button>
                      <button className="btn secondary" onClick={() => handleDelete(task.id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {showModal ? (
          <div className="modal-backdrop" onClick={() => setShowModal(false)}>
            <div className="modal-panel" onClick={(event) => event.stopPropagation()}>
              <h3 className="modal-title">{editingTask ? 'Edit task' : 'New task'}</h3>
              <form className="form" onSubmit={handleSave}>
                <label className="form-row">
                  <span>Title</span>
                  <input
                    className="input"
                    value={draft.title}
                    onChange={(event) => setDraft({ ...draft, title: event.target.value })}
                    required
                  />
                </label>
                <label className="form-row">
                  <span>Description</span>
                  <textarea
                    className="textarea"
                    value={draft.description}
                    onChange={(event) => setDraft({ ...draft, description: event.target.value })}
                  />
                </label>
                <label className="form-row">
                  <span>Status</span>
                  <select
                    className="select"
                    value={draft.status}
                    onChange={(event) => setDraft({ ...draft, status: event.target.value as TaskStatus })}
                  >
                    {statusOptions
                      .filter((status) => status !== 'all')
                      .map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                  </select>
                </label>
                <label className="form-row">
                  <span>Priority</span>
                  <select
                    className="select"
                    value={draft.priority}
                    onChange={(event) => setDraft({ ...draft, priority: event.target.value as TaskPriority })}
                  >
                    {priorityOptions
                      .filter((priority) => priority !== 'all')
                      .map((priority) => (
                        <option key={priority} value={priority}>
                          {priority}
                        </option>
                      ))}
                  </select>
                </label>
                <label className="form-row">
                  <span>Due date</span>
                  <input
                    className="input"
                    type="date"
                    value={draft.dueDate}
                    onChange={(event) => setDraft({ ...draft, dueDate: event.target.value })}
                  />
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
