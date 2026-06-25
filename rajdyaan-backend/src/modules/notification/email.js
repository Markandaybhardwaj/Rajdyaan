import { Resend } from 'resend';
import { renderAsync } from '@react-email/render';
import React from 'react';
import OrderConfirmation from '../../emails/OrderConfirmation.jsx';
import DispatchNotification from '../../emails/DispatchNotification.jsx';
import OTPEmail from '../../emails/OTPEmail.jsx';
import PasswordResetOTP from '../../emails/PasswordResetOTP.jsx';

// ---------------------------------------------------------------------------
// Resend — used for order confirmations & dispatch notifications
// ---------------------------------------------------------------------------
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const senderEmail = process.env.RESEND_FROM_EMAIL || 'Rajdhyaan <onboarding@resend.dev>';

export const sendOrderConfirmation = async (order, user) => {
    try {
        if (!resend) {
            console.warn('RESEND_API_KEY not found. Skipping order confirmation email.');
            return;
        }
        const html = await renderAsync(React.createElement(OrderConfirmation, { order, user }));
        await resend.emails.send({
            from: senderEmail,
            to: user.email,
            subject: `Order Confirmation - ${order._id}`,
            html,
        });
    } catch (error) {
        console.error('Failed to send order confirmation email:', error);
    }
};

export const sendDispatchNotification = async (order, user) => {
    try {
        if (!resend) {
            console.warn('RESEND_API_KEY not found. Skipping dispatch notification email.');
            return;
        }
        const html = await renderAsync(React.createElement(DispatchNotification, { order, user }));
        await resend.emails.send({
            from: senderEmail,
            to: user.email,
            subject: `Order Dispatched - ${order._id}`,
            html,
        });
    } catch (error) {
        console.error('Failed to send dispatch notification email:', error);
    }
};

export const sendOTPEmail = async (email, otp) => {
    try {
        if (!resend) {
            console.warn('RESEND_API_KEY not found. Skipping OTP email.');
            return;
        }
        const html = await renderAsync(React.createElement(OTPEmail, { otp }));
        await resend.emails.send({
            from: senderEmail,
            to: email,
            subject: 'Your OTP Code - RajDyaan',
            html,
        });
    } catch (error) {
        console.error('Failed to send OTP email:', error);
    }
};

// ---------------------------------------------------------------------------
// Resend — also used for password-reset OTP emails
// ---------------------------------------------------------------------------

/**
 * Sends a branded password-reset OTP email via Resend.
 *
 * Flow:
 *   1. Renders the PasswordResetOTP React Email template to HTML
 *   2. Sends via Resend API (same provider as order/dispatch emails)
 *
 * @param {string} email    — recipient email
 * @param {string} otp      — plain-text OTP (only sent in email, never in API response)
 * @param {string} [userName] — user's name for personalisation
 */
export const sendPasswordResetOTP = async (email, otp, userName) => {
    try {
        if (!resend) {
            console.warn('RESEND_API_KEY not found. Skipping password reset OTP email.');
            throw new Error('Email service not configured');
        }

        // 1. Render the branded email template to raw HTML
        const html = await renderAsync(
            React.createElement(PasswordResetOTP, { otp, userName })
        );

        // 2. Send via Resend API
        const result = await resend.emails.send({
            from: senderEmail,
            to: email,
            subject: '🔐 Reset Your Password - Rajdhyaan',
            html,
        });

        console.log(`✅ Password reset OTP sent to ${email}`, result);
    } catch (error) {
        console.error('Failed to send password reset OTP email:', error);
        throw error; // Re-throw so the service layer can handle it
    }
};

