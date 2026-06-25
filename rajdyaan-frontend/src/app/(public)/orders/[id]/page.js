'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import useAuthStore from '@/store/useAuthStore';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// ---------------------------------------------------------------------------
// Timeline Steps
// ---------------------------------------------------------------------------
const TIMELINE_STEPS = [
  { key: 'pending',    label: 'Order Placed',  icon: '📝' },
  { key: 'confirmed',  label: 'Confirmed',     icon: '✓' },
  { key: 'processing', label: 'Processing',    icon: '⚙️' },
  { key: 'shipped',    label: 'Shipped',       icon: '🚚' },
  { key: 'delivered',  label: 'Delivered',     icon: '✅' },
];

const STATUS_INDEX = {
  pending: 0,
  confirmed: 1,
  processing: 2,
  shipped: 3,
  delivered: 4,
  cancelled: -1,
};

// ---------------------------------------------------------------------------
// Order Detail Page
// ---------------------------------------------------------------------------
export default function OrderDetailPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const showTracking = searchParams.get('tab') === 'tracking';
  const { isAuthenticated } = useAuthStore();

  const [order, setOrder] = useState(null);
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(showTracking ? 'tracking' : 'details');

  // Fetch order
  useEffect(() => {
    if (isAuthenticated && id) {
      fetchOrder();
    }
  }, [isAuthenticated, id]);

  // Auto-fetch tracking if tab=tracking
  useEffect(() => {
    if (order?.awbCode && activeTab === 'tracking' && !tracking) {
      fetchTracking();
    }
  }, [order, activeTab]);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`${API_URL}/order/${id}`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) {
        setOrder(data.data?.order || null);
      }
    } catch (err) {
      console.error('Failed to fetch order:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTracking = async () => {
    if (!order?._id) return;
    setTrackingLoading(true);
    try {
      const res = await fetch(`${API_URL}/shipping/track/${order._id}`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) {
        setTracking(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch tracking:', err);
    } finally {
      setTrackingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-accent/30 border-t-accent rounded-full animate-spin" />
          <p className="animate-pulse text-primary font-heading text-xl">Loading order...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-secondary gap-4">
        <p className="text-6xl">😕</p>
        <h2 className="font-heading text-xl font-bold text-primary">Order not found</h2>
        <Link href="/orders" className="text-accent font-body hover:underline">
          ← Back to Orders
        </Link>
      </div>
    );
  }

  const currentStepIndex = STATUS_INDEX[order.orderStatus] ?? 0;
  const isCancelled = order.orderStatus === 'cancelled';

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-secondary py-8 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">

          {/* Back + Header */}
          <Link href="/orders" className="inline-flex items-center gap-1 text-accent font-body text-sm hover:underline mb-6">
            ← Back to Orders
          </Link>

          <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
            <div>
              <h1 className="font-heading text-2xl md:text-3xl font-bold text-primary">
                Order #{order._id.slice(-8).toUpperCase()}
              </h1>
              <p className="text-dark/50 font-body text-sm mt-1">
                Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
              </p>
            </div>
            <div className={`px-4 py-2 rounded-full text-sm font-bold ${
              isCancelled
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-green-50 text-green-700 border border-green-200'
            }`}>
              {isCancelled ? '✕ Cancelled' : TIMELINE_STEPS[currentStepIndex]?.icon + ' ' + TIMELINE_STEPS[currentStepIndex]?.label}
            </div>
          </div>

          {/* ---- Order Progress Timeline ---- */}
          {!isCancelled && (
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-primary/5 mb-6">
              <h2 className="font-heading text-lg font-bold text-primary mb-6">Order Progress</h2>
              <div className="flex items-center justify-between relative">
                {/* Progress bar background */}
                <div className="absolute top-5 left-0 right-0 h-1 bg-primary/10 rounded-full" />
                {/* Progress bar filled */}
                <div
                  className="absolute top-5 left-0 h-1 bg-accent rounded-full transition-all duration-500"
                  style={{ width: `${(currentStepIndex / (TIMELINE_STEPS.length - 1)) * 100}%` }}
                />

                {TIMELINE_STEPS.map((step, i) => {
                  const isCompleted = i <= currentStepIndex;
                  const isCurrent = i === currentStepIndex;

                  return (
                    <div key={step.key} className="relative z-10 flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 transition-all ${
                        isCompleted
                          ? 'bg-accent border-accent text-primary shadow-md'
                          : 'bg-white border-primary/20 text-dark/30'
                      } ${isCurrent ? 'ring-4 ring-accent/20 scale-110' : ''}`}>
                        {step.icon}
                      </div>
                      <p className={`text-xs font-body mt-2 text-center ${
                        isCompleted ? 'font-semibold text-primary' : 'text-dark/40'
                      }`}>
                        {step.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ---- Tabs ---- */}
          <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-primary/5 mb-6">
            {['details', 'tracking'].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  if (tab === 'tracking' && order.awbCode && !tracking) {
                    fetchTracking();
                  }
                }}
                className={`flex-1 py-3 rounded-lg text-sm font-semibold font-body transition-all ${
                  activeTab === tab
                    ? 'bg-primary text-secondary shadow-sm'
                    : 'text-dark/50 hover:text-dark hover:bg-secondary/50'
                }`}
              >
                {tab === 'details' ? '📋 Order Details' : '🚚 Live Tracking'}
              </button>
            ))}
          </div>

          {/* ---- Tab Content ---- */}
          {activeTab === 'details' ? (
            /* ============ ORDER DETAILS TAB ============ */
            <div className="space-y-6">

              {/* Items */}
              <div className="bg-white rounded-2xl shadow-sm border border-primary/5 overflow-hidden">
                <div className="px-6 py-4 border-b border-primary/5">
                  <h3 className="font-heading text-base font-bold text-primary">Items ({order.items.length})</h3>
                </div>
                <div className="divide-y divide-primary/5">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="px-6 py-4 flex items-center gap-4">
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-secondary/50 flex-shrink-0 border border-primary/5">
                        {item.image ? (
                          <Image src={item.image} alt={item.name} fill style={{ objectFit: 'cover' }} sizes="64px" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-dark truncate">{item.name}</p>
                        <p className="text-xs text-dark/50 mt-0.5">Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}</p>
                      </div>
                      <p className="text-sm font-bold text-primary whitespace-nowrap">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Breakdown + Shipping Address side by side */}
              <div className="grid md:grid-cols-2 gap-6">

                {/* Price Breakdown */}
                <div className="bg-white rounded-2xl shadow-sm border border-primary/5 p-6">
                  <h3 className="font-heading text-base font-bold text-primary mb-4">Payment Summary</h3>
                  <div className="space-y-3 font-body text-sm">
                    <div className="flex justify-between">
                      <span className="text-dark/60">Subtotal</span>
                      <span className="text-dark font-medium">₹{order.subtotal.toLocaleString('en-IN')}</span>
                    </div>
                    {order.discountAmount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount {order.couponCode ? `(${order.couponCode})` : ''}</span>
                        <span className="font-medium">-₹{order.discountAmount.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-dark/60">Shipping</span>
                      <span className={order.shippingCharge === 0 ? 'text-green-600 font-medium' : 'text-dark font-medium'}>
                        {order.shippingCharge === 0 ? 'FREE' : `₹${order.shippingCharge}`}
                      </span>
                    </div>
                    <div className="h-px bg-primary/10 my-2" />
                    <div className="flex justify-between text-base">
                      <span className="font-heading font-bold text-primary">Total</span>
                      <span className="font-heading font-bold text-accent text-lg">
                        ₹{order.total.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-primary/5 text-xs text-dark/50">
                      <p>Payment: <span className="font-semibold text-dark/70 uppercase">{order.paymentMethod}</span></p>
                      {order.paidAt && <p>Paid on: {new Date(order.paidAt).toLocaleDateString('en-IN')}</p>}
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-white rounded-2xl shadow-sm border border-primary/5 p-6">
                  <h3 className="font-heading text-base font-bold text-primary mb-4">Shipping Address</h3>
                  {order.shippingAddress ? (
                    <div className="font-body text-sm text-dark/70 space-y-1">
                      <p className="font-semibold text-dark text-base">{order.shippingAddress.fullName}</p>
                      <p>{order.shippingAddress.addressLine1}</p>
                      {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                      <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                      <p className="font-mono">{order.shippingAddress.pincode}</p>
                      <p className="mt-2">📞 {order.shippingAddress.phone}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-dark/40">No address available</p>
                  )}

                  {/* AWB Info */}
                  {order.awbCode && (
                    <div className="mt-4 pt-4 border-t border-primary/5">
                      <p className="text-xs text-dark/50 font-body">Shipment Details</p>
                      <div className="mt-1 space-y-1 text-sm font-body">
                        <p><span className="text-dark/50">AWB:</span> <span className="font-mono font-semibold text-primary">{order.awbCode}</span></p>
                        {order.courierName && <p><span className="text-dark/50">Courier:</span> <span className="font-semibold">{order.courierName}</span></p>}
                        {order.shippedAt && <p><span className="text-dark/50">Shipped:</span> {new Date(order.shippedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* ============ TRACKING TAB ============ */
            <div className="bg-white rounded-2xl shadow-sm border border-primary/5 p-6 md:p-8">
              <h3 className="font-heading text-lg font-bold text-primary mb-6">📦 Shipment Tracking</h3>

              {!order.awbCode ? (
                <div className="text-center py-12">
                  <p className="text-4xl mb-3">📋</p>
                  <p className="font-body text-dark/60">
                    Shipment has not been created yet.<br />
                    You&apos;ll be able to track once the order is shipped.
                  </p>
                </div>
              ) : trackingLoading ? (
                <div className="flex flex-col items-center py-12 gap-3">
                  <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                  <p className="text-sm text-dark/50 font-body">Fetching live tracking...</p>
                </div>
              ) : tracking?.tracking ? (
                <div>
                  {/* Current Status */}
                  <div className="bg-accent/10 rounded-xl p-4 mb-6 flex items-center gap-3">
                    <span className="text-2xl">🚚</span>
                    <div>
                      <p className="font-body text-sm text-dark/50">Current Status</p>
                      <p className="font-heading font-bold text-primary text-lg">
                        {tracking.tracking.currentStatus}
                      </p>
                      {tracking.tracking.estimatedDelivery && (
                        <p className="font-body text-xs text-dark/50 mt-1">
                          Estimated delivery: <span className="font-semibold">{tracking.tracking.estimatedDelivery}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Activity Timeline */}
                  {tracking.tracking.activities?.length > 0 && (
                    <div className="space-y-0">
                      <p className="font-body text-sm font-semibold text-dark/60 mb-4">Activity Log</p>
                      {tracking.tracking.activities.map((activity, i) => (
                        <div key={i} className="flex gap-4">
                          {/* Timeline line */}
                          <div className="flex flex-col items-center">
                            <div className={`w-3 h-3 rounded-full ${i === 0 ? 'bg-accent' : 'bg-primary/20'}`} />
                            {i < tracking.tracking.activities.length - 1 && (
                              <div className="w-0.5 flex-1 bg-primary/10" />
                            )}
                          </div>
                          {/* Content */}
                          <div className="pb-6 flex-1">
                            <p className={`text-sm font-body ${i === 0 ? 'font-semibold text-dark' : 'text-dark/60'}`}>
                              {activity.status}
                            </p>
                            <p className="text-xs text-dark/40 font-body mt-0.5">
                              {activity.location} {activity.date ? `• ${activity.date}` : ''}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Track URL */}
                  {tracking.tracking.trackUrl && (
                    <a
                      href={tracking.tracking.trackUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-secondary text-sm font-semibold hover:bg-primary/90 transition-colors"
                    >
                      Track on Courier Website →
                    </a>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-4xl mb-3">📡</p>
                  <p className="font-body text-dark/60 mb-4">
                    Tracking information will appear here once the shipment is in transit.
                  </p>
                  <button
                    onClick={fetchTracking}
                    className="px-5 py-2.5 rounded-lg bg-accent text-primary text-sm font-semibold hover:bg-accent/80 transition-colors"
                  >
                    Refresh Tracking
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
