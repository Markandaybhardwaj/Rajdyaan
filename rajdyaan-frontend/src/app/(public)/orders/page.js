'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/useAuthStore';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

const STATUS_STYLES = {
  pending:    { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', label: 'Pending',    icon: '⏳' },
  confirmed:  { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',   label: 'Confirmed',  icon: '✓' },
  processing: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', label: 'Processing', icon: '⚙️' },
  shipped:    { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', label: 'Shipped',    icon: '🚚' },
  delivered:  { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200',  label: 'Delivered',  icon: '✅' },
  cancelled:  { bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200',    label: 'Cancelled',  icon: '✕' },
};

const PAYMENT_STYLES = {
  pending:  { bg: 'bg-orange-50', text: 'text-orange-700', label: '⏳ Payment Pending' },
  paid:     { bg: 'bg-green-50',  text: 'text-green-700',  label: '✅ Paid' },
  failed:   { bg: 'bg-red-50',    text: 'text-red-700',    label: '❌ Failed' },
  refunded: { bg: 'bg-gray-50',   text: 'text-gray-700',   label: '↩️ Refunded' },
};

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/order/my-orders`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) {
        setOrders(data.data?.orders || []);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (orderId) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;

    setCancellingId(orderId);
    try {
      const res = await fetch(`${API_URL}/order/${orderId}/cancel`, {
        method: 'PATCH',
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) {
        // Update order in local state
        setOrders((prev) =>
          prev.map((o) =>
            o._id === orderId ? { ...o, orderStatus: 'cancelled' } : o
          )
        );
      } else {
        alert(data.message || 'Failed to cancel order');
      }
    } catch (err) {
      console.error('Cancel failed:', err);
      alert('Something went wrong');
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-accent/30 border-t-accent rounded-full animate-spin" />
          <p className="animate-pulse text-primary font-heading text-xl">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-secondary py-8 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-primary mb-2">
              My Orders
            </h1>
            <p className="text-dark/60 font-body">
              Track and manage your orders
            </p>
          </div>

          {orders.length === 0 ? (
            /* ---- Empty State ---- */
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-primary/5">
              <p className="text-6xl mb-4">📦</p>
              <h2 className="font-heading text-xl font-bold text-primary mb-2">No orders yet</h2>
              <p className="text-dark/60 font-body mb-6">Start shopping to see your orders here!</p>
              <button
                onClick={() => router.push('/products')}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#B5922A] to-[#d4a843] text-primary font-bold text-sm uppercase tracking-wider hover:shadow-lg transition-all"
              >
                Browse Products
              </button>
            </div>
          ) : (
            /* ---- Order Cards ---- */
            <div className="space-y-6">
              {orders.map((order) => {
                const os = STATUS_STYLES[order.orderStatus] || STATUS_STYLES.pending;
                const ps = PAYMENT_STYLES[order.paymentStatus] || PAYMENT_STYLES.pending;
                const canCancel = ['pending', 'confirmed'].includes(order.orderStatus);
                const canTrack = order.awbCode && ['shipped', 'delivered'].includes(order.orderStatus);

                return (
                  <div key={order._id} className="bg-white rounded-2xl shadow-sm border border-primary/5 overflow-hidden hover:shadow-md transition-shadow">
                    {/* Header */}
                    <div className="px-6 py-4 bg-secondary/30 border-b border-primary/5 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs text-dark/50 font-body">Order ID</p>
                        <p className="text-sm font-mono font-semibold text-primary">
                          #{order._id.slice(-8).toUpperCase()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-dark/50 font-body">Placed on</p>
                        <p className="text-sm font-medium text-dark">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric',
                          })}
                        </p>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${os.bg} ${os.text} border ${os.border}`}>
                          {os.icon} {os.label}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${ps.bg} ${ps.text}`}>
                          {ps.label}
                        </span>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="px-6 py-4">
                      <div className="space-y-3">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-secondary/50 flex-shrink-0">
                              {item.image ? (
                                <Image src={item.image} alt={item.name} fill style={{ objectFit: 'cover' }} sizes="48px" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-lg">📦</div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-dark truncate">{item.name}</p>
                              <p className="text-xs text-dark/50">Qty: {item.quantity} × ₹{item.price}</p>
                            </div>
                            <p className="text-sm font-semibold text-dark">
                              ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* AWB info */}
                      {order.awbCode && (
                        <div className="mt-3 pt-3 border-t border-primary/5 flex items-center gap-2">
                          <span className="text-xs text-dark/50 font-body">🚚 AWB:</span>
                          <span className="text-xs font-mono font-semibold text-primary">{order.awbCode}</span>
                          {order.courierName && (
                            <span className="text-xs text-dark/40 font-body">via {order.courierName}</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Footer — Actions */}
                    <div className="px-6 py-3 bg-secondary/20 border-t border-primary/5 flex items-center justify-between flex-wrap gap-3">
                      <div>
                        {order.shippingAddress && (
                          <p className="text-xs text-dark/50">
                            📍 {order.shippingAddress.city}, {order.shippingAddress.state}
                          </p>
                        )}
                        <div className="text-right sm:text-left mt-1">
                          <p className="text-xs text-dark/50">Total</p>
                          <p className="text-lg font-heading font-bold text-accent">
                            ₹{order.total.toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 flex-wrap">
                        <Link
                          href={`/orders/${order._id}`}
                          className="px-4 py-2 rounded-lg bg-primary text-secondary text-xs font-semibold hover:bg-primary/90 transition-colors"
                        >
                          View Details
                        </Link>

                        {canTrack && (
                          <Link
                            href={`/orders/${order._id}?tab=tracking`}
                            className="px-4 py-2 rounded-lg bg-accent text-primary text-xs font-semibold hover:bg-accent/80 transition-colors"
                          >
                            🚚 Track Order
                          </Link>
                        )}

                        {canCancel && (
                          <button
                            onClick={() => handleCancel(order._id)}
                            disabled={cancellingId === order._id}
                            className="px-4 py-2 rounded-lg border border-red-300 text-red-600 text-xs font-semibold hover:bg-red-50 transition-colors disabled:opacity-50"
                          >
                            {cancellingId === order._id ? 'Cancelling...' : 'Cancel'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
