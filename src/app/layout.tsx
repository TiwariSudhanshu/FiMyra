import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "FiMyra - Unlock Your Health Aura Today",
    template: "%s | FiMyra - Health & Nutrition Tracking"
  },
  description: "Track nutrients, understand your mood, and reach your health goals effortlessly with FiMyra. Get personalized Aura Score, mood tracking, and smart food swap suggestions.",
  keywords: [
    "health tracking",
    "nutrition app",
    "mood tracking",
    "aura score",
    "food diary",
    "wellness app",
    "health goals",
    "nutrient tracking",
    "food mood connection",
    "healthy lifestyle",
    "diet tracking",
    "health analytics",
    "wellness insights",
    "personalized nutrition"
  ],
  authors: [{ name: "FiMyra Team" }],
  creator: "FiMyra",
  publisher: "FiMyra",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://fimyra.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://fimyra.com',
    title: 'FiMyra - Unlock Your Health Aura Today',
    description: 'Track nutrients, understand your mood, and reach your health goals effortlessly with FiMyra. Get personalized Aura Score, mood tracking, and smart food swap suggestions.',
    siteName: 'FiMyra',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'FiMyra - Health & Nutrition Tracking App',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FiMyra - Unlock Your Health Aura Today',
    description: 'Track nutrients, understand your mood, and reach your health goals effortlessly with FiMyra.',
    images: ['/twitter-image.jpg'],
    creator: '@fimyra',
    site: '@fimyra',
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
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'mask-icon', url: '/safari-pinned-tab.svg', color: '#3b82f6' },
    ],
  },
  manifest: '/site.webmanifest',
  category: 'health',
  classification: 'Health & Fitness',
  referrer: 'origin-when-cross-origin',
  applicationName: 'FiMyra',
  appleWebApp: {
    title: 'FiMyra',
    statusBarStyle: 'black-translucent',
    capable: true,
  },
  verification: {
    google: 'google-site-verification-code', // Replace with actual verification code
    // yandex: 'yandex-verification-code', // Add if needed
    // yahoo: 'yahoo-verification-code', // Add if needed
  },
  other: {
    'msapplication-TileColor': '#3b82f6',
    'theme-color': '#3b82f6',
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* DNS prefetch for external resources */}
        <link rel="dns-prefetch" href="https://ui-avatars.com" />
        
        {/* Structured Data - Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "FiMyra",
              "url": "https://fimyra.com",
              "logo": "https://fimyra.com/logo.png",
              "description": "Health and nutrition tracking app that helps you understand your body's needs through personalized Aura Score and mood tracking.",
              "applicationCategory": "HealthApplication",
              "operatingSystem": "Web, iOS, Android",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "ratingCount": "1000"
              }
            })
          }}
        />
        
        {/* Structured Data - WebApplication */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "FiMyra",
              "url": "https://fimyra.com",
              "applicationCategory": "HealthApplication",
              "description": "Track nutrients, understand your mood, and reach your health goals effortlessly with FiMyra.",
              "operatingSystem": "Web Browser",
              "browserRequirements": "Requires JavaScript. Requires HTML5.",
              "softwareVersion": "1.0",
              "author": {
                "@type": "Organization",
                "name": "FiMyra Team"
              },
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              }
            })
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-900 text-white`}
        suppressHydrationWarning
      >
        <noscript>
          <div style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            backgroundColor: '#dc2626', 
            color: 'white', 
            padding: '10px', 
            textAlign: 'center', 
            zIndex: 9999 
          }}>
            JavaScript is required to run FiMyra. Please enable JavaScript in your browser.
          </div>
        </noscript>
        {children}
      </body>
    </html>
  );
}
