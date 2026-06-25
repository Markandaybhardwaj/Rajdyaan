'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import Image from 'next/image';
import useCartStore from '@/store/useCartStore';
import useAuthStore from '@/store/useAuthStore';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// ---------------------------------------------------------------------------
// Indian states for the dropdown
// ---------------------------------------------------------------------------
const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh',
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, discountAmount, total, coupon, clearCart } = useCartStore();
  const { user, isAuthenticated, isLoading, checkAuth } = useAuthStore();

  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(1); // 1 = Address, 2 = Payment
  const [processing, setProcessing] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // Address form state
  const [address, setAddress] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    setMounted(true);
    checkAuth();
  }, [checkAuth]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (mounted && !isLoading && !isAuthenticated) {
      toast.error('Please login to checkout');
      router.push('/login');
    }
  }, [mounted, isLoading, isAuthenticated, router]);

  // Redirect if cart is empty
  useEffect(() => {
    if (mounted && items.length === 0) {
      router.push('/cart');
    }
  }, [mounted, items, router]);

  // Pre-fill name if user data is available
  useEffect(() => {
    if (user?.name && !address.fullName) {
      setAddress((prev) => ({ ...prev, fullName: user.name }));
    }
  }, [user, address.fullName]);

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary">
        <div className="animate-pulse text-primary font-heading text-2xl">Loading...</div>
      </div>
    );
  }

  // ----- Computed values -----
  const cartSubtotal = typeof subtotal === 'function' ? subtotal() : subtotal;
  const cartDiscount = typeof discountAmount === 'function' ? discountAmount() : discountAmount;
  const cartTotal = typeof total === 'function' ? total() : total;
  const shippingCharge = cartSubtotal >= 499 ? 0 : 49;
  const finalTotal = Math.max(0, cartTotal + shippingCharge);

  // ----- Validation -----
  const validateAddress = () => {
    const errs = {};
    if (!address.fullName.trim()) errs.fullName = 'Full name is required';
    if (!address.phone.trim()) errs.phone = 'Phone number is required';
    else if (!/^[6-9]\d{9}$/.test(address.phone.trim())) errs.phone = 'Enter valid 10-digit phone';
    if (!address.addressLine1.trim()) errs.addressLine1 = 'Address is required';
    if (!address.city.trim()) errs.city = 'City is required';
    if (!address.state) errs.state = 'State is required';
    if (!address.pincode.trim()) errs.pincode = 'Pincode is required';
    else if (!/^\d{6}$/.test(address.pincode.trim())) errs.pincode = 'Enter valid 6-digit pincode';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone' && value !== '' && !/^\d*$/.test(value)) return;
    if (name === 'pincode' && value !== '' && !/^\d*$/.test(value)) return;
    setAddress((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleContinueToPayment = (e) => {
    e.preventDefault();
    if (validateAddress()) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // ----- Razorpay Payment Flow -----
  const handlePayment = async () => {
    if (!razorpayLoaded || !window.Razorpay) {
      toast.error('Payment gateway is loading. Please wait...');
      return;
    }

    setProcessing(true);

    try {
      // STEP 1: Create order on our backend
      const orderPayload = {
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        shippingAddress: address,
        couponCode: coupon?.code || null,
      };

      const res = await fetch(`${API_URL}/payment/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to create order');
      }

      const { razorpayOrderId, amount, keyId, orderId } = data.data;

      // STEP 2: Open Razorpay checkout
      const options = {
        key: keyId,
        amount: amount,
        currency: 'INR',
        name: 'Rajdhyaan™',
        description: `Order #${orderId.slice(-8).toUpperCase()}`,
        order_id: razorpayOrderId,
        prefill: {
          name: user?.name || address.fullName,
          email: user?.email || '',
          contact: address.phone,
        },
        theme: {
          color: '#B5922A',
        },
        // STEP 3: On successful payment → verify on backend
        handler: async function (response) {
          try {
            const verifyRes = await fetch(`${API_URL}/payment/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                orderId,
              }),
            });

            const verifyData = await verifyRes.json();

            if (!verifyRes.ok) {
              throw new Error(verifyData.message || 'Payment verification failed');
            }

            // SUCCESS! Clear cart and redirect
            clearCart();
            toast.success('Payment successful! 🎉');
            router.push('/orders');
          } catch (err) {
            toast.error(err.message || 'Payment verification failed');
            setProcessing(false);
          }
        },
        modal: {
          ondismiss: function () {
            toast('Payment cancelled', { icon: '⚠️' });
            setProcessing(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', function (response) {
        toast.error(response.error?.description || 'Payment failed');
        setProcessing(false);
      });
      razorpay.open();
    } catch (err) {
      toast.error(err.message || 'Something went wrong');
      setProcessing(false);
    }
  };

  return (
    <>
      {/* Load Razorpay script from CDN */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setRazorpayLoaded(true)}
        strategy="afterInteractive"
      />

      <div className="min-h-screen bg-secondary py-8 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">

          {/* ---- Page Title ---- */}
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-primary mb-2 text-center">
            Checkout
          </h1>
          <p className="text-center text-dark/60 font-body mb-8">
            Secure checkout powered by Razorpay
          </p>

          {/* ---- Step Indicator ---- */}
          <div className="flex items-center justify-center gap-4 mb-10">
            <StepPill num={1} label="Shipping" active={step === 1} done={step > 1} onClick={() => step > 1 && setStep(1)} />
            <div className={`h-0.5 w-12 transition-all duration-300 ${step > 1 ? 'bg-accent' : 'bg-primary/20'}`} />
            <StepPill num={2} label="Payment" active={step === 2} done={false} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* ---- Left: Form Area ---- */}
            <div className="lg:col-span-2">

              {/* ==== STEP 1: ADDRESS ==== */}
              {step === 1 && (
                <form onSubmit={handleContinueToPayment} className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-primary/5">
                  <h2 className="font-heading text-xl font-bold text-primary mb-6 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent text-sm font-bold">1</span>
                    Shipping Address
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <InputField label="Full Name" name="fullName" value={address.fullName} onChange={handleAddressChange} error={errors.fullName} placeholder="Your full name" />
                    <InputField label="Phone Number" name="phone" value={address.phone} onChange={handleAddressChange} error={errors.phone} placeholder="10-digit mobile number" inputMode="numeric" maxLength={10} />
                    <div className="md:col-span-2">
                      <InputField label="Address Line 1" name="addressLine1" value={address.addressLine1} onChange={handleAddressChange} error={errors.addressLine1} placeholder="House no., Street, Area" />
                    </div>
                    <div className="md:col-span-2">
                      <InputField label="Address Line 2 (Optional)" name="addressLine2" value={address.addressLine2} onChange={handleAddressChange} placeholder="Landmark, Building" />
                    </div>
                    <InputField label="City" name="city" value={address.city} onChange={handleAddressChange} error={errors.city} placeholder="City" />
                    <div>
                      <label className="block text-xs font-semibold text-primary uppercase tracking-wide mb-1.5">State *</label>
                      <select
                        name="state"
                        value={address.state}
                        onChange={handleAddressChange}
                        className={`w-full px-4 py-3 rounded-xl border ${errors.state ? 'border-red-400 bg-red-50/50' : 'border-primary/10 bg-secondary/50'} text-dark font-body text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all`}
                      >
                        <option value="">Select state</option>
                        {INDIAN_STATES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                    </div>
                    <InputField label="Pincode" name="pincode" value={address.pincode} onChange={handleAddressChange} error={errors.pincode} placeholder="6-digit pincode" inputMode="numeric" maxLength={6} />
                  </div>

                  <button
                    type="submit"
                    className="mt-8 w-full py-3.5 rounded-xl bg-gradient-to-r from-[#B5922A] to-[#d4a843] text-primary font-bold text-sm uppercase tracking-wider hover:shadow-lg hover:shadow-accent/20 transition-all duration-300 hover:-translate-y-0.5"
                  >
                    Continue to Payment →
                  </button>
                </form>
              )}

              {/* ==== STEP 2: PAYMENT ==== */}
              {step === 2 && (
                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-primary/5">
                  <h2 className="font-heading text-xl font-bold text-primary mb-6 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent text-sm font-bold">2</span>
                    Payment
                  </h2>

                  {/* Shipping Address Summary */}
                  <div className="bg-secondary/60 rounded-xl p-4 mb-6 border border-primary/5">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-primary uppercase tracking-wide">Delivering to</p>
                      <button
                        onClick={() => setStep(1)}
                        className="text-accent text-xs font-semibold hover:underline"
                      >
                        Change
                      </button>
                    </div>
                    <p className="text-sm font-semibold text-dark">{address.fullName}</p>
                    <p className="text-sm text-dark/70">{address.addressLine1}</p>
                    {address.addressLine2 && <p className="text-sm text-dark/70">{address.addressLine2}</p>}
                    <p className="text-sm text-dark/70">{address.city}, {address.state} — {address.pincode}</p>
                    <p className="text-sm text-dark/70">📞 {address.phone}</p>
                  </div>

                  {/* Payment Methods Info */}
                  <div className="bg-secondary/40 rounded-xl p-4 mb-6 border border-primary/5">
                    <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-3">Accepted Payment Methods</p>
                    <div className="flex flex-wrap gap-3">
                      {['UPI', 'Debit Card', 'Credit Card', 'Net Banking', 'Wallets'].map((m) => (
                        <span key={m} className="px-3 py-1.5 bg-white rounded-lg text-xs font-medium text-dark/80 border border-primary/5">
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Security Badges */}
                  <div className="flex items-center gap-4 mb-8 text-dark/50 text-xs">
                    <span>🔒 256-bit SSL Encrypted</span>
                    <span>•</span>
                    <span>✅ RBI Compliant</span>
                    <span>•</span>
                    <span>🛡️ Razorpay Secured</span>
                  </div>

                  {/* Pay Button */}
                  <button
                    onClick={handlePayment}
                    disabled={processing || !razorpayLoaded}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-[#B5922A] to-[#d4a843] text-primary font-bold text-base uppercase tracking-wider hover:shadow-lg hover:shadow-accent/20 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                        Processing...
                      </>
                    ) : (
                      `Pay ₹${finalTotal.toLocaleString('en-IN')}`
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* ---- Right: Order Summary Sidebar ---- */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-primary/5 sticky top-24">
                <h3 className="font-heading text-lg font-bold text-primary mb-4">Order Summary</h3>

                {/* Items */}
                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={item.productId} className="flex gap-3">
                      <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-secondary/50 flex-shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          style={{ objectFit: 'cover' }}
                          sizes="56px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-dark truncate">{item.name}</p>
                        <p className="text-xs text-dark/60">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold text-dark whitespace-nowrap">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-primary/5 pt-4 space-y-2">
                  <SummaryRow label="Subtotal" value={`₹${cartSubtotal.toLocaleString('en-IN')}`} />
                  {cartDiscount > 0 && (
                    <SummaryRow label={`Discount ${coupon?.code ? `(${coupon.code})` : ''}`} value={`-₹${cartDiscount.toLocaleString('en-IN')}`} highlight />
                  )}
                  <SummaryRow
                    label="Shipping"
                    value={shippingCharge === 0 ? 'FREE' : `₹${shippingCharge}`}
                    highlight={shippingCharge === 0}
                  />
                </div>

                <div className="border-t border-primary/10 mt-3 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-heading text-lg font-bold text-primary">Total</span>
                    <span className="font-heading text-xl font-bold text-accent">
                      ₹{finalTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {shippingCharge === 0 && (
                  <div className="mt-3 bg-green-50 border border-green-100 rounded-lg px-3 py-2 text-center">
                    <p className="text-xs text-green-700 font-medium">🎉 You qualify for FREE shipping!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function StepPill({ num, label, active, done, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
        active
          ? 'bg-accent text-primary shadow-md shadow-accent/20'
          : done
          ? 'bg-accent/10 text-accent cursor-pointer hover:bg-accent/20'
          : 'bg-primary/5 text-dark/40 cursor-default'
      }`}
    >
      {done ? (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <span>{num}</span>
      )}
      {label}
    </button>
  );
}

function InputField({ label, name, value, onChange, error, placeholder, inputMode, maxLength }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-primary uppercase tracking-wide mb-1.5">
        {label} {!label.includes('Optional') && '*'}
      </label>
      <input
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        inputMode={inputMode}
        maxLength={maxLength}
        className={`w-full px-4 py-3 rounded-xl border ${
          error ? 'border-red-400 bg-red-50/50' : 'border-primary/10 bg-secondary/50'
        } text-dark font-body text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all`}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

function SummaryRow({ label, value, highlight }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-dark/60">{label}</span>
      <span className={highlight ? 'text-green-600 font-semibold' : 'text-dark font-medium'}>{value}</span>
    </div>
  );
}
