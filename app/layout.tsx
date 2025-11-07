import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import dynamic from 'next/dynamic';



const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['300', '400', '500', '600', '700', '800', '900']
});

export const metadata: Metadata = {
  title: 'UPSC CSE Tracker | Elite Preparation Dashboard',
  description: 'Sophisticated UPSC Civil Services preparation platform with intelligent progress tracking, analytics, and personalized insights for serious aspirants.',
  keywords: 'UPSC, Civil Services, IAS, IPS, IFS, preparation, tracker, analytics, dashboard',
  authors: [{ name: 'UPSC Tracker Team' }],

  openGraph: {
    title: 'UPSC CSE Tracker | Elite Preparation Dashboard',
    description: 'Sophisticated UPSC Civil Services preparation platform',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UPSC CSE Tracker',
    description: 'Elite preparation dashboard for UPSC aspirants',
  },

};

export const viewport = {
  width: 'device-width',
  initialScale: 1
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-body antialiased min-h-screen overflow-x-hidden">
        <main className="relative min-h-screen">
          {children}

        </main>
      </body>
    </html>
  );
}