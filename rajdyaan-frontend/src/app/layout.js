// ---------------------------------------------------------------------------
// Root Layout — wraps every page
// ---------------------------------------------------------------------------
import '../styles/globals.css';
import NextTopLoader from 'nextjs-toploader';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageTransition from '@/components/layout/PageTransition';
import ToastProvider from '@/components/layout/ToastProvider';

export const metadata = {
  title: 'Rajdhyaan™ | Royal Desi Sweetener — Premium Organic Honey, Ghee & Jaggery',
  description:
    'Shop 100% pure, lab-tested organic products — honey, ghee, jaggery & cold-pressed oils. No chemicals, no shortcuts. Trusted by Indian families. Free shipping above ₹499.',
  keywords: [
    'organic honey',
    'desi ghee',
    'jaggery',
    'cold pressed oil',
    'rajdhyaan',
    'premium indian food',
    'natural sweetener',
  ],
  openGraph: {
    title: 'Rajdhyaan™ | Royal Desi Sweetener',
    description: 'Pure, lab-tested organic products sourced from Indian farmlands.',
    type: 'website',
    locale: 'en_IN',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="flex min-h-screen flex-col bg-secondary font-body text-dark antialiased">
        <NextTopLoader 
          color="#B5922A"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #B5922A,0 0 5px #B5922A"
        />
        <Navbar />
        <main className="flex-grow">
          <PageTransition>
            {children}
          </PageTransition>
        </main>
        <Footer />
        <ToastProvider />
      </body>
    </html>
  );
}
