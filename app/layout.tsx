import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Facebook Page Comments Manager',
  description: 'จัดการและตอบกลับคอมเมนต์จาก Facebook Page',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
