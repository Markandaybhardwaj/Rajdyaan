'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import styles from './detail.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

const ORDER_STATUS_OPTIONS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

const BADGE_MAP = {
  pending:    styles.badgePending,
  confirmed:  styles.badgeConfirmed,
  processing: styles.badgeProcessing,
  shipped:    styles.badgeShipped,
  delivered:  styles.badgeDelivered,
  cancelled:  styles.badgeCancelled,
  paid:       styles.badgePaid,
  failed:     styles.badgeFailed,
  refunded:   styles.badgeRefunded,
};

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [creatingShipment, setCreatingShipment] = useState(false);
  const [toast, setToast] = useState(null); // { type: 'success'|'error', message }

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch order
  const fetchOrder = async () => {
    try {
      const res = await fetch(`${API_URL}/order/${id}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch order');
      const data = await res.json();
      setOrder(data.data?.order || null);
    } catch (err) {
      showToast('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchOrder();
  }, [id]);

  // Update status
  const handleStatusChange = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      const res = await fetch(`${API_URL}/order/admin/${id}/status`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Update failed');
      }
      showToast('success', `Status updated to "${newStatus}"`);
      await fetchOrder();
    } catch (err) {
      showToast('error', err.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Create Shiprocket Shipment
  const handleCreateShipment = async () => {
    if (!confirm('Create Shiprocket shipment for this order? This will assign a courier and AWB.')) return;

    setCreatingShipment(true);
    try {
      const res = await fetch(`${API_URL}/shipping/create`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: id }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to create shipment');
      }

      const shipData = data.data || {};
      showToast(
        'success',
        `Shipment created! AWB: ${shipData.awbCode || 'Pending'} | Courier: ${shipData.courierName || 'Auto-assigned'}`
      );
      await fetchOrder();
    } catch (err) {
      showToast('error', err.message);
    } finally {
      setCreatingShipment(false);
    }
  };

  // Helpers
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  };
  const formatDateTime = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className={styles.loadingWrap}>
        <div className={styles.spinner} />
        <p style={{ color: '#8a7460', fontSize: '0.9rem' }}>Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className={styles.loadingWrap}>
        <p style={{ fontSize: '3rem' }}>😕</p>
        <p style={{ color: '#8a7460' }}>Order not found</p>
        <Link href="/admin/orders" className={styles.backLink}>← Back to Orders</Link>
      </div>
    );
  }

  const isCancelled = order.orderStatus === 'cancelled';
  const isDelivered = order.orderStatus === 'delivered';
  const isShipped = order.orderStatus === 'shipped';
  const canShip = !order.awbCode && !isCancelled && !isDelivered
    && (order.paymentStatus === 'paid' || order.paymentMethod === 'cod');

  return (
    <div className={styles.page}>
      {/* Back Link */}
      <Link href="/admin/orders" className={styles.backLink}>← Back to Orders</Link>

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>
            Order <span className={styles.orderId}>#{order._id.slice(-8).toUpperCase()}</span>
          </h1>
          <p>Placed on {formatDateTime(order.createdAt)}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <span className={`${styles.badge} ${styles.badgeLg} ${BADGE_MAP[order.paymentStatus] || ''}`}>
            💳 {order.paymentStatus || 'pending'}
          </span>
          <span className={`${styles.badge} ${styles.badgeLg} ${BADGE_MAP[order.orderStatus] || ''}`}>
            📦 {order.orderStatus}
          </span>
        </div>
      </div>

      {/* ---- Shipment Action Card ---- */}
      <div className={`${styles.card} ${order.awbCode ? styles.shipmentCard : ''}`} style={{ marginBottom: '1.5rem' }}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>🚀 Shipment</h3>
          {order.awbCode && (
            <span className={`${styles.badge} ${styles.badgeShipped}`}>Shiprocket Connected</span>
          )}
        </div>
        <div className={styles.cardBody}>
          {order.awbCode ? (
            /* ---- Shipment already created ---- */
            <div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>AWB Code</span>
                <span className={styles.awbCode}>{order.awbCode}</span>
              </div>
              {order.courierName && (
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Courier Partner</span>
                  <span className={styles.courierName}>{order.courierName}</span>
                </div>
              )}
              {order.shiprocketOrderId && (
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Shiprocket Order ID</span>
                  <span className={styles.infoValue}>{order.shiprocketOrderId}</span>
                </div>
              )}
              {order.shippedAt && (
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Shipped On</span>
                  <span className={styles.infoValue}>{formatDateTime(order.shippedAt)}</span>
                </div>
              )}
              {order.deliveredAt && (
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Delivered On</span>
                  <span className={styles.infoValue}>{formatDateTime(order.deliveredAt)}</span>
                </div>
              )}
            </div>
          ) : canShip ? (
            /* ---- Ready to ship ---- */
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <p style={{ color: '#6b5540', fontSize: '0.95rem', fontWeight: 600, marginBottom: '1.25rem' }}>
                📦 Ready to Dispatch
              </p>
              <button
                className={styles.shipBtn}
                onClick={handleCreateShipment}
                disabled={creatingShipment}
              >
                {creatingShipment ? (
                  <>
                    <span className={styles.spinner} style={{ width: 18, height: 18, borderWidth: 2 }} />
                    Creating Shipment...
                  </>
                ) : (
                  '🚀 Create Shiprocket Shipment'
                )}
              </button>
            </div>
          ) : isCancelled ? (
            <p style={{ textAlign: 'center', color: '#991b1b', padding: '1rem', fontSize: '0.9rem' }}>
              ✕ This order has been cancelled
            </p>
          ) : order.paymentStatus !== 'paid' && order.paymentMethod !== 'cod' ? (
            <p style={{ textAlign: 'center', color: '#92400e', padding: '1rem', fontSize: '0.9rem' }}>
              ⏳ Waiting for payment to be completed before shipping
            </p>
          ) : (
            <p style={{ textAlign: 'center', color: '#065f46', padding: '1rem', fontSize: '0.9rem' }}>
              ✅ Order has been delivered
            </p>
          )}
        </div>
      </div>

      {/* ---- Main Grid ---- */}
      <div className={styles.grid}>

        {/* ---- Status Management ---- */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>📋 Order Status</h3>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Current Status</span>
              <span className={`${styles.badge} ${BADGE_MAP[order.orderStatus] || ''}`}>
                {order.orderStatus}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Change Status</span>
              <select
                className={styles.statusSelect}
                value={order.orderStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={updatingStatus}
              >
                {ORDER_STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Payment Method</span>
              <span className={styles.infoValue} style={{ textTransform: 'uppercase' }}>
                {order.paymentMethod}
              </span>
            </div>
            {order.razorpayPaymentId && (
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Razorpay ID</span>
                <span className={styles.infoValue} style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>
                  {order.razorpayPaymentId}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ---- Shipping Address ---- */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>📍 Shipping Address</h3>
          </div>
          <div className={styles.cardBody}>
            {order.shippingAddress ? (
              <div className={styles.addressBlock}>
                <div className="name">{order.shippingAddress.fullName}</div>
                <div className="detail">{order.shippingAddress.addressLine1}</div>
                {order.shippingAddress.addressLine2 && (
                  <div className="detail">{order.shippingAddress.addressLine2}</div>
                )}
                <div className="detail">
                  {order.shippingAddress.city}, {order.shippingAddress.state}
                </div>
                <div className="detail" style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                  {order.shippingAddress.pincode}
                </div>
                <div className="phone">📞 {order.shippingAddress.phone}</div>
              </div>
            ) : (
              <p style={{ color: '#8a7460' }}>No address available</p>
            )}
          </div>
        </div>

        {/* ---- Payment Summary ---- */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>💰 Payment Summary</h3>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Subtotal</span>
              <span className={styles.infoValue}>₹{order.subtotal?.toLocaleString('en-IN')}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>
                  Discount {order.couponCode ? `(${order.couponCode})` : ''}
                </span>
                <span className={styles.infoValue} style={{ color: '#065f46' }}>
                  -₹{order.discountAmount?.toLocaleString('en-IN')}
                </span>
              </div>
            )}
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Shipping</span>
              <span className={styles.infoValue} style={{ color: order.shippingCharge === 0 ? '#065f46' : '#3B1F0A' }}>
                {order.shippingCharge === 0 ? 'FREE' : `₹${order.shippingCharge}`}
              </span>
            </div>
            <div className={styles.infoRow} style={{ borderTop: '2px solid rgba(59,31,10,0.08)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
              <span className={styles.infoLabel} style={{ fontWeight: 700, color: '#3B1F0A' }}>Total</span>
              <span className={styles.infoValueAccent}>
                ₹{order.total?.toLocaleString('en-IN')}
              </span>
            </div>
            {order.paidAt && (
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Paid On</span>
                <span className={styles.infoValue}>{formatDateTime(order.paidAt)}</span>
              </div>
            )}
          </div>
        </div>

        {/* ---- Timeline ---- */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>⏱️ Timeline</h3>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Order Placed</span>
              <span className={styles.infoValue}>{formatDateTime(order.createdAt)}</span>
            </div>
            {order.paidAt && (
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Payment Received</span>
                <span className={styles.infoValue}>{formatDateTime(order.paidAt)}</span>
              </div>
            )}
            {order.shippedAt && (
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Shipped</span>
                <span className={styles.infoValue}>{formatDateTime(order.shippedAt)}</span>
              </div>
            )}
            {order.deliveredAt && (
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Delivered</span>
                <span className={styles.infoValue}>{formatDateTime(order.deliveredAt)}</span>
              </div>
            )}
          </div>
        </div>

        {/* ---- Order Items (Full Width) ---- */}
        <div className={`${styles.card} ${styles.gridFull}`}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>📦 Items ({order.items?.length || 0})</h3>
          </div>
          <div className={styles.cardBody}>
            {order.items?.map((item, idx) => (
              <div key={idx} className={styles.itemRow}>
                <div className={styles.itemImage}>
                  {item.image ? (
                    <img src={item.image} alt={item.name} />
                  ) : (
                    '📦'
                  )}
                </div>
                <div className={styles.itemInfo}>
                  <div className={styles.itemName}>{item.name}</div>
                  <div className={styles.itemMeta}>
                    Qty: {item.quantity} × ₹{item.price?.toLocaleString('en-IN')}
                  </div>
                </div>
                <div className={styles.itemPrice}>
                  ₹{(item.price * item.quantity)?.toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ---- Toast ---- */}
      {toast && (
        <div className={`${styles.toast} ${toast.type === 'success' ? styles.toastSuccess : styles.toastError}`}>
          {toast.type === 'success' ? '✅' : '⚠️'} {toast.message}
        </div>
      )}
    </div>
  );
}
