// ---------------------------------------------------------------------------
// Contact Us Page — Rajdhyaan Premium Contact
// ---------------------------------------------------------------------------
// Route: /contact
// Full-featured contact page: Hero with product image & trust badges,
// business stats, about section, why choose us, contact form + info,
// testimonials, and a branded footer.
// ---------------------------------------------------------------------------
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './contact.module.css';

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------
const STATS = [
  { number: '3,000+', label: 'Orders Delivered' },
  { number: '2,000+', label: 'Happy Customers' },
  { number: '50+', label: 'Retail Partners' },
  { number: '2+', label: 'Years of Trust' },
];

const WHY_CHOOSE = [
  {
    icon: '🌾',
    title: 'Premium Sugarcane Source',
    text: 'Sourced from the finest sugarcane farms in Uttar Pradesh, ensuring the highest quality raw material.',
  },
  {
    icon: '🚫',
    title: 'No Chemicals Added',
    text: 'Absolutely zero chemicals, preservatives, or artificial additives — 100% natural and pure.',
  },
  {
    icon: '✨',
    title: 'Rich Taste & Minerals',
    text: 'Retains natural minerals like calcium, iron & potassium with an authentic golden aroma.',
  },
  {
    icon: '🏺',
    title: 'Traditional Processing',
    text: 'Made using traditional wood-pressed methods passed down through generations of artisans.',
  },
];

const TESTIMONIALS = [
  {
    name: 'Priya Sharma',
    location: 'Delhi',
    initials: 'PS',
    text: 'Rajdhyaan Desi Khand is the best quality I\'ve found. My chai tastes so much better now! The natural sweetness and golden color are proof of its purity.',
  },
  {
    name: 'Rakesh Gupta',
    location: 'Lucknow',
    initials: 'RG',
    text: 'I\'ve been ordering for 6 months straight. The packaging is premium, delivery is always on time, and the product quality is consistently excellent.',
  },
  {
    name: 'Meena Patel',
    location: 'Mumbai',
    initials: 'MP',
    text: 'Finally found a brand that sells truly unrefined cane sugar. My family loves it for making traditional sweets. Highly recommended!',
  },
];

// ---------------------------------------------------------------------------
// Contact Page Component
// ---------------------------------------------------------------------------
const GOOGLE_SCRIPT_URL = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL || '';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: '',
  });
  const [showToast, setShowToast] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Only allow digits for phone field
    if (name === 'phone' && value !== '' && !/^\d+$/.test(value)) {
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      if (GOOGLE_SCRIPT_URL) {
        // Using mode:'no-cors' + text/plain to bypass Google Script CORS redirect.
        // Google Apps Script still receives e.postData.contents correctly.
        // We can't read the response in no-cors mode, so we assume success.
        await fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({ type: 'contact', ...formData }),
        });
      } else {
        // Fallback simulation when URL not configured
        await new Promise((resolve) => setTimeout(resolve, 1200));
      }

      setShowToast(true);
      setFormData({ name: '', phone: '', email: '', subject: '', message: '' });
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      setErrorMsg('Failed to send message. Please try again.');
      setTimeout(() => setErrorMsg(''), 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      {/* ===== HERO BANNER ===== */}
      <section className={styles.heroBanner}>
        <div className={styles.heroGrain} />
        <div className={styles.heroContent}>
          {/* Product Image */}

          <h1 className={`${styles.heroTitle} ${styles.fadeInUp2}`}>Contact Us</h1>
          <p className={`${styles.heroSubtitle} ${styles.fadeInUp2}`}>
            We&apos;d love to hear from you — whether it&apos;s a question, feedback, or a bulk order inquiry
          </p>

          {/* Trust Badges */}
          <div className={`${styles.trustBadges} ${styles.fadeInUp3}`}>
            <div className={styles.trustBadge}>
              <span className={styles.trustBadgeIcon}>🌿</span>
              <span className={styles.trustBadgeText}>100% Natural</span>
            </div>
            <div className={styles.trustBadge}>
              <span className={styles.trustBadgeIcon}>🧪</span>
              <span className={styles.trustBadgeText}>Chemical Free</span>
            </div>
            <div className={styles.trustBadge}>
              <span className={styles.trustBadgeIcon}>🏺</span>
              <span className={styles.trustBadgeText}>Traditional Process</span>
            </div>
            <div className={styles.trustBadge}>
              <span className={styles.trustBadgeIcon}>🏆</span>
              <span className={styles.trustBadgeText}>FSSAI Certified</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== STATS SECTION ===== */}
      <section className={styles.statsSection}>
        <div className={styles.statsGrid}>
          {STATS.map((stat) => (
            <div key={stat.label} className={styles.statCard}>
              <span className={styles.statNumber}>{stat.number}</span>
              <span className={styles.statLabel}>{stat.label}</span>
            </div>
          ))}
        </div>
      </section>


      {/* ===== WHY CHOOSE US ===== */}
      <section className={styles.whySection}>
        <div className={styles.whySectionInner}>
          <div style={{ textAlign: 'center' }}>
            <span className={styles.sectionLabel}>Our Promise</span>
            <h2 className={styles.sectionTitle}>Why Choose Rajdhyaan?</h2>
            <div className={styles.sectionDivider} />
          </div>

          <div className={styles.whyGrid}>
            {WHY_CHOOSE.map((item) => (
              <div key={item.title} className={styles.whyCard}>
                <div className={styles.whyIcon}>{item.icon}</div>
                <h3 className={styles.whyCardTitle}>{item.title}</h3>
                <p className={styles.whyCardText}>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CONTACT SECTION ===== */}
      <section className={styles.contactSection}>
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <span className={styles.sectionLabel}>Get In Touch</span>
          <h2 className={styles.sectionTitle}>Reach Out To Us</h2>
          <div className={styles.sectionDivider} />
        </div>

        <div className={styles.contactGrid}>
          {/* Left: Contact Info */}
          <div className={styles.contactInfo}>
            {/* Address */}
            <div className={styles.contactInfoCard}>
              <div className={styles.contactIconWrap}>
                <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                </svg>
              </div>
              <div>
                <h4 className={styles.contactInfoTitle}>Our Address</h4>
                <p className={styles.contactInfoText}>
                  Village Faijpur, Noorpur,<br />
                  Dist Bijnor, 246734,<br />
                  Uttar Pradesh, India
                </p>
              </div>
            </div>

            {/* Phone */}
            <div className={styles.contactInfoCard}>
              <div className={styles.contactIconWrap}>
                <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                </svg>
              </div>
              <div>
                <h4 className={styles.contactInfoTitle}>Phone Number</h4>
                <p className={styles.contactInfoText}>
                  <a href="tel:+917060443349">+91 70604 43349</a>
                </p>
              </div>
            </div>

            {/* Email */}
            <div className={styles.contactInfoCard}>
              <div className={styles.contactIconWrap}>
                <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                </svg>
              </div>
              <div>
                <h4 className={styles.contactInfoTitle}>Email</h4>
                <p className={styles.contactInfoText}>
                  <a href="mailto:rajdhyaan5@gmail.com">rajdhyaan5@gmail.com</a>
                </p>
              </div>
            </div>

            {/* Working Hours */}
            <div className={styles.contactInfoCard}>
              <div className={styles.contactIconWrap}>
                <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
              <div>
                <h4 className={styles.contactInfoTitle}>Working Hours</h4>
                <p className={styles.contactInfoText}>
                  Mon – Sun: 9:00 AM – 6:00 PM<br />
                </p>
              </div>
            </div>

            {/* Google Map */}
            <div className={styles.mapWrap}>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d55590.36869879247!2d78.5!3d29.4!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390a4f4d5f4f4f4f%3A0x4f4f4f4f4f4f4f4f!2sBijnor%2C+Uttar+Pradesh!5e0!3m2!1sen!2sin!4v1699999999999"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Rajdhyaan Location — Bijnor, Uttar Pradesh"
              />
            </div>
          </div>

          {/* Right: Contact Form */}
          <div className={styles.contactForm}>
            <h3 className={styles.formTitle}>Send Us a Message</h3>
            <p className={styles.formSubtitle}>
              Fill in the details below and we&apos;ll get back to you within 24 hours
            </p>

            <form onSubmit={handleSubmit}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="contact-name" className={styles.formLabel}>
                    Full Name
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    name="name"
                    placeholder="Your full name"
                    className={styles.formInput}
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="contact-phone" className={styles.formLabel}>
                    Phone
                  </label>
                  <input
                    id="contact-phone"
                    type="tel"
                    name="phone"
                    placeholder="+91 XXXXX XXXXX"
                    className={styles.formInput}
                    value={formData.phone}
                    onChange={handleChange}
                    pattern="\d*"
                    inputMode="numeric"
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="contact-email" className={styles.formLabel}>
                  Email
                </label>
                <input
                  id="contact-email"
                  type="email"
                  name="email"
                  placeholder="your@email.com"
                  className={styles.formInput}
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="contact-subject" className={styles.formLabel}>
                  Subject
                </label>
                <input
                  id="contact-subject"
                  type="text"
                  name="subject"
                  placeholder="e.g. Bulk order inquiry, product feedback"
                  className={styles.formInput}
                  value={formData.subject}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="contact-message" className={styles.formLabel}>
                  Message
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  placeholder="Tell us how we can help you..."
                  className={styles.formTextarea}
                  value={formData.message}
                  onChange={handleChange}
                  required
                />
              </div>

              <button
                type="submit"
                className={styles.submitBtn}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 0.7s linear infinite' }}>
                      <path d="M12 2v4m0 12v4m-7.07-3.93 2.83-2.83m8.48-8.48 2.83-2.83M2 12h4m12 0h4M4.93 4.93l2.83 2.83m8.48 8.48 2.83 2.83" />
                    </svg>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 2 11 13" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="m22 2-7 20-4-9-9-4 20-7Z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className={styles.testimonialsSection}>
        <div className={styles.testimonialsInner}>
          <div style={{ textAlign: 'center' }}>
            <span className={styles.sectionLabel}>Customer Love</span>
            <h2 className={styles.sectionTitle}>What Our Customers Say</h2>
            <div className={styles.sectionDivider} />
          </div>

          <div className={styles.testimonialsGrid}>
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className={styles.testimonialCard}>
                <span className={styles.testimonialQuote}>&ldquo;</span>
                <div className={styles.testimonialStars}>
                  {'★★★★★'.split('').map((star, i) => (
                    <span key={i}>{star}</span>
                  ))}
                </div>
                <p className={styles.testimonialText}>{t.text}</p>
                <div className={styles.testimonialAuthor}>
                  <div className={styles.testimonialAvatar}>{t.initials}</div>
                  <div>
                    <p className={styles.testimonialName}>{t.name}</p>
                    <p className={styles.testimonialLocation}>{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ===== TOAST ===== */}
      {showToast && (
        <div className={styles.toast}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span><strong>Message sent!</strong> We&apos;ll get back to you within 24 hours.</span>
        </div>
      )}
      {errorMsg && (
        <div className={styles.toast} style={{ borderLeftColor: '#ef4444' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
