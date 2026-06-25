// ---------------------------------------------------------------------------
// User Profile Controller
// ---------------------------------------------------------------------------
import User from '../../models/User.js';
import ApiError from '../../utils/ApiError.js';

// Allowed fields for profile update (allowlist — prevents mass-assignment)
const PROFILE_FIELDS = [
  'firstName', 'lastName', 'name', 'phone', 'whatsapp',
  'gender', 'ageRange', 'dietType', 'allergies', 'notifications',
];

// ---------------------------------------------------------------------------
// GET /api/v1/profile
// ---------------------------------------------------------------------------
export const getProfile = async (req, res) => {
  const user = await User.findById(req.user.id)
    .select('-passwordHash -googleId -__v')
    .populate('wishlist', 'name price images slug');

  if (!user) throw new ApiError(404, 'User not found');

  res.json({ success: true, data: user });
};

// ---------------------------------------------------------------------------
// PUT /api/v1/profile
// ---------------------------------------------------------------------------
export const updateProfile = async (req, res) => {
  const updates = {};
  PROFILE_FIELDS.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  // Keep the legacy `name` in sync with firstName + lastName if provided
  if (updates.firstName || updates.lastName) {
    const user = await User.findById(req.user.id).select('firstName lastName');
    const first = updates.firstName ?? user.firstName ?? '';
    const last  = updates.lastName  ?? user.lastName  ?? '';
    updates.name = `${first} ${last}`.trim() || user.name;
  }

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { $set: updates },
    { new: true, runValidators: true }
  ).select('-passwordHash -googleId -__v');

  if (!user) throw new ApiError(404, 'User not found');

  res.json({ success: true, data: user });
};

// ---------------------------------------------------------------------------
// POST /api/v1/profile/address
// ---------------------------------------------------------------------------
export const addAddress = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) throw new ApiError(404, 'User not found');

  if (user.addresses.length >= 5)
    throw new ApiError(400, 'Maximum 5 addresses allowed');

  // First address is auto-default
  if (user.addresses.length === 0) req.body.isDefault = true;

  user.addresses.push(req.body);
  await user.save();

  res.status(201).json({ success: true, data: user.addresses });
};

// ---------------------------------------------------------------------------
// PUT /api/v1/profile/address/:addressId
// ---------------------------------------------------------------------------
export const updateAddress = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) throw new ApiError(404, 'User not found');

  const addr = user.addresses.id(req.params.addressId);
  if (!addr) throw new ApiError(404, 'Address not found');

  Object.assign(addr, req.body);
  await user.save();

  res.json({ success: true, data: user.addresses });
};

// ---------------------------------------------------------------------------
// DELETE /api/v1/profile/address/:addressId
// ---------------------------------------------------------------------------
export const deleteAddress = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) throw new ApiError(404, 'User not found');

  const addr = user.addresses.id(req.params.addressId);
  if (!addr) throw new ApiError(404, 'Address not found');

  const wasDefault = addr.isDefault;
  addr.deleteOne();

  // Auto-assign default to first remaining address
  if (wasDefault && user.addresses.length > 0) {
    user.addresses[0].isDefault = true;
  }

  await user.save();

  res.json({ success: true, data: user.addresses });
};

// ---------------------------------------------------------------------------
// PATCH /api/v1/profile/address/:addressId/default
// ---------------------------------------------------------------------------
export const setDefaultAddress = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) throw new ApiError(404, 'User not found');

  user.addresses.forEach((a) => { a.isDefault = false; });

  const addr = user.addresses.id(req.params.addressId);
  if (!addr) throw new ApiError(404, 'Address not found');

  addr.isDefault = true;
  await user.save();

  res.json({ success: true, data: user.addresses });
};
