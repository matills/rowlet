import type { Metadata } from 'next';
import { Limelight, Josefin_Sans } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const limelight = Limelight({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const josefinSans = Josefin_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Owlist - Track Your Movies, Series & Anime',
  description:
    'A vintage-styled tracking app for movies, series, and anime with a retro cartoon aesthetic inspired by Cuphead',
  keywords: ['movies', 'series', 'anime', 'tracking', 'watchlist', 'reviews'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${josefinSans.variable} ${limelight.variable} font-sans antialiased`}
      >
        <Providers>{children}</Providers>
        {/* Film grain effect */}
        <div className="film-grain" aria-hidden="true" />
        {/* Sepia vignette overlay */}
        <div className="sepia-overlay" aria-hidden="true" />
      </body>
    </html>
  );
}
