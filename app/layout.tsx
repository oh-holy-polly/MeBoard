import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MeBoard | Personal Productivity',
  description: 'Telegram-first productivity dashboard',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
