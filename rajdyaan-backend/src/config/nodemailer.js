// ---------------------------------------------------------------------------
// Nodemailer Transporter Config — Gmail SMTP (alternative to Resend)
//
// To use Gmail SMTP:
//   1. Enable 2-Factor Authentication on your Google Account
//   2. Go to: https://myaccount.google.com/apppasswords
//   3. Generate an "App Password" for "Mail"
//   4. Set SMTP_EMAIL and SMTP_PASSWORD in your .env file
//
// This module exports a configured nodemailer transporter and a helper
// function to send HTML emails. Your project currently uses Resend — this
// file is provided as a drop-in alternative if you want to switch.
// ---------------------------------------------------------------------------
import nodemailer from 'nodemailer';

/**
 * Gmail SMTP transporter.
 * Uses environment variables:
 *   SMTP_HOST (default: smtp.gmail.com)
 *   SMTP_PORT (default: 587)
 *   SMTP_EMAIL — your Gmail address
 *   SMTP_PASSWORD — Gmail App Password (NOT your login password)
 */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: false, // true for 465, false for 587 (STARTTLS)
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
  // Connection pool for better performance with multiple emails
  pool: true,
  maxConnections: 3,
  maxMessages: 100,
});

/**
 * Verify the SMTP connection on startup (optional — call from server.js).
 */
export const verifySmtpConnection = async () => {
  try {
    await transporter.verify();
    console.log('✅ SMTP connection verified — Gmail ready');
  } catch (err) {
    console.warn('⚠️  SMTP connection failed:', err.message);
  }
};

/**
 * Send an HTML email via Gmail SMTP.
 *
 * @param {Object} opts
 * @param {string} opts.to       — recipient email
 * @param {string} opts.subject  — email subject line
 * @param {string} opts.html     — rendered HTML content
 * @param {string} [opts.from]   — sender (defaults to SMTP_EMAIL)
 */
export const sendEmailViaSMTP = async ({ to, subject, html, from }) => {
  const mailOptions = {
    from: from || `"Rajdhyaan" <${process.env.SMTP_EMAIL}>`,
    to,
    subject,
    html,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`📧 Email sent: ${info.messageId}`);
  return info;
};

export default transporter;
