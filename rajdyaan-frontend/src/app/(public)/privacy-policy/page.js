// ---------------------------------------------------------------------------
// Privacy Policy Page — Rajdhyaan
// ---------------------------------------------------------------------------
// Route: /privacy-policy
// Clean, professional privacy policy with collapsible sections,
// subtle gold accents, and mobile-responsive layout.
// ---------------------------------------------------------------------------
'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './privacy.module.css';

// ---------------------------------------------------------------------------
// Section Data
// ---------------------------------------------------------------------------
const SECTIONS = [
  {
    id: 'introduction',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: 'Introduction',
    content: `At Rajdhyaan (operated by Shree Ganesh Trader), your privacy is of utmost importance to us. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, place orders, or interact with our services.

By using our website and services, you consent to the data practices described in this policy. We are committed to ensuring that your personal information is protected in accordance with applicable Indian data protection laws.`,
  },
  {
    id: 'info-collect',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: 'Information We Collect',
    content: `We collect information when you:

• Place an order on our website
• Submit a B2B wholesale enquiry
• Subscribe to our newsletter
• Fill out our contact form
• Create an account

The types of personal information we may collect include:

• **Full Name** — to process orders and communicate with you
• **Email Address** — for order updates, newsletters, and support
• **Phone Number** — for delivery coordination and support
• **Business Name** — for B2B enquiries and wholesale partnerships
• **Shipping & Billing Address** — for delivery and invoicing
• **Payment Information** — processed securely through our payment gateway partners (we do not store card details)`,
  },
  {
    id: 'how-use',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <path d="M8 21h8" />
        <path d="M12 17v4" />
      </svg>
    ),
    title: 'How We Use Your Information',
    content: `We use the information we collect for the following purposes:

• **Order Processing** — to fulfill, ship, and track your orders efficiently
• **Customer Support** — to respond to your queries, complaints, and requests
• **Business Communication** — to send you order updates, delivery notifications, and account information
• **Service Improvement** — to understand customer preferences and improve our products and website experience
• **Marketing** — to send promotional offers and newsletters (only with your consent, and you can opt-out anytime)
• **Fraud Prevention** — to detect and prevent fraudulent transactions and unauthorized access
• **Legal Compliance** — to comply with applicable laws, regulations, and legal processes`,
  },
  {
    id: 'sharing',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <path d="M8.59 13.51l6.83 3.98" />
        <path d="M15.41 6.51l-6.82 3.98" />
      </svg>
    ),
    title: 'Sharing of Information',
    content: `We do not sell, trade, or rent your personal information to third parties. However, we may share your data with:

• **Payment Gateways** — such as Razorpay, Paytm, or UPI providers, to securely process your transactions
• **Shipping & Logistics Partners** — to deliver your orders on time (e.g., Delhivery, India Post, DTDC)
• **Service Providers** — trusted third-party services that assist us in operating our website, analytics, and customer support
• **Legal Authorities** — when required by law, court orders, or to protect our rights and safety

All third-party partners are bound by strict confidentiality agreements and are only permitted to use your data for the specific services they provide to us.`,
  },
  {
    id: 'security',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    title: 'Data Security',
    content: `We implement industry-standard security measures to protect your personal information:

• **SSL Encryption** — All data transmitted between your browser and our servers is encrypted using TLS/SSL
• **Secure Payment Processing** — Payment information is handled by PCI-DSS compliant gateways; we never store your card details
• **Access Controls** — Only authorized personnel have access to your personal data
• **Regular Audits** — We periodically review our data collection, storage, and processing practices

While we strive to protect your personal information, no method of transmission over the internet is 100% secure. We encourage you to take precautions, such as using strong passwords and keeping your login credentials confidential.`,
  },
  {
    id: 'cookies',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
        <path d="M2 12h20" />
      </svg>
    ),
    title: 'Cookies & Tracking',
    content: `Our website uses cookies and similar tracking technologies to enhance your browsing experience:

• **Essential Cookies** — Required for the website to function properly (e.g., shopping cart, login sessions)
• **Analytics Cookies** — Help us understand how visitors interact with our website to improve performance
• **Preference Cookies** — Remember your settings and preferences for a personalized experience

**Managing Cookies:** You can control and disable cookies through your browser settings. Please note that disabling certain cookies may affect the functionality of our website. Most browsers allow you to:
— View what cookies are stored
— Delete individual or all cookies
— Block cookies from specific or all sites`,
  },
  {
    id: 'rights',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    title: 'Your Rights',
    content: `You have the following rights regarding your personal data:

• **Right to Access** — You can request a copy of the personal data we hold about you
• **Right to Update** — You can update or correct your personal information at any time through your account settings or by contacting us
• **Right to Delete** — You can request the deletion of your personal data, subject to legal retention requirements
• **Right to Opt-Out** — You can unsubscribe from marketing emails at any time by clicking the "Unsubscribe" link in our emails or by contacting us directly

To exercise any of these rights, please contact us at rajdhyaan5@gmail.com. We will respond to your request within 30 business days.`,
  },
  {
    id: 'updates',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    title: 'Policy Updates',
    content: `We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. When we make changes:

• The "Effective Date" at the top of this page will be updated
• Significant changes will be communicated via email or a prominent notice on our website
• Your continued use of our website after any changes constitutes your acceptance of the updated policy

We encourage you to review this Privacy Policy periodically to stay informed about how we are protecting your data.`,
  },
  {
    id: 'contact',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    title: 'Contact Information',
    content: `If you have any questions, concerns, or requests regarding this Privacy Policy or your personal data, please contact us:

• **Brand:** Rajdhyaan™ by Shree Ganesh Trader
• **Email:** rajdhyaan5@gmail.com
• **Phone:** +91 70604 43349
• **Address:** Village Faijpur, Noorpur, District Bijnor, 246734, Uttar Pradesh, India

We are committed to resolving any privacy concerns promptly and transparently.`,
  },
];

// ---------------------------------------------------------------------------
// Collapsible Section Component
// ---------------------------------------------------------------------------
function PolicySection({ section, isOpen, onToggle }) {
  return (
    <div className={styles.section} id={section.id}>
      <button
        className={`${styles.sectionHeader} ${isOpen ? styles.sectionHeaderOpen : ''}`}
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <div className={styles.sectionHeaderLeft}>
          <span className={styles.sectionIcon}>{section.icon}</span>
          <h2 className={styles.sectionTitle}>{section.title}</h2>
        </div>
        <svg
          className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <div className={`${styles.sectionBody} ${isOpen ? styles.sectionBodyOpen : ''}`}>
        <div className={styles.sectionContent}>
          {section.content.split('\n').map((line, i) => {
            if (!line.trim()) return <br key={i} />;
            // Bold text
            const formatted = line.replace(
              /\*\*(.*?)\*\*/g,
              '<strong>$1</strong>'
            );
            return (
              <p
                key={i}
                className={styles.contentLine}
                dangerouslySetInnerHTML={{ __html: formatted }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Privacy Policy Page
// ---------------------------------------------------------------------------
export default function PrivacyPolicyPage() {
  const [openSections, setOpenSections] = useState(
    SECTIONS.reduce((acc, s) => ({ ...acc, [s.id]: true }), {})
  );

  const toggleSection = (id) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    setOpenSections(SECTIONS.reduce((acc, s) => ({ ...acc, [s.id]: true }), {}));
  };

  const collapseAll = () => {
    setOpenSections(SECTIONS.reduce((acc, s) => ({ ...acc, [s.id]: false }), {}));
  };

  return (
    <div className={styles.pageWrapper}>
      {/* ===== HERO ===== */}
      <section className={styles.hero}>
        <div className={styles.heroGrain} />
        <div className={styles.heroContent}>
          <div className={styles.heroShield}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          </div>
          <h1 className={styles.heroTitle}>Privacy Policy</h1>
          <p className={styles.heroSubtitle}>
            Your privacy and data security matter to us
          </p>
          <div className={styles.heroMeta}>
            <span className={styles.heroBadge}>
              Effective Date: January 1, 2026
            </span>
            <span className={styles.heroBadge}>
              Last Updated: May 10, 2026
            </span>
          </div>
        </div>
      </section>

      {/* ===== CONTROLS ===== */}
      <div className={styles.controls}>
        <div className={styles.controlsInner}>
          <p className={styles.controlsLabel}>
            {Object.values(openSections).filter(Boolean).length} of {SECTIONS.length} sections expanded
          </p>
          <div className={styles.controlsBtns}>
            <button onClick={expandAll} className={styles.controlBtn}>
              Expand All
            </button>
            <button onClick={collapseAll} className={styles.controlBtn}>
              Collapse All
            </button>
          </div>
        </div>
      </div>

      {/* ===== CONTENT ===== */}
      <main className={styles.main}>
        <div className={styles.container}>
          {SECTIONS.map((section) => (
            <PolicySection
              key={section.id}
              section={section}
              isOpen={openSections[section.id]}
              onToggle={() => toggleSection(section.id)}
            />
          ))}
        </div>
      </main>

      {/* ===== BOTTOM LINKS ===== */}
      <section className={styles.bottomLinks}>
        <div className={styles.bottomLinksInner}>
          <h3 className={styles.bottomLinksTitle}>Related Pages</h3>
          <div className={styles.bottomLinksGrid}>
            <Link href="/contact" className={styles.bottomLink}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span>Contact Us</span>
            </Link>
            <Link href="/products" className={styles.bottomLink}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              <span>Shop Products</span>
            </Link>
            <Link href="/b2b" className={styles.bottomLink}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
              <span>B2B Wholesale</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
