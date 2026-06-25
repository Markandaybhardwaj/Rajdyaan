'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/useAuthStore';

/**
 * ProtectedRoute — Wrap any page/component with this to restrict access
 * to logged-in users only. Unauthenticated users are redirected to /login.
 *
 * Usage:
 *   export default function ProfilePage() {
 *     return (
 *       <ProtectedRoute>
 *         <YourPageContent />
 *       </ProtectedRoute>
 *     );
 *   }
 */
export default function ProtectedRoute({ children, redirectTo = '/login' }) {
  const router = useRouter();
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();

  // Make sure auth state is checked on mount (in case it hasn't been yet)
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // While we're checking auth, show a subtle loading screen
  if (isLoading) {
    return (
      <div style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        background: '#FAF6EE',
      }}>
        <div style={{
          width: 44,
          height: 44,
          border: '3px solid #D4B896',
          borderTopColor: '#3B1F0A',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        <p style={{ fontFamily: 'DM Sans, sans-serif', color: '#8C7B6B', fontSize: 14 }}>
          Checking your session…
        </p>
      </div>
    );
  }

  // Not logged in → redirect to login
  if (!isAuthenticated) {
    router.replace(redirectTo);
    return null; // render nothing while redirecting
  }

  // Logged in → show the actual page
  return children;
}
