'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '../../lib/api';
import { writeAuth } from '../../lib/auth';
import type { AuthResponse } from '../../lib/types';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await apiRequest<AuthResponse>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password })
      });
      writeAuth(data);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page">
      <div className="container">
        <section className="hero">
          <div>
            <h1 className="hero-title reveal delay-1">Create your workspace.</h1>
            <p className="hero-text reveal delay-2">
              Register to unlock your personal task board. Admin access is
              granted later by your system administrator.
            </p>
          </div>
          <div className="panel reveal delay-2">
            <h3 className="section-title">Create account</h3>
            <form className="form" onSubmit={handleSubmit}>
              <label className="form-row">
                <span>Name</span>
                <input
                  className="input"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Your name"
                  required
                />
              </label>
              <label className="form-row">
                <span>Email</span>
                <input
                  className="input"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@company.com"
                  required
                />
              </label>
              <label className="form-row">
                <span>Password</span>
                <input
                  className="input"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Min 8 characters"
                  required
                />
              </label>
              {error ? <div className="alert">{error}</div> : null}
              <button className="btn primary" type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create account'}
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
