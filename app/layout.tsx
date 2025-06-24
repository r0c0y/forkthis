// app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ForkThis',
  description: 'Find beginner-friendly open source issues with AI help',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-black">{children}</body>
    </html>
  );
}
