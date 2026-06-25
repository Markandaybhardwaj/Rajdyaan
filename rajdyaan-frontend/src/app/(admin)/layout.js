'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/useAuthStore';
import Link from 'next/link';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (mounted && !isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (user?.role !== 'admin') {
        router.push('/');
      }
    }
  }, [mounted, isLoading, isAuthenticated, user, router]);

  if (!mounted || isLoading || !isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary">
        <div className="animate-pulse text-primary font-heading text-2xl">Verifying Admin Access...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-primary text-secondary p-6 flex flex-col gap-8 shadow-xl">
        <div className="flex flex-col gap-1">
          <h2 className="font-heading text-2xl font-bold text-accent">RajDyaan</h2>
          <p className="text-xs opacity-60 uppercase tracking-widest font-bold">Admin Panel</p>
        </div>

        <nav className="flex flex-col gap-2">
          <AdminNavLink href="/admin/dashboard" icon="📊" label="Dashboard" />
          <AdminNavLink href="/admin/products" icon="📦" label="Products" />
          <AdminNavLink href="/admin/categories" icon="📁" label="Categories" />
          <AdminNavLink href="/admin/banners" icon="🖼️" label="Banners" />
          <AdminNavLink href="/admin/orders" icon="🛍️" label="Orders" />
          <AdminNavLink href="/admin/leads" icon="📋" label="Leads" />
        </nav>

        <div className="mt-auto pt-6 border-t border-secondary/10">
          <Link href="/" className="flex items-center gap-3 text-sm hover:text-accent transition-colors">
            <span>🏠</span> Back to Site
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

function AdminNavLink({ href, icon, label }) {
  return (
    <Link 
      href={href} 
      className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-secondary/10 transition-all group"
    >
      <span className="text-xl group-hover:scale-110 transition-transform">{icon}</span>
      <span className="font-medium">{label}</span>
    </Link>
  );
}
