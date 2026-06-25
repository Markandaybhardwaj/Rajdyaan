'use client';
import { useState } from 'react';
import Image from 'next/image';
import styles from './b2b.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
const GOOGLE_SCRIPT_URL = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL || '';
const WA_LINK = 'https://wa.me/917060443349?text=Hello%20I%20want%20bulk%20order%20details';

const PRODUCTS_LIST = [
  'Jaggery Balls / Laddu Gur', 'Jaggery Candy / Cubes / Barfi',
  'Desi Khand / Jaggery Powder', 'Multiple Products', 'Other',
];

export default function B2BPage() {
  const [form, setForm] = useState({
    name: '', businessName: '', phone: '', email: '',
    product: '', quantity: '', message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone' && value !== '' && !/^\d+$/.test(value)) return;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setSubmitting(true);
    try {
      // 1. Save to MongoDB via Express backend
      const res = await fetch(`${API_URL}/b2b/enquiry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Submission failed');

      // 2. Also save to Google Sheets (fire-and-forget)
      // mode:'no-cors' + text/plain bypasses Google Script CORS redirect
      // so this works even in browsers NOT logged into Google.
      if (GOOGLE_SCRIPT_URL) {
        fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({ type: 'b2b', ...form }),
        }).catch(() => {});
      }

      setSuccess('Your enquiry has been submitted. We will contact you soon.');
      setForm({ name: '', businessName: '', phone: '', email: '', product: '', quantity: '', message: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>

      {/* ===== 1. HERO ===== */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroContent}>
            <span className={styles.heroBadge}>✦ B2B Wholesale Partner</span>
            <h1 className={styles.heroTitle}>
              Bulk <span>Gur</span> Supply You Can Trust
            </h1>
            <p className={styles.heroSub}>
              Direct from Source, Consistent Quality, Competitive Pricing, Pan India Delivery with Expanding Global Reach
            </p>
            <div className={styles.heroBtns}>
              <a href="#enquiry-form" className={styles.btnPrimary}>
                Get Bulk Quote
              </a>
              <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className={styles.btnWhatsapp}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Chat on WhatsApp
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* ===== 2. STATS ===== */}
      <section className={styles.stats}>
        <div className={styles.statsGrid}>
          {[
            { num: '40+', label: 'Business Partners' },
            { num: '350+', label: 'Bulk Orders Delivered' },
            { num: '45+', label: 'Cities Served' },
            { num: '8+', label: 'States Served' },
            { num: '94%', label: 'On-Time Dispatch' },
          ].map((s) => (
            <div key={s.label} className={styles.statCard}>
              <p className={styles.statNumber}>{s.num}</p>
              <p className={styles.statLabel}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== 3. RELATIONSHIPS ===== */}
      <section className={styles.clientProof}>
        <div className={styles.meetingsImage}>
          <Image src="https://res.cloudinary.com/dzikgxfxr/image/upload/v1778068343/rajdhyaan/b2b-collage.jpg" alt="Rajdhyaan business meetings collage" width={1200} height={600} style={{ width: '100%', height: 'auto', display: 'block' }} />
        </div>
      </section>

      {/* ===== 3.5 LOGISTICS ===== */}
      <section className={styles.clientProof} style={{ paddingTop: '0' }}>
        <span className={styles.sectionTag}>— Logistics —</span>
        <h2 className={styles.sectionTitle}>Robust Supply Chain & Nationwide Delivery</h2>
        <div className={styles.meetingsImage}>
          <Image src="https://res.cloudinary.com/dzikgxfxr/image/upload/v1778045241/rajdhyaan/b2b-logistics.jpg" alt="Rajdhyaan Nationwide Logistics and Supply Chain" width={1200} height={600} style={{ width: '100%', height: 'auto', display: 'block' }} />
        </div>
      </section>

      {/* ===== 4. WHY CHOOSE US ===== */}
      <section className={styles.whyChoose}>
        <span className={styles.sectionTag}>— Our Advantage —</span>
        <h2 className={styles.sectionTitle}>Why Choose Rajdhyaan?</h2>
        <div className={styles.whyGrid}>
          {[
            { emoji: '🏭', title: 'Direct from Source', desc: 'No middlemen — products come straight from our manufacturing unit.' },
            { emoji: '✨', title: 'Premium Quality', desc: 'Chemical-free, traditional processing methods ensure the purest taste.' },
            { emoji: '📦', title: 'Consistent Supply', desc: 'Reliable inventory management — never run out of stock.' },
            { emoji: '⚖️', title: 'Flexible Quantity', desc: 'From 500kg to 30 MT — we fulfill orders of all sizes.' },
            { emoji: '💰', title: 'Competitive Pricing', desc: 'Best wholesale rates with transparent pricing — no hidden costs.' },
            { emoji: '🚚', title: 'Pan India Delivery', desc: 'Nationwide logistics network for on-time delivery to your doorstep.' },
          ].map((w) => (
            <div key={w.title} className={styles.whyCard}>
              <span className={styles.whyEmoji}>{w.emoji}</span>
              <h3 className={styles.whyTitle}>{w.title}</h3>
              <p className={styles.whyDesc}>{w.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== 5. PRODUCTS ===== */}
      <section className={styles.products}>
        <span className={styles.sectionTag}>— Wholesale Catalog —</span>
        <h2 className={styles.sectionTitle}>Products for Wholesale</h2>
        <div className={styles.productsGrid}>
          {[
            {
              name: 'Jaggery Balls | Laddu Gur',
              img: 'https://res.cloudinary.com/dzikgxfxr/image/upload/v1778563196/JaggeryBalls_b2b_vqqu3m.png',
              bullets: [
                'Approx 4 to 30 pcs per kg as per requirement',
                'Natural taste with rich traditional flavor',
                'Hygienically processed for retail & bulk',
                'Wholesale, B2B & Private Label orders',
                'Custom Size | Custom Packing accepted',
              ],
              badge: 'Custom Size | Bulk Orders',
            },
            {
              name: 'Jaggery | Cubes | Candy | Barfi',
              img: 'https://res.cloudinary.com/dzikgxfxr/image/upload/v1778563173/JaggeryCandy_b2b_q7x8dp.png',
              bullets: [
                '6+ flavors & traditional taste variants',
                'Multiple shapes – Candy, Cube, Heart, Star & Barfi',
                'Smooth texture & hygienic processing',
                'Retail, Wholesale, Gift Packing & B2B supply',
                'Custom Flavor Development & Private Label available',
              ],
              badge: 'Custom Shapes | Custom Flavors',
            },
            {
              name: 'Desi Khand | Jaggery Powder',
              img: 'https://res.cloudinary.com/dzikgxfxr/image/upload/v1778563253/JeggeryKhand_b2b_logtwz.png',
              bullets: [
                'Fine, Medium & Granular texture variants',
                'Ideal for Tea, Sweets, Bakery & Daily use',
                'Hygienically processed with consistent quality',
                'Retail Packs, Bulk Supply & Private Label',
                'Bulk Orders | Customized Packing | Wholesale',
              ],
              badge: 'Bulk Orders | Wholesale Supply',
            },
          ].map((p) => (
            <div key={p.name} className={styles.productCard}>
              <div className={styles.productImgWrap}>
                <Image src={p.img} alt={p.name} fill style={{ objectFit: 'contain', padding: '1rem' }} />
              </div>
              <div className={styles.productInfo}>
                <h3 className={styles.productName}>{p.name}</h3>
                <ul className={styles.productBullets}>
                  {p.bullets.map((b) => <li key={b}>{b}</li>)}
                </ul>
                <span className={styles.bulkBadge}>{p.badge}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== 6. HOW IT WORKS ===== */}
      <section className={styles.howItWorks}>
        <span className={styles.sectionTag} style={{ color: '#d4b85a' }}>— Simple Process —</span>
        <h2 className={styles.sectionTitle} style={{ color: '#FAF6EE' }}>How It Works</h2>
        <div className={styles.howGrid}>
          {[
            { n: '1', title: 'Submit Enquiry', desc: 'Fill the form or message us on WhatsApp' },
            { n: '2', title: 'We Contact You', desc: 'Our team reaches out within 24 hours' },
            { n: '3', title: 'Discuss Pricing', desc: 'Custom quotes based on your requirements' },
            { n: '4', title: 'Delivery', desc: 'On-time delivery to your business location' },
          ].map((s) => (
            <div key={s.n} className={styles.howStep}>
              <div className={styles.howStepNum}>{s.n}</div>
              <h3 className={styles.howStepTitle}>{s.title}</h3>
              <p className={styles.howStepDesc}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== 7. ENQUIRY FORM ===== */}
      <section id="enquiry-form" className={styles.formSection}>
        <span className={styles.sectionTag}>— Get in Touch —</span>
        <h2 className={styles.sectionTitle}>Business Enquiry</h2>
        <div className={styles.formGrid}>
          <div className={styles.formLeft}>
            <h3 className={styles.formLeftTitle}>Partner with Rajdhyaan</h3>
            <p className={styles.formLeftDesc}>
              We&apos;re always looking for businesses that share our passion for pure, traditional products.
              Fill out the form and our B2B team will get back to you within 24 hours.
            </p>
            <div className={styles.formContactItem}>
              <span className={styles.formContactIcon}>📍</span>
              <div>
                <p className={styles.formContactLabel}>Address</p>
                <p className={styles.formContactValue}>
                  Village Faijpur, Noorpur,<br />
                  Dist Bijnor, 246734<br />
                  Uttar Pradesh, India
                </p>
              </div>
            </div>
            <div className={styles.formContactItem}>
              <span className={styles.formContactIcon}>📞</span>
              <div>
                <p className={styles.formContactLabel}>Phone</p>
                <p className={styles.formContactValue}>+91 70604 43349</p>
              </div>
            </div>
            <div className={styles.formContactItem}>
              <span className={styles.formContactIcon}>✉️</span>
              <div>
                <p className={styles.formContactLabel}>Email</p>
                <p className={styles.formContactValue}>rajdhyaan5@gmail.com</p>
              </div>
            </div>
            <div className={styles.formContactItem}>
              <span className={styles.formContactIcon}>🕐</span>
              <div>
                <p className={styles.formContactLabel}>Working Hours</p>
                <p className={styles.formContactValue}>Mon – Sun, 9 AM – 6 PM</p>
              </div>
            </div>
          </div>

          <form className={styles.formRight} onSubmit={handleSubmit}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Full Name *</label>
                <input className={styles.formInput} name="name" value={form.name} onChange={handleChange} required placeholder="Your full name" />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Business Name *</label>
                <input className={styles.formInput} name="businessName" value={form.businessName} onChange={handleChange} required placeholder="Your company name" />
              </div>
            </div>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Phone Number *</label>
                <input className={styles.formInput} name="phone" value={form.phone} onChange={handleChange} required placeholder="+91 XXXXX XXXXX" inputMode="numeric" pattern="\d*" />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Email *</label>
                <input className={styles.formInput} name="email" type="email" value={form.email} onChange={handleChange} required placeholder="you@company.com" />
              </div>
            </div>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Product Interested In *</label>
                <select className={styles.formSelect} name="product" value={form.product} onChange={handleChange} required>
                  <option value="">Select a product</option>
                  {PRODUCTS_LIST.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Quantity Required *</label>
                <input className={styles.formInput} name="quantity" value={form.quantity} onChange={handleChange} required placeholder="e.g. 500 kg / 2 tons" />
              </div>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Message</label>
              <textarea className={styles.formTextarea} name="message" value={form.message} onChange={handleChange} placeholder="Any additional details..." rows={4} />
            </div>
            <button type="submit" className={styles.formSubmitBtn} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Enquiry'}
            </button>
            {success && <div className={styles.successMsg}>{success}</div>}
            {error && <div className={styles.errorMsg}>{error}</div>}
          </form>
        </div>
      </section>

      {/* ===== 8. TESTIMONIALS ===== */}
      <section className={styles.testimonials}>
        <span className={styles.sectionTag}>— What Our Partners Say —</span>
        <h2 className={styles.sectionTitle}>Business Testimonials</h2>
        <div className={styles.testGrid}>
          {[
            { text: 'Rajdhyaan has been our trusted supplier for over 2 years. Their quality is unmatched and delivery is always on time.', author: 'Ramesh Agarwal', biz: 'Agarwal Sweets, Delhi' },
            { text: 'The best liquid gur we have sourced. Our customers love the taste and purity. Highly recommend for any food business.', author: 'Priya Sharma', biz: 'Natural Foods Co., Jaipur' },
            { text: 'Flexible quantities and competitive pricing make Rajdhyaan our go-to wholesale partner. Excellent communication.', author: 'Sunil Verma', biz: 'Verma Trading, Lucknow' },
          ].map((t) => (
            <div key={t.author} className={styles.testCard}>
              <p className={styles.testQuote}>&ldquo;</p>
              <p className={styles.testText}>{t.text}</p>
              <p className={styles.testAuthor}>{t.author}</p>
              <p className={styles.testBiz}>{t.biz}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== 9. FINAL CTA ===== */}
      <section className={styles.finalCta}>
        <h2 className={styles.finalCtaTitle}>Ready to Partner with Us?</h2>
        <p className={styles.finalCtaSub}>
          Join 40+ businesses that trust Rajdhyaan for premium traditional products.
        </p>
        <div className={styles.finalCtaBtns}>
          <a href="#enquiry-form" className={styles.btnPrimary}>Contact Now</a>
          <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className={styles.btnWhatsapp}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Chat on WhatsApp
          </a>
        </div>
      </section>

      {/* ===== 10. FLOATING WHATSAPP ===== */}
      <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className={styles.floatingWa} aria-label="Chat on WhatsApp">
        <svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
      </a>
    </div>
  );
}
