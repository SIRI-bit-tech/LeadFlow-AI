import type { Metadata } from 'next';
// import { Inter } from 'next/font/google';
import './globals.css';

// const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'LeadFlow AI - Intelligent Lead Qualification Platform',
  description: 'AI-powered B2B lead qualification platform that automatically qualifies, scores, and routes leads through intelligent conversations.',
  keywords: 'lead qualification, AI, B2B, sales automation, lead scoring',
  authors: [{ name: 'LeadFlow AI Team' }],
  viewport: 'width=device-width, initial-scale=1',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/logo-icon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans">
        <div id="root">{children}</div>
      </body>
    </html>
  );
}