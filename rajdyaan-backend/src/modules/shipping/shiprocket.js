// ---------------------------------------------------------------------------
// Shiprocket API Service — handles auth token caching, shipment creation,
// AWB generation, and shipment tracking
// ---------------------------------------------------------------------------
// ARCHITECTURE NOTES:
//   - Token is cached in-memory with a 23h TTL (Shiprocket tokens last 24h).
//     This avoids hitting the auth endpoint on every request.
//   - All API calls go through getAuthToken() which auto-refreshes if expired.
//   - createShipment() creates an ad-hoc order (no channel needed) and
//     requests automatic courier assignment + AWB generation.
//   - trackShipment() uses the AWB code to get real-time tracking data.
// ---------------------------------------------------------------------------
import axios from 'axios';

const SHIPROCKET_BASE = 'https://apiv2.shiprocket.in/v1/external';

// ---- In-memory token cache ----
let cachedToken = null;
let tokenExpiresAt = 0; // Unix timestamp (ms)

// ---------------------------------------------------------------------------
// authenticate() — POST /auth/login
// Caches token for 23 hours (Shiprocket tokens expire after 24h)
// ---------------------------------------------------------------------------
export async function authenticate() {
  const now = Date.now();

  // Return cached token if still valid
  if (cachedToken && now < tokenExpiresAt) {
    return cachedToken;
  }

  const { SHIPROCKET_EMAIL, SHIPROCKET_PASSWORD } = process.env;

  if (!SHIPROCKET_EMAIL || !SHIPROCKET_PASSWORD) {
    throw new Error(
      'Shiprocket credentials missing — set SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD in .env'
    );
  }

  const { data } = await axios.post(`${SHIPROCKET_BASE}/auth/login`, {
    email: SHIPROCKET_EMAIL,
    password: SHIPROCKET_PASSWORD,
  });

  cachedToken = data.token;
  // Cache for 23 hours (1h safety margin before actual 24h expiry)
  tokenExpiresAt = now + 23 * 60 * 60 * 1000;

  console.log('[Shiprocket] Authenticated — token cached for 23h');
  return cachedToken;
}

// ---------------------------------------------------------------------------
// Helper — get axios instance with auth header
// ---------------------------------------------------------------------------
async function shiprocketAxios() {
  const token = await authenticate();
  return axios.create({
    baseURL: SHIPROCKET_BASE,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
}

// ---------------------------------------------------------------------------
// createShipment(order) — POST /orders/create/adhoc
// Takes a populated Order document, creates Shiprocket shipment,
// requests AWB assignment, and returns shipping details.
// ---------------------------------------------------------------------------
export async function createShipment(order) {
  const api = await shiprocketAxios();

  // ---- Build Shiprocket order payload ----
  const orderItems = order.items.map((item) => ({
    name: item.name,
    sku: item.product?.toString() || `PROD-${item.name.substring(0, 10)}`,
    units: item.quantity,
    selling_price: item.price,
    discount: 0,
    tax: 0,
    hsn: '', // Update with actual HSN codes when available
  }));

  const payload = {
    order_id: order._id.toString(),
    order_date: new Date(order.createdAt).toISOString().split('T')[0],

    // Pickup address — uses Shiprocket's configured pickup location
    pickup_location: 'Primary',

    // Shipping address from order
    billing_customer_name: order.shippingAddress.fullName.split(' ')[0],
    billing_last_name: order.shippingAddress.fullName.split(' ').slice(1).join(' ') || '',
    billing_address: order.shippingAddress.addressLine1,
    billing_address_2: order.shippingAddress.addressLine2 || '',
    billing_city: order.shippingAddress.city,
    billing_pincode: order.shippingAddress.pincode,
    billing_state: order.shippingAddress.state,
    billing_country: 'India',
    billing_email: '', // Will be populated from user profile when available
    billing_phone: order.shippingAddress.phone,

    // Shipping = billing for now
    shipping_is_billing: true,

    order_items: orderItems,

    payment_method: order.paymentMethod === 'cod' ? 'COD' : 'Prepaid',
    sub_total: order.subtotal,
    total_discount: order.discountAmount || 0,

    // Package dimensions — defaults for food products
    length: 20,
    breadth: 15,
    height: 10,
    // Calculate actual weight: product.weight is stored in grams
    // Fall back to 500g per item if product weight not set
    weight: Math.max(
      0.1,
      order.items.reduce((total, item) => {
        const gramsPerUnit = item.product?.weight || 500; // default 500g if not set
        return total + (gramsPerUnit * item.quantity);
      }, 0) / 1000 // convert grams → kg
    ),
  };

  // Step 1: Create the order on Shiprocket
  const { data: orderData } = await api.post('/orders/create/adhoc', payload);

  const shiprocketOrderId = orderData.order_id?.toString();
  const shipmentId = orderData.shipment_id?.toString();

  let awbCode = null;
  let courierName = null;

  // Step 2: Request AWB assignment (auto courier selection)
  if (shipmentId) {
    try {
      const { data: awbData } = await api.post('/courier/assign/awb', {
        shipment_id: shipmentId,
      });

      awbCode = awbData.response?.data?.awb_code || null;
      courierName = awbData.response?.data?.courier_name || null;

      if (!awbCode) {
        throw new Error('Order created on Shiprocket, but no AWB was assigned. Check your wallet balance.');
      }
    } catch (awbErr) {
      const msg = awbErr.response?.data?.message || awbErr.message || 'AWB assignment failed';
      console.error('[Shiprocket] AWB Error:', msg);
      throw new Error(`Shiprocket AWB Error: ${msg}`);
    }
  }

  return {
    shiprocketOrderId,
    shipmentId,
    awbCode,
    courierName,
  };
}

// ---------------------------------------------------------------------------
// trackShipment(awbCode) — GET /courier/track/awb/:awbCode
// Returns normalised tracking data
// ---------------------------------------------------------------------------
export async function trackShipment(awbCode) {
  const api = await shiprocketAxios();

  const { data } = await api.get(`/courier/track/awb/${awbCode}`);

  // Shiprocket returns tracking_data.track_status, etc.
  const trackingData = data.tracking_data || {};

  return {
    currentStatus: trackingData.shipment_track?.[0]?.current_status || 'Unknown',
    shipmentStatus: trackingData.shipment_status ?? null,
    estimatedDelivery: trackingData.etd || null,
    activities: (trackingData.shipment_track_activities || []).map((a) => ({
      status: a.activity || a['sr-status-label'] || '',
      location: a.location || '',
      date: a.date || '',
    })),
    trackUrl: trackingData.track_url || null,
  };
}

// ---------------------------------------------------------------------------
// cancelShiprocketOrder(shiprocketOrderId) — POST /orders/cancel
// Cancels an order on Shiprocket
// ---------------------------------------------------------------------------
export async function cancelShiprocketOrder(shiprocketOrderId) {
  const api = await shiprocketAxios();

  const { data } = await api.post('/orders/cancel', {
    ids: [Number(shiprocketOrderId)],
  });

  return data;
}
