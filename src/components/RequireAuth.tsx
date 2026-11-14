import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useSession } from './AuthProvider';

export default function RequireAuth({ children }: { children: ReactNode }) {
  const { session, loading } = useSession();
  if (loading) return <p className="center">Loading…</p>;
  if (!session) return <Navigate to="/login" replace />;
  return <>{children}</>;
}