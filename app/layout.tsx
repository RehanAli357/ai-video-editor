import type { Metadata } from 'next';
import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import { ModalProvider } from '@/components/common/modal/modal-provider';

export const metadata: Metadata = {
  title: 'Cutaway | AI Video Editor',
  description: 'A simple AI video editor built with Next.js, Tailwind CSS, Remotion and OpenAI.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ClerkProvider>
          <ModalProvider>{children}</ModalProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
