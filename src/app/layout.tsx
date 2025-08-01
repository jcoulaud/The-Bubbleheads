import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import LayoutWrapper from './components/LayoutWrapper';
import './globals.css';

// Configure Inter font with optimal settings for performance
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'The Bubbleheads Generator',
  description:
    'Transform your photos into epic space adventures. Create custom astronaut helmet overlays for The Bubbleheads community on Jupiter.',
  keywords:
    'bubbleheads, jupiter, JUP, crypto, NFT, avatar generator, helmet overlay, photo editor',
  authors: [{ name: 'The Bubbleheads' }],
  openGraph: {
    title: 'The Bubbleheads Generator',
    description:
      'Transform your photos into epic space adventures. Create custom astronaut helmet overlays for The Bubbleheads community.',
    type: 'website',
    images: ['/helmet.png'],
    url: 'https://x.com/TheBubble_Heads',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Bubbleheads Generator',
    description: 'Transform your photos into epic space adventures with custom helmet overlays.',
    images: ['/helmet.png'],
    creator: '@TheBubble_Heads',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' className='scroll-smooth' suppressHydrationWarning>
      <body
        className={`${inter.variable} antialiased selection:bg-blue-600 selection:text-white font-sans bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100`}>
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
