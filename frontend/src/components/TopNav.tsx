'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { clearAuth, readAuth } from '../lib/auth';
import type { User } from '../lib/types';

export default function TopNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const auth = readAuth();
    setUser(auth?.user || null);
  }, [pathname]);

  const navLinks = [
    { href: '/dashboard', label: 'My Tasks' },
    ...(user?.role === 'admin' ? [{ href: '/admin', label: 'Admin' }] : [])
  ];

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  return (
    <header className="topnav">
      <div className="container nav-inner">
        <Link className="brand" href="/">
          <span className="brand-mark" />
          <span>Task Atlas</span>
        </Link>

        <nav className="nav-links">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={pathname === link.href ? 'active' : ''}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="nav-actions">
          {user ? (
            <>
              <div className="user-chip">
                <span className="user-name">{user.name}</span>
                <span className={`user-role ${user.role}`}>{user.role}</span>
              </div>
              <button className="btn ghost" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link className="btn ghost" href="/login">
                Log in
              </Link>
              <Link className="btn primary" href="/register">
                Create account
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
