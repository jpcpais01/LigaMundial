import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/auth/AuthContext';
import AuthModal from '@/components/auth/AuthModal';
import BottomNav from '@/components/layout/BottomNav';

export const metadata: Metadata = {
  title: 'LigaMundial 2026',
  description: 'A tua liga privada de apostas do Mundial FIFA 2026',
  manifest: '/manifest.json',
  icons: { icon: '/favicon.ico' },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'LigaMundial',
  },
  openGraph: {
    title: 'LigaMundial 2026',
    description: 'Liga privada de apostas do Mundial FIFA 2026',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#050714',
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="page-bg football-pattern">
        <AuthProvider>
          <main className="max-w-md mx-auto pb-24">
            {children}
          </main>
          <BottomNav />
          <AuthModal />
        </AuthProvider>
      </body>
    </html>
  );
}
