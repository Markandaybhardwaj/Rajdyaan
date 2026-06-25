// ---------------------------------------------------------------------------
// B2B Controller — handles enquiry submissions and admin retrieval
// ---------------------------------------------------------------------------
import B2BLead from '../../models/B2BLead.js';
import ApiError from '../../utils/ApiError.js';

/**
 * POST /api/v1/b2b/enquiry
 * Public endpoint — anyone can submit a B2B enquiry.
 */
export const submitEnquiry = async (req, res, next) => {
  try {
    const { name, businessName, phone, email, product, quantity, message } = req.body;

    // Basic server-side validation
    if (!name || !businessName || !phone || !email || !product || !quantity) {
      throw new ApiError(400, 'All required fields must be provided');
    }

    // Validate phone — digits only, 10-15 chars
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      throw new ApiError(400, 'Please enter a valid phone number');
    }

    const lead = await B2BLead.create({
      name: name.trim(),
      businessName: businessName.trim(),
      phone: cleanPhone,
      email: email.trim().toLowerCase(),
      product,
      quantity: quantity.trim(),
      message: message?.trim() || '',
    });

    res.status(201).json({
      success: true,
      message: 'Your enquiry has been submitted. We will contact you soon.',
      data: {
        id: lead._id,
        name: lead.name,
        businessName: lead.businessName,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/b2b/leads
 * Admin-only — retrieves all B2B leads.
 */
export const getLeads = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const leads = await B2BLead.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    const total = await B2BLead.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        leads,
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/v1/b2b/leads/:id/status
 * Admin-only — update lead status.
 */
export const updateLeadStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['new', 'contacted', 'in-progress', 'converted', 'closed'];

    if (!validStatuses.includes(status)) {
      throw new ApiError(400, `Status must be one of: ${validStatuses.join(', ')}`);
    }

    const lead = await B2BLead.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!lead) {
      throw new ApiError(404, 'Lead not found');
    }

    res.status(200).json({
      success: true,
      message: `Lead status updated to "${status}"`,
      data: lead,
    });
  } catch (err) {
    next(err);
  }
};
