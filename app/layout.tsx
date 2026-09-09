import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'SNAPSULE — little moments, kept forever.',
  description:
    'Step into a little red photobooth. Capture, decorate, and print your own memories. Your photos stay on your device.',
  icons: { icon: '/assets/logo-mark.svg' },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
