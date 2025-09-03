import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import { Toaster } from 'react-hot-toast';

// Import YMCA CSS files first
import './ymca-color-palettes.css';
import './ymca-logos.css';
import './ymca-styles.css';

// Import Tailwind CSS last
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'OEA Participant Portal',
  description: 'Self-reporting portal for YMCA Operational Performance Continuums',
  keywords: ['YMCA', 'compliance', 'self-reporting', 'performance', 'continuums'],
  authors: [{ name: 'YMCA of the USA' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'noindex, nofollow', // Remove in production
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full bg-gray-50`}>
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
