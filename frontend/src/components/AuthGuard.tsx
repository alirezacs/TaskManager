'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { readAuth } from '../lib/auth';

type AuthGuardProps = {
  children: React.ReactNode;
  requireAdmin?: boolean;
};

export default function AuthGuard({ children, requireAdmin }: AuthGuardProps) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const auth = readAuth();
    if (!auth) {
      router.replace('/login');
      return;
    }
    if (requireAdmin && auth.user.role !== 'admin') {
      router.replace('/dashboard');
      return;
    }
    setReady(true);
  }, [requireAdmin, router]);

  if (!ready) {
    return (
      <div className="page">
        <div className="container">
          <div className="skeleton hero"></div>
          <div className="skeleton card"></div>
          <div className="skeleton card"></div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
