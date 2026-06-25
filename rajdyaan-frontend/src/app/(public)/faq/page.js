'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Plus, 
  Minus, 
  Package, 
  Truck, 
  RefreshCcw, 
  Briefcase, 
  CreditCard,
  ShieldCheck,
  Leaf,
  Award,
  MessageCircle,
  Mail,
  ThumbsUp
} from 'lucide-react';

const FAQ_DATA = [
  {
    id: 'products',
    category: 'Products',
    icon: <Package size={20} />,
    questions: [
      {
        q: 'What products does Rajdhyaan offer?',
        a: 'We offer premium traditional food products including pure Gur (Jaggery), authentic Khand, and traditional sweets like Ladoos, all crafted with care.'
      },
      {
        q: 'Are your products chemical-free?',
        a: 'Yes, absolutely. All our products are 100% natural and free from any added chemicals, colors, or artificial preservatives.'
      },
      {
        q: 'How is your gur made?',
        a: 'Our gur is crafted using traditional wisdom, boiling fresh sugarcane juice in large pans and avoiding any chemical clarificants, preserving its authentic taste and nutrients.'
      },
      {
        q: 'Do you use preservatives?',
        a: 'No, we strictly avoid using any artificial preservatives. We rely on traditional preparation methods to maintain the purity and authentic taste of our products.'
      },
      {
        q: 'Are your products lab tested?',
        a: 'Yes, our products undergo strict quality checks to ensure they meet modern food safety and quality standards before reaching you.'
      }
    ]
  },
  {
    id: 'shipping',
    category: 'Shipping & Delivery',
    icon: <Truck size={20} />,
    questions: [
      {
        q: 'How long does delivery take?',
        a: 'Orders are processed within 48–72 hours. Delivery typically takes 3–7 business days depending on your location within India.'
      },
      {
        q: 'Do you offer Pan India shipping?',
        a: 'Yes, we proudly offer reliable delivery services across all states in India.'
      },
      {
        q: 'Is international shipping available?',
        a: 'Yes, we currently export to Bangladesh and are actively working on expanding to more international locations.'
      },
      {
        q: 'How are products packaged?',
        a: 'We use secure, premium packaging specially designed to protect fragile items like our gur and ladoos, ensuring they reach you in perfect condition.'
      },
      {
        q: 'How can I track my order?',
        a: 'Once your order is dispatched, you will receive a tracking link via email and SMS to monitor its journey.'
      }
    ]
  },
  {
    id: 'returns',
    category: 'Returns & Refunds',
    icon: <RefreshCcw size={20} />,
    questions: [
      {
        q: 'What is your return policy?',
        a: 'Returns are accepted only in case of damage during shipping. Requests must be raised within 3 days of delivery.'
      },
      {
        q: 'Can I return opened products?',
        a: 'No. For hygiene and safety reasons, opened, used, or tampered products are not eligible for a return.'
      },
      {
        q: 'How do refunds work?',
        a: 'Refunds are processed after a thorough inspection of the returned item and can take up to 15 business days to reflect in your account.'
      },
      {
        q: 'Is an unboxing video required?',
        a: 'Yes, an unboxing video is mandatory to process return or replacement requests for damaged items quickly and smoothly.'
      }
    ]
  },
  {
    id: 'b2b',
    category: 'B2B / Wholesale',
    icon: <Briefcase size={20} />,
    questions: [
      {
        q: 'Do you provide bulk supply?',
        a: 'Yes, we are a trusted supplier for over 40 B2B partners, providing reliable bulk supply for businesses.'
      },
      {
        q: 'Which products are available for wholesale?',
        a: 'All our core products, including Gur, Khand, and custom traditional sweets, are available for wholesale.'
      },
      {
        q: 'Can I request custom quantity?',
        a: 'Yes, we offer flexible bulk ordering tailored to your specific business needs. Please reach out to our team to discuss.'
      },
      {
        q: 'Do you export to Bangladesh?',
        a: 'Yes, we have established robust logistics for exporting our premium traditional products to Bangladesh.'
      },
      {
        q: 'How can businesses contact Rajdhyaan?',
        a: 'You can visit our B2B Wholesale page to submit an inquiry, or email us directly at rajdhyaan5@gmail.com.'
      }
    ]
  },
  {
    id: 'payments',
    category: 'Payments & Support',
    icon: <CreditCard size={20} />,
    questions: [
      {
        q: 'Which payment methods are accepted?',
        a: 'We accept all major Credit/Debit Cards, UPI, Net Banking, and popular mobile Wallets.'
      },
      {
        q: 'Is Cash on Delivery available?',
        a: 'Currently, we only support prepaid orders to ensure seamless, contactless, and faster delivery.'
      },
      {
        q: 'How can I contact support?',
        a: 'You can reach us via email at rajdhyaan5@gmail.com, or through our dedicated WhatsApp support at +91 70604 43349.'
      },
      {
        q: 'How quickly do you respond?',
        a: 'Our support team aims to respond to all customer queries within 24 hours on business days.'
      }
    ]
  }
];

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(FAQ_DATA[0].id);
  const [openQuestionId, setOpenQuestionId] = useState(null);

  // Scroll spy effect for sidebar
  useEffect(() => {
    const handleScroll = () => {
      if (searchQuery) return; // Disable scroll spy while searching

      const sectionElements = FAQ_DATA.map(cat => document.getElementById(cat.id));
      const current = sectionElements.find(el => {
        if (!el) return false;
        const rect = el.getBoundingClientRect();
        return rect.top >= 0 && rect.top <= 400; // Adjusted offset for better detection
      });

      if (current) {
        setActiveCategory(current.id);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [searchQuery]);

  const toggleQuestion = (id) => {
    setOpenQuestionId(openQuestionId === id ? null : id);
  };

  const scrollToCategory = (id) => {
    setSearchQuery(''); // Clear search if jumping to category
    const el = document.getElementById(id);
    if (el) {
      const offset = 120;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  // Filter logic
  const filteredData = FAQ_DATA.map(category => {
    const filteredQuestions = category.questions.filter(
      q => q.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
           q.a.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return { ...category, questions: filteredQuestions };
  }).filter(category => category.questions.length > 0);

  return (
    <div className="min-h-screen bg-secondary/30 pt-20 pb-12 font-body selection:bg-accent/30 selection:text-primary">
      
      {/* HEADER SECTION */}
      <div className="bg-primary text-secondary py-16 px-4 md:px-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('/pattern-leaf.svg')] bg-repeat"></div>
        <div className="max-w-4xl mx-auto relative z-10">
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl mb-4 font-bold tracking-wide">
            Frequently Asked Questions
          </h1>
          <p className="font-body text-secondary/80 text-lg md:text-xl max-w-2xl mx-auto mb-6 font-light">
            Find answers to common questions about our products, shipping, wholesale orders, and quality.
          </p>
          <div className="inline-flex items-center gap-2 bg-secondary/10 px-5 py-2 rounded-full border border-secondary/20 backdrop-blur-sm">
            <MessageCircle size={18} className="text-accent" />
            <span className="text-sm font-medium tracking-wider text-secondary/90">
              Still need help? Contact us anytime.
            </span>
          </div>
        </div>
      </div>

      {/* SEARCH BAR SECTION */}
      <div className="max-w-3xl mx-auto px-4 md:px-8 -mt-8 relative z-20">
        <div className="bg-white p-2 rounded-full shadow-lg border border-accent/20 flex items-center transition-all focus-within:ring-2 focus-within:ring-accent/50 focus-within:border-accent">
          <div className="pl-4 pr-2 text-accent">
            <Search size={22} />
          </div>
          <input
            type="text"
            placeholder="Search your question..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none outline-none py-3 text-primary placeholder:text-dark/40 font-body text-lg"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="pr-4 text-dark/40 hover:text-primary transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-16 flex flex-col lg:flex-row gap-12 items-start relative">
        
        {/* SIDEBAR NAVIGATION (Desktop) */}
        <aside className="hidden lg:block w-72 sticky top-32 bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-accent/10 shadow-sm flex-shrink-0">
          <h3 className="font-heading text-xl font-bold text-primary mb-4 pb-4 border-b border-accent/20">
            Categories
          </h3>
          <nav className="flex flex-col gap-2">
            {FAQ_DATA.map((category) => (
              <button
                key={category.id}
                onClick={() => scrollToCategory(category.id)}
                className={`flex items-center gap-3 text-left py-3 px-4 rounded-xl transition-all duration-300 ${
                  (!searchQuery && activeCategory === category.id)
                    ? 'bg-primary text-secondary font-medium shadow-md scale-[1.02]' 
                    : 'text-dark/70 hover:bg-secondary hover:text-primary'
                }`}
              >
                <span className={(!searchQuery && activeCategory === category.id) ? 'text-accent' : 'text-primary/50'}>
                  {category.icon}
                </span>
                {category.category}
              </button>
            ))}
          </nav>
        </aside>

        {/* MAIN FAQ CONTENT */}
        <div className="flex-1 w-full max-w-3xl">
          {filteredData.length === 0 ? (
            <div className="bg-white p-10 rounded-2xl text-center border border-accent/10 shadow-sm">
              <Search size={48} className="mx-auto text-accent/30 mb-4" />
              <h3 className="font-heading text-2xl text-primary font-bold mb-2">No results found</h3>
              <p className="text-dark/60 font-body">We couldn't find any FAQs matching "{searchQuery}". Please try different keywords or contact support.</p>
            </div>
          ) : (
            <div className="space-y-12">
              {filteredData.map((category) => (
                <section key={category.id} id={category.id} className="scroll-mt-32">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-accent/10 p-2.5 rounded-xl text-accent hidden lg:block">
                      {category.icon}
                    </div>
                    <h2 className="font-heading text-2xl md:text-3xl text-primary font-bold">
                      {category.category}
                    </h2>
                  </div>
                  
                  <div className="space-y-4">
                    {category.questions.map((item, idx) => {
                      const uniqueId = `${category.id}-${idx}`;
                      const isOpen = openQuestionId === uniqueId;
                      
                      return (
                        <div 
                          key={uniqueId}
                          className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${
                            isOpen ? 'border-accent shadow-md' : 'border-accent/10 shadow-sm hover:border-accent/30 hover:shadow-md'
                          }`}
                        >
                          <button
                            onClick={() => toggleQuestion(uniqueId)}
                            className="w-full text-left p-5 md:p-6 flex justify-between items-center gap-4 group"
                          >
                            <h3 className={`font-heading text-lg md:text-xl transition-colors ${
                              isOpen ? 'text-accent font-bold' : 'text-primary font-semibold group-hover:text-accent'
                            }`}>
                              {item.q}
                            </h3>
                            <div className={`p-1.5 rounded-full transition-colors flex-shrink-0 ${
                              isOpen ? 'bg-accent/10 text-accent' : 'bg-secondary text-primary group-hover:bg-accent/10 group-hover:text-accent'
                            }`}>
                              {isOpen ? <Minus size={20} /> : <Plus size={20} />}
                            </div>
                          </button>
                          
                          <div 
                            className={`px-5 md:px-6 overflow-hidden transition-all duration-500 ease-in-out ${
                              isOpen ? 'max-h-96 opacity-100 pb-6' : 'max-h-0 opacity-0 pb-0'
                            }`}
                          >
                            <div className="h-px w-full bg-accent/10 mb-4"></div>
                            <p className="text-dark/80 font-body leading-relaxed">
                              {item.a}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* TRUST ELEMENTS SECTION */}
      <div className="bg-white py-16 border-y border-accent/10 mt-8">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="text-center mb-10">
            <h2 className="font-heading text-3xl md:text-4xl text-primary font-bold mb-4">
              Why Customers Trust Rajdhyaan
            </h2>
            <div className="h-1 w-20 bg-accent mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-4 text-center">
            {[
              { icon: <Leaf />, title: 'Direct from farmers' },
              { icon: <RefreshCcw />, title: 'Traditional processing' },
              { icon: <ShieldCheck />, title: 'No chemicals' },
              { icon: <Award />, title: 'Consistent quality' },
              { icon: <ThumbsUp />, title: 'Trusted wholesale' }
            ].map((trust, idx) => (
              <div key={idx} className="flex flex-col items-center p-4 group">
                <div className="bg-secondary w-16 h-16 rounded-full flex items-center justify-center text-accent mb-4 group-hover:scale-110 group-hover:bg-accent group-hover:text-white transition-all duration-300 shadow-sm">
                  {React.cloneElement(trust.icon, { size: 28 })}
                </div>
                <h4 className="font-heading font-bold text-primary text-sm md:text-base leading-snug">
                  {trust.title}
                </h4>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BOTTOM CTA SECTION */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-20 text-center">
        <div className="bg-primary text-secondary p-8 md:p-12 rounded-3xl relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 opacity-5 transform translate-x-1/4 -translate-y-1/4">
            <MessageCircle size={200} />
          </div>
          <div className="relative z-10">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              Still Have Questions?
            </h2>
            <p className="font-body text-secondary/80 text-lg mb-8 max-w-lg mx-auto">
              Our dedicated support team is here to help you with any inquiries regarding our products, wholesale orders, or shipping.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                href="/contact" 
                className="bg-white text-primary px-8 py-3.5 rounded-full font-bold font-body hover:bg-secondary hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
              >
                <Mail size={18} />
                Contact Us
              </Link>
              <a 
                href="https://wa.me/917060443349" 
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-500 text-white px-8 py-3.5 rounded-full font-bold font-body hover:bg-green-600 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-500/30"
              >
                <MessageCircle size={18} />
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
