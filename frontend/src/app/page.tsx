import Link from 'next/link';

export default function Home() {
  return (
    <main className="page">
      <div className="container">
        <section className="hero">
          <div>
            <span className="badge">Built for focus</span>
            <h1 className="hero-title reveal delay-1">Your tasks, mapped with clarity.</h1>
            <p className="hero-text reveal delay-2">
              Task Atlas gives every user a clean personal dashboard while
              admins get a focused control room to manage accounts. Prioritize
              work, track progress, and stay aligned without noise.
            </p>
            <div
              className="reveal delay-3"
              style={{ marginTop: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}
            >
              <Link className="btn primary" href="/register">
                Get started
              </Link>
              <Link className="btn ghost" href="/login">
                I already have an account
              </Link>
            </div>
            <div className="stat-grid reveal delay-3">
              <div className="stat-card">
                <strong>4</strong>
                <p className="helper">Task status lanes</p>
              </div>
              <div className="stat-card">
                <strong>3</strong>
                <p className="helper">Priority levels</p>
              </div>
              <div className="stat-card">
                <strong>2</strong>
                <p className="helper">Separate dashboards</p>
              </div>
            </div>
          </div>
          <div className="hero-card reveal delay-2">
            <h3>Focus-mode workflow</h3>
            <p className="helper">
              Capture tasks fast, filter by priority, and view just what matters.
              Admins see user activity without stepping into individual workspaces.
            </p>
            <div style={{ marginTop: '18px', display: 'grid', gap: '12px' }}>
              <div className="card">
                <h4>Quick capture</h4>
                <p className="helper">Add tasks with priority and due dates.</p>
              </div>
              <div className="card">
                <h4>Clear ownership</h4>
                <p className="helper">Every task is tied to a user account.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
