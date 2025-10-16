import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NextAuthProvider from "./components/NextAuthProvider";
import PWARegister from "./components/PWARegister";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FiMyra - Health & Nutrition Tracking",
  description: "Track your health and nutrition effortlessly",
  icons: {
    icon: '/logo.png',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'FiMyra',
  },
  themeColor: '#667eea',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
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
        <PWARegister />
        <NextAuthProvider>
          {children}
        </NextAuthProvider>
        <Toaster 
          position="top-right" 
          richColors 
          closeButton
          toastOptions={{
            style: {
              background: 'rgba(17, 24, 39, 0.95)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'white',
            },
          }}
        />
      </body>
    </html>
  );
}
