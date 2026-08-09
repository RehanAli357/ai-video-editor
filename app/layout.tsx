import type { Metadata } from 'next';
import './globals.css';
import { ModalProvider } from '@/components/common/modal/modal-provider';
import { ToastContainer } from 'react-toastify';
import Providers from './providers';

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
        <ToastContainer style={{ zIndex: 10000 }} />
        <ModalProvider>
          <Providers>{children}</Providers>
        </ModalProvider>
      </body>
    </html>
  );
}
