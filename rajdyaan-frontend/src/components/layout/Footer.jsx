'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import styles from './Footer.module.css';

const DEFAULT_LOGO = 'https://res.cloudinary.com/dzikgxfxr/image/upload/v1782302722/Rajdyan_Logo1_fkhmhu.png';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

const Footer = () => {
  const [mounted, setMounted] = React.useState(false);
  const [logoUrl, setLogoUrl] = React.useState(DEFAULT_LOGO);
  const pathname = usePathname();

  React.useEffect(() => {
    setMounted(true);
    // Fetch dynamic logo from banner API
    fetch(`${API_URL}/banners?section=general`)
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        const banners = data?.data?.banners || data?.data || [];
        const logoBanner = banners.find((b) => b.key === 'logo' && b.isActive && b.image?.url);
        if (logoBanner) setLogoUrl(logoBanner.image.url);
      })
      .catch(() => {}); // silently fallback to default
  }, []);

  // Hide footer on login and register pages
  const hideFooter = pathname === '/login' || pathname === '/register';

  if (!mounted || hideFooter) return null;
  return (
    <footer className={styles.footer}>
      {/* Top Highlights Bar */}
      <div className={styles.highlightsBar}>
        <div className={styles.container}>
          <p className={styles.highlightsText}>
            100% Natural | No Chemicals, No Preservatives | Farm-Fresh Sweeteners
          </p>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Brand & Logo Section */}
          <div className={styles.brandSection}>
            <div className={styles.logoWrapper}>
              <Image
                src={logoUrl}
                alt="Rajdhyaan Logo"
                width={200}
                height={120}
                className={styles.logo}
              />
            </div>
            <h3 className={styles.sectionTitle}>Brand Promise</h3>
            <p className={styles.brandText}>
              At Rajdhyaan, we are committed to bringing the purity of nature to your doorstep.
              Our products are crafted with traditional wisdom and modern quality standards.
            </p>
            <ul className={styles.promiseList}>
              <li>100% Natural & Organic</li>
              <li>No Added Chemicals</li>
              <li>Sourced from Local Farmers</li>
            </ul>
          </div>

          {/* Pages Section */}
          <div className={styles.linksSection}>
            <h3 className={styles.sectionTitle}>Pages</h3>
            <ul className={styles.linkList}>
              <li><Link href="/">Home</Link></li>
              <li><Link href="/products">Products</Link></li>
              <li><Link href="/b2b">B2B Wholesale</Link></li>

              <li><Link href="/contact">Contact Us</Link></li>
            </ul>
          </div>

          {/* Quick Links Section */}
          <div className={styles.linksSection}>
            <h3 className={styles.sectionTitle}>Quick Links</h3>
            <ul className={styles.linkList}>
              <li><Link href="/privacy-policy">Privacy Policy</Link></li>
              <li><Link href="/terms">Terms of Use</Link></li>
              <li><Link href="/shipping-and-returns">Shipping & Returns</Link></li>
              <li><Link href="/faq">FAQ</Link></li>
            </ul>
          </div>

          {/* Contact Section */}
          <div className={styles.contactSection}>
            <h3 className={styles.sectionTitle}>Contact Us</h3>
            <ul className={styles.contactList}>
              <li>
                <span className={styles.contactLabel}>Phone:</span>
                <a href="tel:+917060443349">+91 70604 43349</a>
              </li>
              <li>
                <span className={styles.contactLabel}>Email:</span>
                <a href="mailto:rajdhyaan5@gmail.com">rajdhyaan5@gmail.com</a>
              </li>
              <li>
                <span className={styles.contactLabel}>Address:</span>
                <address className={styles.address}>
                  Village Faijpur, Noorpur,<br />
                  Dist Bijnor,246734<br />
                  Uttar Pradesh, India
                </address>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={styles.bottomBar}>
          <div className={styles.copyright}>
            © {new Date().getFullYear()}, Rajdhyaan Store. All Rights Reserved.
          </div>
          <div className={styles.developer}>
            Developed by <span className={styles.devName}>Markanday Bhardwaj</span>
            <br />
            <a href="mailto:markandaybhardwaj1183@gmail.com" className={styles.devEmail}>markandaybhardwaj1183@gmail.com</a>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-4 text-sm text-secondary/70">
            <Link href="/privacy-policy" className="hover:text-accent transition-colors">Privacy Policy</Link>
            <span className="hidden md:inline">·</span>
            <Link href="/terms" className="hover:text-accent transition-colors">Terms & Conditions</Link>
            <span className="hidden md:inline">·</span>
            <Link href="/shipping-and-returns" className="hover:text-accent transition-colors">Shipping & Returns</Link>
            <span className="hidden md:inline">·</span>
            <Link href="/contact" className="hover:text-accent transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
