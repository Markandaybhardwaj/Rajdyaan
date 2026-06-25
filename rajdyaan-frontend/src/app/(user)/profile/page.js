'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchProfile, updateProfile, deleteAddress, setDefaultAddress, addAddress, updateAddress } from '@/lib/profileApi';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

/* ─────────────────────────── helpers ─────────────────────────── */
const initials = (f, l) => {
  const a = (f?.[0] || '').toUpperCase();
  const b = (l?.[0] || '').toUpperCase();
  return a + b || '?';
};

/* ─────────────────────────── sub-components ─────────────────────────── */
function Toggle({ on, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-checked={on}
      role="switch"
      style={{
        width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
        background: on ? '#3B1F0A' : '#C9B49A',
        position: 'relative', transition: 'background .25s', flexShrink: 0,
      }}
    >
      <span style={{
        position: 'absolute', top: 3, left: on ? 22 : 3, width: 18, height: 18,
        borderRadius: '50%', background: '#fff', transition: 'left .25s',
        boxShadow: '0 1px 3px rgba(0,0,0,.25)',
      }} />
    </button>
  );
}

function Pill({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '6px 16px', borderRadius: 999, fontSize: 13, fontFamily: 'DM Sans, sans-serif',
        cursor: 'pointer', border: active ? 'none' : '1.5px solid #D4B896',
        background: active ? '#3B1F0A' : 'transparent',
        color: active ? '#fff' : '#6B4A2A', fontWeight: active ? 600 : 400,
        transition: 'all .2s',
      }}
    >
      {label}
    </button>
  );
}

function SectionCard({ icon, title, action, children }) {
  return (
    <section style={{ background: '#fff', borderRadius: 12, padding: '24px 28px', marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: '#3B1F0A', fontSize: 20 }}>{icon}</span>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, color: '#3B1F0A', margin: 0 }}>{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

const inputStyle = {
  width: '100%', padding: '11px 14px', borderRadius: 8, border: '1.5px solid #D4B896',
  background: '#F5F0E8', fontFamily: 'DM Sans, sans-serif', fontSize: 14,
  color: '#3B2A1A', outline: 'none', boxSizing: 'border-box', transition: 'border-color .2s',
};

/* ═══════════════════════════ PAGE ═══════════════════════════ */
export default function ProfilePage() {
  /* ── state ── */
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [editing, setEditing]     = useState(false);
  const [toast, setToast]         = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [email, setEmail]         = useState('');
  const [phone, setPhone]         = useState('');
  const [whatsapp, setWhatsapp]   = useState('');
  const [gender, setGender]       = useState('');
  const [ageRange, setAgeRange]   = useState('');
  const [dietType, setDietType]   = useState([]);
  const [allergies, setAllergies] = useState([]);
  const [notif, setNotif]         = useState({ sms: true, emailOffers: false, whatsapp: true });
  const [addresses, setAddresses] = useState([]);
  const [memberSince, setMemberSince] = useState('');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addrForm, setAddrForm] = useState({ fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '' });
  const [addrLoading, setAddrLoading] = useState(false);

  /* ── load ── */
  useEffect(() => {
    fetchProfile().then(r => {
      if (!r.success) return;
      const d = r.data;
      setFirstName(d.firstName || d.name?.split(' ')[0] || '');
      setLastName(d.lastName   || d.name?.split(' ').slice(1).join(' ') || '');
      setEmail(d.email || '');
      setPhone(d.phone || '');
      setWhatsapp(d.whatsapp || '');
      setGender(d.gender || '');
      setAgeRange(d.ageRange || '');
      setDietType(d.dietType || []);
      setAllergies(d.allergies || []);
      setNotif(d.notifications || { sms: true, emailOffers: false, whatsapp: true });
      setAddresses(d.addresses || []);
      setMemberSince(d.createdAt ? new Date(d.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : 'Member');

    }).finally(() => setLoading(false));
  }, []);

  /* ── toggles ── */
  const toggleDiet = useCallback(v => setDietType(p => p.includes(v) ? p.filter(x => x !== v) : [...p, v]), []);
  const toggleAllergy = useCallback(v => setAllergies(p => p.includes(v) ? p.filter(x => x !== v) : [...p, v]), []);

  /* ── save ── */
  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim() || !phone.trim() || !gender || !ageRange) {
      alert("Please fill in all personal information (First Name, Last Name, Phone, Gender, Age Range) to complete your profile.");
      return;
    }
    if (addresses.length === 0) {
      alert("Please add at least one address to complete your profile.");
      return;
    }

    setSaving(true);
    const res = await updateProfile({ firstName, lastName, phone, whatsapp, gender, ageRange, dietType, allergies, notifications: notif });
    setSaving(false);
    if (res.success) { 
      setToast(true); 
      setTimeout(() => setToast(false), 2500); 
      setEditing(false); 
    }
  };

  /* ── address actions ── */
  const handleDeleteAddress = async (id) => {
    const res = await deleteAddress(id);
    if (res.success) setAddresses(res.data);
  };
  const handleSetDefault = async (id) => {
    const res = await setDefaultAddress(id);
    if (res.success) setAddresses(res.data);
  };

  /* ── address handlers ── */
  const handleOpenAddressForm = (addr = null) => {
    if (addr) {
      setEditingAddressId(addr._id);
      setAddrForm({
        fullName: addr.fullName || '', phone: addr.phone || '', addressLine1: addr.addressLine1 || '',
        addressLine2: addr.addressLine2 || '', city: addr.city || '', state: addr.state || '', pincode: addr.pincode || ''
      });
    } else {
      setEditingAddressId(null);
      setAddrForm({ fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '' });
    }
    setShowAddressForm(true);
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!addrForm.addressLine1 || !addrForm.city || !addrForm.state || !addrForm.pincode) {
      alert("Please fill all required fields");
      return;
    }
    setAddrLoading(true);
    const payload = { ...addrForm };
    let res;
    if (editingAddressId) {
      res = await updateAddress(editingAddressId, payload);
    } else {
      res = await addAddress(payload);
    }
    setAddrLoading(false);
    if (res.success) {
      setAddresses(res.data);
      setShowAddressForm(false);
    } else {
      alert(res.message || "Error saving address");
    }
  };

  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, border: '3px solid #3A5C2E', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <ProtectedRoute>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@400;500;600&display=swap');
        @import url('https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css');
        * { box-sizing: border-box; }
        .prof-input:focus { border-color: #3A5C2E !important; box-shadow: 0 0 0 3px rgba(59,31,10,.15); }
        select.prof-input { appearance: none; -webkit-appearance: none; }
        @keyframes slideUp { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes spin { to{transform:rotate(360deg)} }
      `}</style>

      <div style={{ background: '#FAF6EE', minHeight: '100vh', paddingBottom: 60 }}>

        {/* ══ HEADER ══ */}
        <div style={{ background: '#3B1F0A', paddingBottom: 60 }}>
          {/* top bar */}
          <div style={{ maxWidth: 720, margin: '0 auto', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, color: '#fff', fontWeight: 700 }}>
              Rajdhy<span style={{ color: '#B5922A' }}>aan</span>
            </span>
            <button
              onClick={() => setEditing(e => !e)}
              style={{
                padding: '8px 20px', borderRadius: 999, border: '1.5px solid rgba(255,255,255,.6)',
                background: 'rgba(255,255,255,.12)', color: '#fff', fontFamily: 'DM Sans, sans-serif',
                fontSize: 13, cursor: 'pointer', fontWeight: 500,
              }}
            >
              {editing ? 'Cancel' : 'Edit profile'}
            </button>
          </div>

          {/* avatar row */}
          <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px 20px', display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
            <div style={{
              width: 68, height: 68, borderRadius: '50%', background: '#B5922A',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Playfair Display, serif', fontSize: 26, color: '#fff', fontWeight: 700, flexShrink: 0,
            }}>
              {initials(firstName, lastName)}
            </div>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, color: '#fff', margin: '0 0 4px', fontWeight: 700 }}>
                {(firstName + ' ' + lastName).trim() || 'Your Name'}
              </h1>
              <p style={{ color: 'rgba(255,255,255,.7)', fontFamily: 'DM Sans, sans-serif', fontSize: 13, margin: 0 }}>
                Member since {memberSince}
              </p>
            </div>
            <span style={{
              padding: '5px 14px', borderRadius: 999, background: '#B5922A',
              color: '#fff', fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 600,
            }}>🌿 Organic Lover</span>
          </div>
        </div>

        <div style={{ maxWidth: 720, margin: '-32px auto 0', padding: '0 24px', position: 'relative' }}>

          {/* ══ PERSONAL INFO ══ */}
          <SectionCard icon={<i className="ti ti-user" />} title="Personal Information">
            {/* first + last */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={{ display: 'block', fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#6B4A2A', marginBottom: 6, fontWeight: 500 }}>First Name</label>
                <input className="prof-input" style={inputStyle} value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Priya" />
              </div>
              <div>
                <label style={{ display: 'block', fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#6B4A2A', marginBottom: 6, fontWeight: 500 }}>Last Name</label>
                <input className="prof-input" style={inputStyle} value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Sharma" />
              </div>
            </div>

            {/* email */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#6B4A2A', marginBottom: 6, fontWeight: 500 }}>Email</label>
              <input className="prof-input" style={{ ...inputStyle, background: '#EDE8E0', cursor: 'not-allowed' }} value={email} readOnly />
            </div>

            {/* phone + whatsapp */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={{ display: 'block', fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#6B4A2A', marginBottom: 6, fontWeight: 500 }}>Phone</label>
                <input className="prof-input" style={inputStyle} value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 98765 43210" />
              </div>
              <div>
                <label style={{ display: 'block', fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#6B4A2A', marginBottom: 6, fontWeight: 500 }}>
                  WhatsApp <span style={{ color: '#8C7B6B', fontWeight: 400 }}>(optional)</span>
                </label>
                <input className="prof-input" style={inputStyle} value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="Same as phone?" />
              </div>
            </div>

            {/* gender + age */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#6B4A2A', marginBottom: 6, fontWeight: 500 }}>Gender</label>
                <select className="prof-input" style={{ ...inputStyle, cursor: 'pointer' }} value={gender} onChange={e => setGender(e.target.value)}>
                  <option value="">Select</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#6B4A2A', marginBottom: 6, fontWeight: 500 }}>Age Range</label>
                <select className="prof-input" style={{ ...inputStyle, cursor: 'pointer' }} value={ageRange} onChange={e => setAgeRange(e.target.value)}>
                  <option value="">Select</option>
                  {['18-24','25-34','35-44','45-54','55+'].map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
            </div>
          </SectionCard>

          {/* ══ ADDRESSES ══ */}
          <SectionCard
            icon={<i className="ti ti-map-pin" />}
            title="Saved Addresses"
            action={
              editing ? (
                <button onClick={() => handleOpenAddressForm()} style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#3B1F0A', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                  + Add new
                </button>
              ) : null
            }
          >
            {addresses.length === 0 && (
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#8C7B6B', textAlign: 'center', padding: '20px 0' }}>
                No addresses saved yet.
              </p>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {addresses.map(addr => (
                <div key={addr._id} style={{
                  background: '#FAF6EE', borderRadius: 12, padding: '16px 18px',
                  border: addr.isDefault ? '2px solid #3A5C2E' : '1.5px solid #E0D8CE',
                  position: 'relative',
                }}>
                  {addr.isDefault && (
                    <span style={{
                      position: 'absolute', top: -10, left: 16,
                      background: '#3B1F0A', color: '#fff', fontSize: 11, fontFamily: 'DM Sans, sans-serif',
                      fontWeight: 600, padding: '2px 10px', borderRadius: 999,
                    }}>Default</span>
                  )}
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#6B4A2A', margin: '0 0 12px', lineHeight: 1.5 }}>
                    {[addr.addressLine1, addr.addressLine2, addr.city, addr.state, addr.pincode].filter(Boolean).join(', ')}
                  </p>
                  {editing && (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {[
                        { label: 'Edit', color: '#3B1F0A', border: '1.5px solid #3B1F0A', bg: 'transparent' },
                        !addr.isDefault && { label: 'Set as default', color: '#6B4A2A', border: '1.5px solid #D4B896', bg: 'transparent' },
                        { label: 'Delete', color: '#C04040', border: '1.5px solid #C04040', bg: 'transparent' },
                      ].filter(Boolean).map(btn => (
                        <button
                          key={btn.label}
                          onClick={() => btn.label === 'Edit' ? handleOpenAddressForm(addr) : btn.label === 'Delete' ? handleDeleteAddress(addr._id) : btn.label === 'Set as default' ? handleSetDefault(addr._id) : null}
                          style={{
                            padding: '5px 14px', borderRadius: 6, fontSize: 12, fontFamily: 'DM Sans, sans-serif',
                            cursor: 'pointer', border: btn.border, background: btn.bg, color: btn.color, fontWeight: 500,
                          }}
                        >{btn.label}</button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {editing && (
              showAddressForm ? (
                <form onSubmit={handleSaveAddress} style={{ background: '#FAF6EE', padding: '20px', borderRadius: 12, marginTop: 16 }}>
                  <h3 style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 15, color: '#3B1F0A', marginBottom: 16, fontWeight: 600 }}>
                    {editingAddressId ? 'Edit Address' : 'Add New Address'}
                  </h3>
                  <div style={{ marginBottom: 12 }}>
                    <input required className="prof-input" style={inputStyle} placeholder="Address Line 1" value={addrForm.addressLine1} onChange={e => setAddrForm({...addrForm, addressLine1: e.target.value})} />
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <input className="prof-input" style={inputStyle} placeholder="Address Line 2 (Optional)" value={addrForm.addressLine2} onChange={e => setAddrForm({...addrForm, addressLine2: e.target.value})} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
                    <input required className="prof-input" style={inputStyle} placeholder="City" value={addrForm.city} onChange={e => setAddrForm({...addrForm, city: e.target.value})} />
                    <input required className="prof-input" style={inputStyle} placeholder="State" value={addrForm.state} onChange={e => setAddrForm({...addrForm, state: e.target.value})} />
                    <input required className="prof-input" style={inputStyle} placeholder="Pincode" value={addrForm.pincode} onChange={e => setAddrForm({...addrForm, pincode: e.target.value})} />
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button type="submit" disabled={addrLoading} style={{ padding: '10px 20px', borderRadius: 8, background: '#3B1F0A', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>
                      {addrLoading ? 'Saving...' : 'Save Address'}
                    </button>
                    <button type="button" onClick={() => setShowAddressForm(false)} style={{ padding: '10px 20px', borderRadius: 8, background: 'transparent', color: '#6B4A2A', border: '1.5px solid #D4B896', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <button 
                  onClick={() => handleOpenAddressForm()}
                  style={{
                    width: '100%', marginTop: 12, padding: 14, borderRadius: 12,
                    border: '1.5px dashed #C9B49A', background: 'transparent',
                    fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#6B4A2A',
                    cursor: 'pointer', fontWeight: 500,
                  }}>
                  + Add another address
                </button>
              )
            )}
          </SectionCard>

          {/* ══ FOOD PREFERENCES ══ */}
          <SectionCard icon={<i className="ti ti-leaf" />} title="Food Preferences">
            <div style={{ marginBottom: 18 }}>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#6B4A2A', fontWeight: 600, marginBottom: 10 }}>Diet Type</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {['vegetarian','vegan','jain','non-veg','no_preference'].map(v => (
                  <Pill key={v} label={v === 'no_preference' ? 'No preference' : v.charAt(0).toUpperCase() + v.slice(1)} active={dietType.includes(v)} onClick={() => toggleDiet(v)} />
                ))}
              </div>
            </div>
            <div>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#6B4A2A', fontWeight: 600, marginBottom: 10 }}>Avoid / Allergies</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {[['gluten','Gluten'],['nuts','Nuts'],['dairy','Dairy'],['soy','Soy'],['sugar_free','Sugar-free only']].map(([v, label]) => (
                  <Pill key={v} label={label} active={allergies.includes(v)} onClick={() => toggleAllergy(v)} />
                ))}
              </div>
            </div>
          </SectionCard>

          {/* ══ NOTIFICATIONS ══ */}
          <SectionCard icon={<i className="ti ti-bell" />} title="Notifications">
            {[
              { key: 'sms',         label: 'Order updates',           sub: 'via SMS' },
              { key: 'emailOffers', label: 'Offers & new products',   sub: 'via Email' },
              { key: 'whatsapp',    label: 'WhatsApp updates',        sub: 'via WhatsApp' },
            ].map(row => (
              <div key={row.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #EDE8E0' }}>
                <div>
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#3B2A1A', margin: 0, fontWeight: 500 }}>{row.label}</p>
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#8C7B6B', margin: '2px 0 0' }}>{row.sub}</p>
                </div>
                <Toggle on={notif[row.key]} onToggle={() => setNotif(n => ({ ...n, [row.key]: !n[row.key] }))} />
              </div>
            ))}
          </SectionCard>

          {/* ══ ACCOUNT ══ */}
          <SectionCard icon={<i className="ti ti-settings" />} title="Account">
            {[
              { label: 'Language', value: 'English', action: null },
              { label: 'Password', value: '••••••••', action: <button style={{ background:'none',border:'none',color:'#3B1F0A',fontFamily:'DM Sans,sans-serif',fontSize:13,fontWeight:600,cursor:'pointer' }}>Change</button> },
              { label: 'Delete account', value: null, action: <button style={{ background:'none',border:'none',color:'#C04040',fontFamily:'DM Sans,sans-serif',fontSize:13,fontWeight:600,cursor:'pointer' }}>Request</button>, labelStyle: { color: '#C04040' } },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #EDE8E0' }}>
                <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, ...(row.labelStyle || { color: '#3B2A1A' }), fontWeight: 500 }}>{row.label}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {row.value && <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#8C7B6B' }}>{row.value}</span>}
                  {row.action}
                </div>
              </div>
            ))}
          </SectionCard>

          {/* ══ SAVE BUTTON ══ */}
          {editing && (
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                width: '100%', padding: '16px', borderRadius: 12, border: 'none',
                background: saving ? '#8C7B6B' : '#3B1F0A', color: '#fff',
                fontFamily: 'Playfair Display, serif', fontSize: 17, fontWeight: 700,
                cursor: saving ? 'not-allowed' : 'pointer', letterSpacing: '.3px',
                transition: 'background .2s', marginBottom: 16,
              }}
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          )}

          {/* ══ FOOTER NOTE ══ */}
          <p style={{ textAlign: 'center', fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#8C7B6B', marginBottom: 8 }}>
            Your data is protected under DPDPA 2023 · <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>Privacy policy</span>
          </p>
        </div>
      </div>

      {/* ══ TOAST ══ */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
          background: '#3B1F0A', color: '#fff', padding: '12px 28px', borderRadius: 999,
          fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 600,
          animation: 'slideUp .3s ease', zIndex: 9999, whiteSpace: 'nowrap',
          boxShadow: '0 4px 24px rgba(59,31,10,.35)',
        }}>
          ✓ Profile saved successfully!
        </div>
      )}
    </ProtectedRoute>
  );
}
