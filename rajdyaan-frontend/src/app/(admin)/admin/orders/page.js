'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import styles from './orders.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

const STATUS_FILTERS = [
  { key: 'all',        label: 'All Orders',  icon: '📦' },
  { key: 'pending',    label: 'Pending',      icon: '⏳' },
  { key: 'confirmed',  label: 'Confirmed',    icon: '✓' },
  { key: 'processing', label: 'Processing',   icon: '⚙️' },
  { key: 'shipped',    label: 'Shipped',      icon: '🚚' },
  { key: 'delivered',  label: 'Delivered',     icon: '✅' },
  { key: 'cancelled',  label: 'Cancelled',    icon: '✕' },
];

const ORDER_STATUS_OPTIONS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

const BADGE_MAP = {
  // Order status
  pending:    styles.badgePending,
  confirmed:  styles.badgeConfirmed,
  processing: styles.badgeProcessing,
  shipped:    styles.badgeShipped,
  delivered:  styles.badgeDelivered,
  cancelled:  styles.badgeCancelled,
  // Payment status
  paid:       styles.badgePaid,
  failed:     styles.badgeFailed,
  refunded:   styles.badgeRefunded,
};

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [statusCounts, setStatusCounts] = useState({});
  const [updatingId, setUpdatingId] = useState(null);

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (searchTerm.trim()) params.set('search', searchTerm.trim());

      const res = await fetch(`${API_URL}/order/admin/all?${params}`, {
        credentials: 'include',
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `Error ${res.status}`);
      }

      const data = await res.json();
      const d = data.data || {};
      setOrders(d.orders || []);
      setTotalPages(d.totalPages || 1);
      setTotalCount(d.totalCount || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, searchTerm]);

  // Fetch status counts for stat cards
  const fetchCounts = useCallback(async () => {
    try {
      const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
      const counts = {};

      // Fetch total
      const totalRes = await fetch(`${API_URL}/order/admin/all?limit=1`, {
        credentials: 'include',
      });
      if (totalRes.ok) {
        const totalData = await totalRes.json();
        counts.all = totalData.data?.totalCount || 0;
      }

      // Fetch per-status counts in parallel
      const results = await Promise.all(
        statuses.map(async (s) => {
          const res = await fetch(`${API_URL}/order/admin/all?status=${s}&limit=1`, {
            credentials: 'include',
          });
          if (res.ok) {
            const data = await res.json();
            return { status: s, count: data.data?.totalCount || 0 };
          }
          return { status: s, count: 0 };
        })
      );
      results.forEach((r) => { counts[r.status] = r.count; });
      setStatusCounts(counts);
    } catch {
      // Silently fail — counts are nice-to-have
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Update order status inline
  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`${API_URL}/order/admin/${orderId}/status`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Update failed');
      }
      // Refresh data
      await fetchOrders();
      await fetchCounts();
    } catch (err) {
      alert(`Failed to update: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>🛍️ Order Management</h1>
          <p className={styles.subtitle}>View and manage all customer orders</p>
        </div>
        <button
          className={styles.refreshBtn}
          onClick={() => { fetchOrders(); fetchCounts(); }}
          disabled={loading}
        >
          {loading ? '⏳ Loading...' : '🔄 Refresh'}
        </button>
      </div>

      {/* Stat Cards — clickable filters */}
      <div className={styles.statsRow}>
        {STATUS_FILTERS.map((f) => (
          <div
            key={f.key}
            className={`${styles.statCard} ${statusFilter === f.key ? styles.statCardActive : ''}`}
            onClick={() => { setStatusFilter(f.key); setPage(1); }}
          >
            <span className={styles.statNum}>
              {statusCounts[f.key] !== undefined ? statusCounts[f.key] : '—'}
            </span>
            <span className={styles.statLabel}>{f.icon} {f.label}</span>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className={styles.controlsRow}>
        <input
          type="text"
          placeholder="Search by name or phone..."
          className={styles.searchInput}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <span style={{ fontSize: '0.82rem', color: '#8a7460' }}>
          {totalCount} order{totalCount !== 1 ? 's' : ''} found
        </span>
      </div>

      {/* Error */}
      {error && <div className={styles.errorBox}>⚠️ {error}</div>}

      {/* Table */}
      <div className={styles.tableWrap}>
        {orders.length === 0 && !loading ? (
          <div className={styles.emptyState}>
            {statusFilter !== 'all'
              ? `No ${statusFilter} orders found`
              : 'No orders yet'}
          </div>
        ) : (
          <>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, i) => (
                  <tr key={order._id}>
                    <td style={{ color: '#b8a494', fontSize: '0.78rem', fontWeight: 600, textAlign: 'center' }}>
                      {(page - 1) * 20 + i + 1}
                    </td>
                    <td className={styles.tdOrderId}>
                      #{order._id.slice(-8).toUpperCase()}
                    </td>
                    <td>
                      <div className={styles.tdCustomer}>
                        {order.shippingAddress?.fullName || order.user?.name || '—'}
                      </div>
                      <div className={styles.tdCustomerEmail}>
                        {order.user?.email || order.shippingAddress?.phone || ''}
                      </div>
                    </td>
                    <td className={styles.tdItems}>
                      {order.items?.length || 0}
                    </td>
                    <td className={styles.tdAmount}>
                      ₹{order.total?.toLocaleString('en-IN') || '0'}
                    </td>
                    <td>
                      <span className={`${styles.badge} ${BADGE_MAP[order.paymentStatus] || styles.badgePending}`}>
                        {order.paymentStatus || 'pending'}
                      </span>
                    </td>
                    <td>
                      <select
                        className={styles.statusSelect}
                        value={order.orderStatus}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        disabled={updatingId === order._id}
                        style={{
                          opacity: updatingId === order._id ? 0.5 : 1,
                        }}
                      >
                        {ORDER_STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className={styles.tdDate}>
                      {formatDate(order.createdAt)}
                      <br />
                      <span style={{ fontSize: '0.7rem', color: '#b8a494' }}>
                        {formatTime(order.createdAt)}
                      </span>
                    </td>
                    <td>
                      <button
                        className={styles.viewBtn}
                        onClick={() => router.push(`/admin/orders/${order._id}`)}
                      >
                        View →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  className={styles.pageBtn}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  ← Prev
                </button>

                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      className={`${styles.pageBtn} ${page === pageNum ? styles.pageBtnActive : ''}`}
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <span className={styles.pageInfo}>
                  of {totalPages}
                </span>

                <button
                  className={styles.pageBtn}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
