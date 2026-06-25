'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  FileText, 
  Lock, 
  AlertTriangle, 
  Gavel, 
  Link as LinkIcon, 
  Settings, 
  XCircle, 
  MapPin, 
  ArrowUp,
  Mail,
  UserCheck
} from 'lucide-react';

const SECTIONS = [
  { id: 'agreement', title: '1. Agreement to Terms', icon: <FileText size={18} /> },
  { id: 'acceptable-use', title: '2. Acceptable Use', icon: <ShieldCheck size={18} /> },
  { id: 'info-provided', title: '3. Information You Provide', icon: <UserCheck size={18} /> },
  { id: 'content-provided', title: '4. Content You Provide', icon: <FileText size={18} /> },
  { id: 'ip-rights', title: '5. Intellectual Property Rights', icon: <Lock size={18} /> },
  { id: 'third-party', title: '6. Third-Party Links', icon: <LinkIcon size={18} /> },
  { id: 'site-management', title: '7. Site Management', icon: <Settings size={18} /> },
  { id: 'liability', title: '8. Limitation of Liability', icon: <AlertTriangle size={18} /> },
  { id: 'termination', title: '9. Termination', icon: <XCircle size={18} /> },
  { id: 'governing-law', title: '10. Governing Law', icon: <Gavel size={18} /> },
  { id: 'contact', title: '11. Contact Information', icon: <Mail size={18} /> },
];

export default function TermsAndConditionsPage() {
  const [activeSection, setActiveSection] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);

      const sectionElements = SECTIONS.map(s => document.getElementById(s.id));
      const current = sectionElements.find(el => {
        if (!el) return false;
        const rect = el.getBoundingClientRect();
        return rect.top >= 0 && rect.top <= 300;
      });

      if (current) {
        setActiveSection(current.id);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 100;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-secondary/30 pt-20 pb-12 font-body selection:bg-accent/30 selection:text-primary">
      {/* HEADER SECTION */}
      <div className="bg-primary text-secondary py-16 px-4 md:px-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('/pattern-leaf.svg')] bg-repeat"></div>
        <div className="max-w-4xl mx-auto relative z-10">
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl mb-4 font-bold tracking-wide">
            Terms & Conditions
          </h1>
          <p className="font-body text-secondary/80 text-lg md:text-xl max-w-2xl mx-auto mb-6 font-light">
            Please read these terms carefully before using our services
          </p>
          <div className="inline-block bg-secondary/10 px-4 py-1.5 rounded-full border border-secondary/20 backdrop-blur-sm">
            <span className="text-sm font-medium tracking-wider text-secondary/90">
              LAST UPDATED: MARCH 2025
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-12 flex flex-col lg:flex-row gap-12 items-start relative">
        
        {/* SIDEBAR NAVIGATION (Desktop) */}
        <aside className="hidden lg:block w-72 sticky top-28 bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-accent/10 shadow-sm flex-shrink-0">
          <h3 className="font-heading text-xl font-bold text-primary mb-4 pb-4 border-b border-accent/20">
            Table of Contents
          </h3>
          <nav className="flex flex-col gap-2">
            {SECTIONS.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`flex items-center gap-3 text-left text-sm py-2 px-3 rounded-lg transition-all duration-300 ${
                  activeSection === section.id 
                    ? 'bg-accent/10 text-accent font-semibold border-l-2 border-accent' 
                    : 'text-dark/60 hover:bg-secondary hover:text-primary border-l-2 border-transparent'
                }`}
              >
                <span className={activeSection === section.id ? 'text-accent' : 'text-dark/40'}>
                  {section.icon}
                </span>
                {section.title}
              </button>
            ))}
          </nav>
        </aside>

        {/* MAIN CONTENT */}
        <div className="flex-1 max-w-3xl bg-white/80 backdrop-blur-sm p-6 md:p-10 rounded-2xl border border-accent/10 shadow-sm">
          
          {/* 1. Agreement to Terms */}
          <section id="agreement" className="mb-12 group scroll-mt-28">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-accent/10 p-2 rounded-lg text-accent">
                <FileText size={20} />
              </div>
              <h2 className="font-heading text-2xl md:text-3xl text-primary font-bold group-hover:text-accent transition-colors">
                1. Agreement to Terms
              </h2>
            </div>
            <div className="space-y-4 text-dark/80 font-body leading-relaxed pl-2 md:pl-11 border-l border-accent/20 ml-4 md:ml-6 pb-2">
              <p>
                These Terms and Conditions constitute a <span className="text-primary font-semibold bg-accent/10 px-1 rounded">legally binding agreement</span> made between you, whether personally or on behalf of an entity ("you") and Rajdhyaan ("we," "us" or "our"), concerning your access to and use of our website as well as any other media form, media channel, mobile website or mobile application related, linked, or otherwise connected thereto.
              </p>
              <p>
                You agree that by accessing the site, you have read, understood, and agreed to be bound by all of these Terms and Conditions. If you do not agree with all of these Terms and Conditions, then you are expressly prohibited from using the site and you must discontinue use immediately.
              </p>
              <p>
                We reserve the right, in our sole discretion, to make changes or modifications to these Terms and Conditions at any time and for any reason. You must be at least 18 years of age to use this website. By using this website, you warrant and represent that you are at least 18 years of age.
              </p>
            </div>
          </section>

          {/* 2. Acceptable Use */}
          <section id="acceptable-use" className="mb-12 group scroll-mt-28">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-accent/10 p-2 rounded-lg text-accent">
                <ShieldCheck size={20} />
              </div>
              <h2 className="font-heading text-2xl md:text-3xl text-primary font-bold group-hover:text-accent transition-colors">
                2. Acceptable Use
              </h2>
            </div>
            <div className="space-y-4 text-dark/80 font-body leading-relaxed pl-2 md:pl-11 border-l border-accent/20 ml-4 md:ml-6 pb-2">
              <p>
                You may not access or use the site for any purpose other than that for which we make the site available. The site may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.
              </p>
              <p>As a user of the site, you agree not to:</p>
              <ul className="list-disc pl-5 space-y-2 text-dark/70">
                <li>Systematically retrieve data or other content from the site to create or compile, directly or indirectly, a collection, compilation, database, or directory without written permission from us.</li>
                <li>Trick, defraud, or mislead us and other users, especially in any attempt to learn sensitive account information such as user passwords.</li>
                <li>Engage in unauthorized framing of or linking to the site.</li>
                <li>Use the site in a manner inconsistent with any applicable laws or regulations.</li>
              </ul>
            </div>
          </section>

          {/* 3. Information You Provide */}
          <section id="info-provided" className="mb-12 group scroll-mt-28">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-accent/10 p-2 rounded-lg text-accent">
                <UserCheck size={20} />
              </div>
              <h2 className="font-heading text-2xl md:text-3xl text-primary font-bold group-hover:text-accent transition-colors">
                3. Information You Provide
              </h2>
            </div>
            <div className="space-y-4 text-dark/80 font-body leading-relaxed pl-2 md:pl-11 border-l border-accent/20 ml-4 md:ml-6 pb-2">
              <p>
                By using the site, you represent and warrant that: (1) all registration information you submit will be true, accurate, current, and complete; (2) you will maintain the accuracy of such information and promptly update such registration information as necessary.
              </p>
              <p>
                If you provide any information that is untrue, inaccurate, not current, or incomplete, we have the right to suspend or terminate your account and refuse any and all current or future use of the site. You are responsible for keeping your password confidential and will be responsible for all use of your account and password.
              </p>
            </div>
          </section>

          {/* 4. Content You Provide */}
          <section id="content-provided" className="mb-12 group scroll-mt-28">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-accent/10 p-2 rounded-lg text-accent">
                <FileText size={20} />
              </div>
              <h2 className="font-heading text-2xl md:text-3xl text-primary font-bold group-hover:text-accent transition-colors">
                4. Content You Provide
              </h2>
            </div>
            <div className="space-y-4 text-dark/80 font-body leading-relaxed pl-2 md:pl-11 border-l border-accent/20 ml-4 md:ml-6 pb-2">
              <p>
                There may be opportunities for you to publish content to the site or send feedback to us (User Content). You understand and agree that your User Content may be viewed by other users on the site, and that they may be able to see who has posted that User Content.
              </p>
              <p>
                We have the right, in our sole and absolute discretion, to: (1) edit, redact, or otherwise change any User Content; (2) re-categorize any User Content to place them in more appropriate locations on the Site; and (3) pre-screen or delete any User Content at any time and for any reason, without notice.
              </p>
            </div>
          </section>

          {/* 5. Intellectual Property Rights */}
          <section id="ip-rights" className="mb-12 group scroll-mt-28">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-accent/10 p-2 rounded-lg text-accent">
                <Lock size={20} />
              </div>
              <h2 className="font-heading text-2xl md:text-3xl text-primary font-bold group-hover:text-accent transition-colors">
                5. Intellectual Property Rights
              </h2>
            </div>
            <div className="space-y-4 text-dark/80 font-body leading-relaxed pl-2 md:pl-11 border-l border-accent/20 ml-4 md:ml-6 pb-2">
              <p>
                Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the "Content") and the trademarks, service marks, and logos contained therein (the "Marks") are owned or controlled by us or licensed to us.
              </p>
              <p>
                Except as expressly provided in these Terms and Conditions, no part of the Site and no Content or Marks may be copied, reproduced, aggregated, republished, uploaded, posted, publicly displayed, encoded, translated, transmitted, distributed, sold, licensed, or otherwise exploited for any commercial purpose whatsoever, without our express prior written permission.
              </p>
            </div>
          </section>

          {/* 6. Third-Party Links */}
          <section id="third-party" className="mb-12 group scroll-mt-28">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-accent/10 p-2 rounded-lg text-accent">
                <LinkIcon size={20} />
              </div>
              <h2 className="font-heading text-2xl md:text-3xl text-primary font-bold group-hover:text-accent transition-colors">
                6. Third-Party Links
              </h2>
            </div>
            <div className="space-y-4 text-dark/80 font-body leading-relaxed pl-2 md:pl-11 border-l border-accent/20 ml-4 md:ml-6 pb-2">
              <p>
                The Site may contain links to websites or applications operated by third parties. We do not have any influence or control over any such Third-Party Websites or Applications or the Third-Party Operator. We are not responsible for and do not endorse any Third-Party Websites or Applications or their availability or contents.
              </p>
            </div>
          </section>

          {/* 7. Site Management */}
          <section id="site-management" className="mb-12 group scroll-mt-28">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-accent/10 p-2 rounded-lg text-accent">
                <Settings size={20} />
              </div>
              <h2 className="font-heading text-2xl md:text-3xl text-primary font-bold group-hover:text-accent transition-colors">
                7. Site Management & Availability
              </h2>
            </div>
            <div className="space-y-4 text-dark/80 font-body leading-relaxed pl-2 md:pl-11 border-l border-accent/20 ml-4 md:ml-6 pb-2">
              <p>
                We reserve the right, but not the obligation, to: (1) monitor the Site for violations of these Terms and Conditions; (2) take appropriate legal action against anyone who, in our sole discretion, violates the law or these Terms and Conditions; (3) refuse, restrict access to, limit the availability of, or disable (to the extent technologically feasible) any of your Contributions or any portion thereof.
              </p>
              <p>
                We cannot guarantee the Site will be available at all times. We may experience hardware, software, or other problems or need to perform maintenance related to the Site, resulting in interruptions, delays, or errors.
              </p>
            </div>
          </section>

          {/* 8. Limitation of Liability */}
          <section id="liability" className="mb-12 group scroll-mt-28">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-accent/10 p-2 rounded-lg text-accent">
                <AlertTriangle size={20} />
              </div>
              <h2 className="font-heading text-2xl md:text-3xl text-primary font-bold group-hover:text-accent transition-colors">
                8. Limitation of Liability
              </h2>
            </div>
            <div className="space-y-4 text-dark/80 font-body leading-relaxed pl-2 md:pl-11 border-l border-accent/20 ml-4 md:ml-6 pb-2">
              <div className="bg-secondary p-5 rounded-xl border border-accent/20 shadow-inner">
                <p className="font-bold text-primary mb-2 uppercase text-sm tracking-wide">Disclaimer</p>
                <p>
                  THE SITE IS PROVIDED ON AN AS-IS AND AS-AVAILABLE BASIS. YOU AGREE THAT YOUR USE OF THE SITE AND OUR SERVICES WILL BE <span className="text-primary font-bold">AT YOUR OWN RISK</span>.
                </p>
              </div>
              <p>
                To the fullest extent permitted by law, we disclaim all warranties, express or implied, in connection with the site and your use thereof. In no event will we or our directors, employees, or agents be liable to you or any third party for any direct, indirect, consequential, exemplary, incidental, special, or punitive damages arising from your use of the site.
              </p>
            </div>
          </section>

          {/* 9. Termination */}
          <section id="termination" className="mb-12 group scroll-mt-28">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-red-100 p-2 rounded-lg text-red-600">
                <XCircle size={20} />
              </div>
              <h2 className="font-heading text-2xl md:text-3xl text-primary font-bold group-hover:text-accent transition-colors">
                9. Termination
              </h2>
            </div>
            <div className="space-y-4 text-dark/80 font-body leading-relaxed pl-2 md:pl-11 border-l border-accent/20 ml-4 md:ml-6 pb-2">
              <p>
                These Terms and Conditions shall remain in full force and effect while you use the Site. Without limiting any other provision of these Terms and Conditions, we reserve the right to, in our sole discretion and without notice or liability, deny access to and use of the Site (including blocking certain IP addresses), to any person for any reason or for no reason.
              </p>
            </div>
          </section>

          {/* 10. Governing Law */}
          <section id="governing-law" className="mb-12 group scroll-mt-28">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-accent/10 p-2 rounded-lg text-accent">
                <Gavel size={20} />
              </div>
              <h2 className="font-heading text-2xl md:text-3xl text-primary font-bold group-hover:text-accent transition-colors">
                10. Governing Law
              </h2>
            </div>
            <div className="space-y-4 text-dark/80 font-body leading-relaxed pl-2 md:pl-11 border-l border-accent/20 ml-4 md:ml-6 pb-2">
              <p>
                These Terms shall be governed by and defined following the laws of India. Rajdhyaan and yourself irrevocably consent that the courts of India shall have exclusive jurisdiction to resolve any dispute which may arise in connection with these terms.
              </p>
            </div>
          </section>

          {/* 11. Contact Information */}
          <section id="contact" className="mb-8 group scroll-mt-28">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-accent/10 p-2 rounded-lg text-accent">
                <Mail size={20} />
              </div>
              <h2 className="font-heading text-2xl md:text-3xl text-primary font-bold group-hover:text-accent transition-colors">
                11. Contact Information
              </h2>
            </div>
            <div className="pl-2 md:pl-11 border-l border-accent/20 ml-4 md:ml-6 pb-2">
              <div className="bg-primary text-secondary p-6 rounded-2xl flex flex-col md:flex-row gap-6 justify-between items-start md:items-center relative overflow-hidden shadow-lg">
                <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
                  <FileText size={100} />
                </div>
                <div className="space-y-3 relative z-10">
                  <h4 className="font-heading text-xl font-bold mb-1">Rajdhyaan</h4>
                  <div className="flex items-center gap-3">
                    <Mail size={16} className="text-accent" />
                    <a href="mailto:rajdhyaan5@gmail.com" className="hover:text-accent transition-colors text-sm md:text-base">rajdhyaan5@gmail.com</a>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin size={16} className="text-accent mt-1 flex-shrink-0" />
                    <p className="text-sm md:text-base text-secondary/80">
                      Village Faijpur, Noorpur,<br />
                      District Bijnor, 246734,<br />
                      Uttar Pradesh, India
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* BACK TO TOP BUTTON */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-6 right-6 bg-white text-primary p-3 rounded-full shadow-lg border border-secondary hover:bg-secondary hover:text-accent transition-all hover:-translate-y-1 z-50 ${
          showScrollTop ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        aria-label="Back to top"
      >
        <ArrowUp size={20} />
      </button>
    </div>
  );
}
