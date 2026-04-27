import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-grotesk',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://visapath-guides.web.app'), // Replace with your actual domain
  title: {
    default: 'VisaPath Guides | Expert Visa Acquisition Resources',
    template: '%s | VisaPath Guides',
  },
  description: 'Master your international relocation with expert-authored visa acquisition guides. Step-by-step roadmaps for the UK Skilled Worker, US H1-B, Canada Work Permits, and EU Blue Cards.',
  keywords: ['visa guide', 'work permit', 'skilled worker visa', 'digital nomad visa', 'relocation guide', 'H1-B visa', 'UK visa help', 'Canada immigration'],
  authors: [{ name: 'VisaPath Experts' }],
  creator: 'VisaPath Guides',
  publisher: 'VisaPath Guides',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://visapath-guides.web.app',
    siteName: 'VisaPath Guides',
    title: 'VisaPath Guides | Expert Visa Acquisition Resources',
    description: 'Confidently navigate international borders with our comprehensive, expert-authored visa acquisition guides.',
    images: [
      {
        url: '/og-image.jpg', // You should place an OG image in public folder
        width: 1200,
        height: 630,
        alt: 'VisaPath Guides',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VisaPath Guides | Expert Visa Acquisition Resources',
    description: 'Master your international relocation with expert-authored visa acquisition guides.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="font-body antialiased min-h-screen">
        <FirebaseClientProvider>
          {children}
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
