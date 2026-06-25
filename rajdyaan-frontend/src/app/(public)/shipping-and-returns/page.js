import React from 'react';
import Link from 'next/link';
import { 
  Truck, 
  PackageCheck, 
  RefreshCcw, 
  ShieldCheck, 
  AlertCircle, 
  Phone, 
  Mail, 
  MapPin, 
  ArrowUp,
  MessageCircle
} from 'lucide-react';

export const metadata = {
  title: 'Shipping & Returns | Rajdhyaan',
  description: 'Transparent shipping policies and hassle-free returns for Rajdhyaan products.',
};

export default function ShippingAndReturnsPage() {
  return (
    <div className="min-h-screen bg-secondary/30 pt-20 pb-12">
      {/* HEADER SECTION */}
      <div className="bg-primary text-secondary py-16 px-4 md:px-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('/pattern-leaf.svg')] bg-repeat"></div>
        <div className="max-w-4xl mx-auto relative z-10">
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl mb-4 font-bold tracking-wide">
            Shipping & Returns
          </h1>
          <p className="font-body text-secondary/80 text-lg md:text-xl max-w-2xl mx-auto mb-6">
            Transparent policies to ensure a smooth and reliable experience
          </p>
          <div className="inline-block bg-secondary/10 px-4 py-1.5 rounded-full border border-secondary/20 backdrop-blur-sm">
            <span className="text-sm font-medium tracking-wider text-secondary/90">
              LAST UPDATED: 22 MARCH 2025
            </span>
          </div>
        </div>
      </div>

      {/* CONTENT LAYOUT */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-12 md:py-16">
        
        {/* 1. SHIPPING */}
        <section className="mb-12 group" id="shipping">
          <div className="flex items-center gap-3 mb-6 border-b border-accent/20 pb-4 transition-colors group-hover:border-accent/50">
            <div className="bg-accent/10 p-2 rounded-lg text-accent group-hover:bg-accent group-hover:text-white transition-all duration-300">
              <Truck size={24} />
            </div>
            <h2 className="font-heading text-2xl md:text-3xl text-primary font-bold">1. Shipping</h2>
          </div>
          <div className="pl-2 md:pl-12 space-y-4 text-dark/80 font-body leading-relaxed">
            <p className="flex items-start gap-3">
              <span className="text-accent mt-1">•</span>
              <span>Orders are processed within <strong>48–72 hours</strong>.</span>
            </p>
            <p className="flex items-start gap-3">
              <span className="text-accent mt-1">•</span>
              <span><strong>Delivery timeline:</strong> 3–7 business days depending on your location.</span>
            </p>
            <p className="flex items-start gap-3">
              <span className="text-accent mt-1">•</span>
              <span>We are proud to offer <strong>Pan India delivery</strong>.</span>
            </p>
            <div className="bg-secondary p-4 rounded-xl border border-accent/20 flex items-start gap-3 mt-4">
              <PackageCheck className="text-accent flex-shrink-0 mt-0.5" size={20} />
              <p className="text-sm text-primary font-medium">
                We ensure secure and safe packaging for fragile items like our premium gur and ladoos to guarantee they reach you in perfect condition.
              </p>
            </div>
          </div>
        </section>

        {/* 2. RETURNS */}
        <section className="mb-12 group" id="returns">
          <div className="flex items-center gap-3 mb-6 border-b border-accent/20 pb-4 transition-colors group-hover:border-accent/50">
            <div className="bg-accent/10 p-2 rounded-lg text-accent group-hover:bg-accent group-hover:text-white transition-all duration-300">
              <RefreshCcw size={24} />
            </div>
            <h2 className="font-heading text-2xl md:text-3xl text-primary font-bold">2. Returns</h2>
          </div>
          <div className="pl-2 md:pl-12 space-y-4 text-dark/80 font-body leading-relaxed">
            <p className="flex items-start gap-3">
              <span className="text-accent mt-1">•</span>
              <span>Returns are accepted <strong>only in case of damage</strong> during shipping.</span>
            </p>
            <p className="flex items-start gap-3">
              <span className="text-accent mt-1">•</span>
              <span>Return requests must be raised within <strong>3 days</strong> of delivery.</span>
            </p>
            
            <div className="mt-4 mb-2">
              <p className="font-medium text-primary mb-2">To be eligible for a return, the product must be:</p>
              <ul className="space-y-2 pl-4">
                <li className="flex items-center gap-2"><ShieldCheck size={16} className="text-support"/> Unused</li>
                <li className="flex items-center gap-2"><ShieldCheck size={16} className="text-support"/> Unopened</li>
                <li className="flex items-center gap-2"><ShieldCheck size={16} className="text-support"/> In original packaging with the seal intact</li>
              </ul>
            </div>

            <div className="bg-accent/10 p-4 rounded-xl border-l-4 border-accent flex items-start gap-3 mt-6">
              <AlertCircle className="text-accent flex-shrink-0 mt-0.5" size={20} />
              <p className="text-sm text-primary font-semibold">
                Important Note: An unboxing video is required for faster and smoother return processing.
              </p>
            </div>
          </div>
        </section>

        {/* 3. RETURN PROCESS */}
        <section className="mb-12 group" id="return-process">
          <div className="flex items-center gap-3 mb-6 border-b border-accent/20 pb-4 transition-colors group-hover:border-accent/50">
            <div className="bg-accent/10 p-2 rounded-lg text-accent group-hover:bg-accent group-hover:text-white transition-all duration-300">
              <RefreshCcw size={24} />
            </div>
            <h2 className="font-heading text-2xl md:text-3xl text-primary font-bold">3. Return Process</h2>
          </div>
          <div className="pl-2 md:pl-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { step: 'Step 1', title: 'Contact Support', desc: 'Reach out via email' },
                { step: 'Step 2', title: 'Approval', desc: 'Wait for team confirmation' },
                { step: 'Step 3', title: 'Pack Safely', desc: 'Secure the product' },
                { step: 'Step 4', title: 'Ship It', desc: 'Send to our address' }
              ].map((item, index) => (
                <div key={index} className="bg-white p-4 rounded-xl border border-secondary shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group/card">
                  <div className="absolute top-0 right-0 bg-accent/10 text-accent font-bold text-xs px-2 py-1 rounded-bl-lg">
                    {item.step}
                  </div>
                  <h3 className="font-heading font-semibold text-primary mt-2 mb-1">{item.title}</h3>
                  <p className="text-sm text-dark/70 font-body">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="bg-secondary p-5 rounded-xl border border-accent/20">
              <h4 className="font-heading text-lg font-bold text-primary mb-2 flex items-center gap-2">
                <MapPin size={18} className="text-accent" />
                Return Address
              </h4>
              <p className="text-dark/80 font-body leading-relaxed pl-6">
                Rajdhyaan<br />
                Village Faijpur, Noorpur,<br />
                District Bijnor, 246734<br />
                Uttar Pradesh, India
              </p>
            </div>
          </div>
        </section>

        {/* 4. REFUNDS */}
        <section className="mb-12 group" id="refunds">
          <div className="flex items-center gap-3 mb-6 border-b border-accent/20 pb-4 transition-colors group-hover:border-accent/50">
            <div className="bg-accent/10 p-2 rounded-lg text-accent group-hover:bg-accent group-hover:text-white transition-all duration-300">
              <RefreshCcw size={24} />
            </div>
            <h2 className="font-heading text-2xl md:text-3xl text-primary font-bold">4. Refunds</h2>
          </div>
          <div className="pl-2 md:pl-12 space-y-4 text-dark/80 font-body leading-relaxed">
            <p className="flex items-start gap-3">
              <span className="text-accent mt-1">•</span>
              <span>Refunds are processed only after a thorough inspection of the returned item.</span>
            </p>
            <p className="flex items-start gap-3">
              <span className="text-accent mt-1">•</span>
              <span><strong>Processing time:</strong> Up to 15 business days.</span>
            </p>
            <p className="flex items-start gap-3">
              <span className="text-accent mt-1">•</span>
              <span><strong>Refund reflection:</strong> Please allow 1–2 billing cycles for the amount to reflect in your account.</span>
            </p>
            <p className="flex items-start gap-3">
              <span className="text-accent mt-1">•</span>
              <span>A confirmation email will be sent to you once the refund has been processed.</span>
            </p>
          </div>
        </section>

        {/* 5. EXCEPTIONS */}
        <section className="mb-12 group" id="exceptions">
          <div className="flex items-center gap-3 mb-6 border-b border-accent/20 pb-4 transition-colors group-hover:border-accent/50">
            <div className="bg-red-100 p-2 rounded-lg text-red-600 group-hover:bg-red-500 group-hover:text-white transition-all duration-300">
              <AlertCircle size={24} />
            </div>
            <h2 className="font-heading text-2xl md:text-3xl text-primary font-bold">5. Exceptions</h2>
          </div>
          <div className="pl-2 md:pl-12 space-y-4 text-dark/80 font-body leading-relaxed">
            <p className="flex items-start gap-3">
              <span className="text-red-500 mt-1">•</span>
              <span>Sale or discounted items are <strong>non-returnable</strong>.</span>
            </p>
            <p className="flex items-start gap-3">
              <span className="text-red-500 mt-1">•</span>
              <span>Opened, used, or tampered products are not eligible for return or refund.</span>
            </p>
            <p className="flex items-start gap-3">
              <span className="text-red-500 mt-1">•</span>
              <span>Any damage not caused during shipping is not eligible for a return.</span>
            </p>
          </div>
        </section>

        {/* 6. DAMAGED PRODUCTS SUPPORT */}
        <section className="mb-12 group" id="damaged-products">
          <div className="flex items-center gap-3 mb-6 border-b border-accent/20 pb-4 transition-colors group-hover:border-accent/50">
            <div className="bg-accent/10 p-2 rounded-lg text-accent group-hover:bg-accent group-hover:text-white transition-all duration-300">
              <ShieldCheck size={24} />
            </div>
            <h2 className="font-heading text-2xl md:text-3xl text-primary font-bold">6. Damaged Products Support</h2>
          </div>
          <div className="pl-2 md:pl-12 space-y-4 text-dark/80 font-body leading-relaxed">
            <p className="mb-4">
              In the rare event of damage, please contact our support team <strong>immediately</strong> upon receiving your order.
            </p>
            <div className="bg-white p-5 rounded-xl border border-secondary shadow-sm">
              <p className="font-medium text-primary mb-3">Please provide the following with your request:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 bg-secondary/50 p-3 rounded-lg border border-secondary">
                  <div className="bg-white p-2 rounded shadow-sm text-accent"><PackageCheck size={18} /></div>
                  <span className="font-medium text-dark/80">Clear Photos of the damage</span>
                </div>
                <div className="flex items-center gap-3 bg-secondary/50 p-3 rounded-lg border border-secondary">
                  <div className="bg-white p-2 rounded shadow-sm text-accent"><AlertCircle size={18} /></div>
                  <span className="font-medium text-dark/80">Unboxing Video (Mandatory)</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. CONTACT US */}
        <section className="mb-8 group" id="contact">
          <div className="flex items-center gap-3 mb-6 border-b border-accent/20 pb-4 transition-colors group-hover:border-accent/50">
            <div className="bg-accent/10 p-2 rounded-lg text-accent group-hover:bg-accent group-hover:text-white transition-all duration-300">
              <Mail size={24} />
            </div>
            <h2 className="font-heading text-2xl md:text-3xl text-primary font-bold">7. Contact Us</h2>
          </div>
          <div className="pl-2 md:pl-12">
            <div className="bg-primary text-white p-6 md:p-8 rounded-2xl relative overflow-hidden shadow-lg">
              <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
                <Mail size={120} />
              </div>
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-4">
                  <div className="bg-white/10 p-3 rounded-full"><Mail size={20} className="text-secondary" /></div>
                  <div>
                    <h4 className="font-heading text-lg font-bold text-secondary mb-1">Email Support</h4>
                    <a href="mailto:rajdhyaan5@gmail.com" className="text-secondary/80 hover:text-accent transition-colors font-body">rajdhyaan5@gmail.com</a>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-white/10 p-3 rounded-full"><Phone size={20} className="text-secondary" /></div>
                  <div>
                    <h4 className="font-heading text-lg font-bold text-secondary mb-1">Phone Support</h4>
                    <a href="tel:+917060443349" className="text-secondary/80 hover:text-accent transition-colors font-body">+91 70604 43349</a>
                  </div>
                </div>

                <div className="flex items-start gap-4 md:col-span-2">
                  <div className="bg-white/10 p-3 rounded-full"><MapPin size={20} className="text-secondary" /></div>
                  <div>
                    <h4 className="font-heading text-lg font-bold text-secondary mb-1">Headquarters</h4>
                    <p className="text-secondary/80 font-body">Village Faijpur, Noorpur, District Bijnor, 246734, Uttar Pradesh, India</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>

      {/* STICKY ELEMENTS */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
        <a 
          href="#top" 
          className="bg-white text-primary p-3 rounded-full shadow-lg border border-secondary hover:bg-secondary hover:text-accent transition-all hover:-translate-y-1 group"
          aria-label="Back to top"
        >
          <ArrowUp size={20} className="group-hover:animate-bounce" />
        </a>
        <a 
          href="https://wa.me/917060443349" 
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-green-500 text-white p-3 rounded-full shadow-lg hover:bg-green-600 transition-all hover:scale-110"
          aria-label="Contact on WhatsApp"
        >
          <MessageCircle size={24} />
        </a>
      </div>
    </div>
  );
}
