import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import TopNav from '../components/TopNav';

const space = localFont({
  src: '../assets/fonts/SpaceGrotesk-Variable.woff2',
  variable: '--font-sans',
  display: 'swap',
  weight: '300 700',
  style: 'normal'
});

const fraunces = localFont({
  src: '../assets/fonts/Fraunces-Variable.woff2',
  variable: '--font-serif',
  display: 'swap',
  weight: '100 900',
  style: 'normal'
});

export const metadata: Metadata = {
  title: 'Task Atlas',
  description: 'Modern task management for teams and individuals.'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${space.variable} ${fraunces.variable}`}>
      <body>
        <TopNav />
        {children}
      </body>
    </html>
  );
}
