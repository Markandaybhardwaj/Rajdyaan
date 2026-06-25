'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import useCartStore from '@/store/useCartStore';
import useWishlistStore from '@/store/useWishlistStore';
import useAuthStore from '@/store/useAuthStore';

// Helper to extract initials
const getInitials = (name) => {
  if (!name) return '';
  const parts = name.trim().split(' ');
  if (parts.length > 1) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0].substring(0, 2).toUpperCase();
};

const DEFAULT_LOGO = 'https://res.cloudinary.com/dzikgxfxr/image/upload/v1782302722/Rajdyan_Logo1_fkhmhu.png';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export default function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState(DEFAULT_LOGO);
  const profileRef = useRef(null);
  const cartTotal = useCartStore((s) => s.totalItems());
  const wishlistTotal = useWishlistStore((s) => s.totalItems());
  const wishlistToast = useWishlistStore((s) => s.toastMessage);
  const { user, isAuthenticated, isLoading, checkAuth, logout } = useAuthStore();

  useEffect(() => {
    setMounted(true);
    checkAuth();
    // Fetch dynamic logo from banner API
    fetch(`${API_URL}/banners?section=general`)
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        const banners = data?.data?.banners || data?.data || [];
        const logoBanner = banners.find((b) => b.key === 'logo' && b.isActive && b.image?.url);
        if (logoBanner) setLogoUrl(logoBanner.image.url);
      })
      .catch(() => {}); // silently fallback to default
  }, [checkAuth]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Products', href: '/products' },
    { name: 'For B2B', href: '/b2b' },
    { name: 'Contact Us', href: '/contact' },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery.trim())}`;
      setIsSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-secondary/90 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 md:px-8">

        {/* ---- Left: Logo ---- */}
        <div className="flex items-center">
          <Link href="/">
            <Image
              src={logoUrl}
              alt="Rajdhyaan Logo"
              width={140}
              height={60}
              className="object-contain"
              priority
            />
          </Link>
        </div>

        {/* ---- Center: Desktop Navigation ---- */}
        <nav className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="group relative font-body text-sm font-semibold tracking-wide text-primary"
            >
              {link.name}
              <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-accent transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        {/* ---- Right: Actions ---- */}
        <div className="flex items-center gap-4 md:gap-6">
          {/* Search Icon (Desktop) */}
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="hidden text-primary transition-colors hover:text-accent lg:block"
            aria-label="Toggle Search"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </button>

          {/* Login/Register or User Avatar (Desktop) */}
          <div className="hidden items-center gap-4 border-r border-primary/20 pr-6 lg:flex">
            {!isLoading && (
              isAuthenticated && user ? (
                <div className="relative flex items-center gap-3" ref={profileRef}>
                  {/* Avatar Button */}
                  <button
                    onClick={() => setIsProfileOpen((p) => !p)}
                    className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-accent text-sm font-bold text-primary transition-transform hover:scale-105 focus:outline-none"
                  >
                    {getInitials(user.name)}
                  </button>

                  {/* Dropdown */}
                  {isProfileOpen && (
                    <div className="absolute right-0 top-full z-50 mt-3 w-52 overflow-hidden rounded-xl bg-white shadow-2xl border border-gray-100">
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-gray-100 bg-secondary/40">
                        <p className="text-sm font-bold text-primary">{user.name}</p>
                        <p className="text-xs text-dark/60 truncate">{user.email}</p>
                      </div>

                      {/* Links */}
                      <Link href="/orders" onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-dark hover:bg-secondary hover:text-accent transition-colors">
                        📦 My Orders
                      </Link>
                      <Link href="/profile" onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-dark hover:bg-secondary hover:text-accent transition-colors border-t border-gray-100">
                        👤 My Profile
                      </Link>
                      {user.role === 'admin' && (
                        <Link href="/admin/orders" onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-2 px-4 py-3 text-sm font-bold text-accent hover:bg-secondary transition-colors border-t border-gray-100">
                          ⚙️ Admin
                        </Link>
                      )}
                      <button
                        onClick={() => { logout(); setIsProfileOpen(false); }}
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100"
                      >
                        🚪 Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link href="/login" className="font-body text-sm font-semibold text-primary transition-colors hover:text-accent">
                    Login
                  </Link>
                  <Link href="/register" className="rounded-sm bg-primary px-4 py-2 font-body text-xs font-semibold uppercase tracking-wider text-secondary transition-colors hover:bg-accent hover:text-primary">
                    Register
                  </Link>
                </>
              )
            )}
          </div>

          {/* Icons */}
          <div className="flex items-center gap-3 md:gap-5">
            {/* User Profile */}
            <Link href="/profile" aria-label="User Profile" className="text-primary transition-colors hover:text-accent hidden md:block">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            </Link>

            {/* Cart */}
            <Link href="/cart" aria-label="Shopping Cart" className="group relative flex items-center text-primary transition-colors hover:text-accent">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
              {mounted && cartTotal > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-primary">
                  {cartTotal}
                </span>
              )}
            </Link>

            {/* Wishlist */}
            <Link href="/wishlist" aria-label="Wishlist" className="group relative flex items-center text-primary transition-colors hover:text-accent">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
              {mounted && wishlistTotal > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-primary">
                  {wishlistTotal}
                </span>
              )}
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              className="text-primary lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-7 w-7">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-7 w-7">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ---- Mobile Menu Overlay ---- */}
      {isMobileMenuOpen && (
        <div className="absolute left-0 top-20 w-full border-b border-primary/10 bg-secondary px-5 py-6 shadow-xl lg:hidden">
          <nav className="flex flex-col gap-5">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="font-heading text-lg font-medium text-primary hover:text-accent"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}

            <div className="my-2 h-px w-full bg-primary/10" />

            {isAuthenticated && user ? (
              <>
                <div className="flex items-center gap-3 py-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-sm font-bold text-primary">
                    {getInitials(user.name)}
                  </div>
                  <div>
                    <p className="font-heading font-medium text-primary">{user.name}</p>
                    <p className="text-xs text-dark/70">{user.email}</p>
                  </div>
                </div>
                <Link href="/orders" className="font-heading text-lg font-medium text-primary hover:text-accent" onClick={() => setIsMobileMenuOpen(false)}>
                  📦 My Orders
                </Link>
                <Link href="/profile" className="font-heading text-lg font-medium text-primary hover:text-accent" onClick={() => setIsMobileMenuOpen(false)}>
                  👤 My Profile
                </Link>
                {user.role === 'admin' && (
                  <Link href="/admin/orders" className="font-heading text-lg font-bold text-accent hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>
                    ⚙️ Admin
                  </Link>
                )}
                <button
                  onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                  className="text-left font-heading text-lg font-medium text-red-600 hover:text-red-700"
                >
                  🚪 Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="font-heading text-lg font-medium text-primary hover:text-accent" onClick={() => setIsMobileMenuOpen(false)}>
                  Login
                </Link>
                <Link href="/register" className="font-heading text-lg font-medium text-primary hover:text-accent" onClick={() => setIsMobileMenuOpen(false)}>
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      )}

      {/* Global Wishlist Toast */}
      {wishlistToast && (
        <div className="fixed bottom-8 right-8 z-50 flex items-center gap-3 rounded-lg border-l-4 border-accent bg-primary px-6 py-4 text-sm text-secondary shadow-2xl animate-in slide-in-from-bottom-5">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span className="font-medium">{wishlistToast}</span>
        </div>
      )}

      {/* ---- Search Overlay ---- */}
      {isSearchOpen && (
        <div className="absolute left-0 top-0 z-[60] flex h-20 w-full items-center bg-secondary px-5 md:px-8 animate-in fade-in slide-in-from-top-4 duration-200">
          <form onSubmit={handleSearch} className="mx-auto flex w-full max-w-7xl items-center gap-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 text-primary">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input
              autoFocus
              type="text"
              placeholder="Search for products (e.g. Gur, Ghee, Khand)..."
              className="w-full bg-transparent font-body text-lg font-medium text-primary outline-none placeholder:text-primary/40"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setIsSearchOpen(false)}
              className="text-primary hover:text-accent"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </header>
  );
}
