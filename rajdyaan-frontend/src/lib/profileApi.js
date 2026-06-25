// ---------------------------------------------------------------------------
// Profile API helpers — thin wrappers around fetch
// Credentials: include — relies on the HttpOnly JWT cookie set by /auth/login
// ---------------------------------------------------------------------------

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

/**
 * Fetch the current user's profile
 * @returns {Promise<{success: boolean, data: object}>}
 */
export async function fetchProfile() {
  const res = await fetch(`${BASE}/profile`, {
    method: 'GET',
    credentials: 'include',
  });
  return res.json();
}

/**
 * Update profile fields
 * @param {object} payload — partial user fields
 */
export async function updateProfile(payload) {
  const res = await fetch(`${BASE}/profile`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

/**
 * Add a new address
 * @param {object} address
 */
export async function addAddress(address) {
  const res = await fetch(`${BASE}/profile/address`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(address),
  });
  return res.json();
}

/**
 * Update an existing address
 * @param {string} addressId
 * @param {object} address
 */
export async function updateAddress(addressId, address) {
  const res = await fetch(`${BASE}/profile/address/${addressId}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(address),
  });
  return res.json();
}

/**
 * Delete an address
 * @param {string} addressId
 */
export async function deleteAddress(addressId) {
  const res = await fetch(`${BASE}/profile/address/${addressId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  return res.json();
}

/**
 * Set an address as default
 * @param {string} addressId
 */
export async function setDefaultAddress(addressId) {
  const res = await fetch(`${BASE}/profile/address/${addressId}/default`, {
    method: 'PATCH',
    credentials: 'include',
  });
  return res.json();
}
