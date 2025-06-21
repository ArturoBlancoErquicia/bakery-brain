import type { Metadata } from 'next';
import { Alegreya } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import AppLayout from '@/components/layout/app-layout';

const alegreya = Alegreya({ 
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Cerebro de Panaderia',
  description: 'Plataforma de pronóstico, optimización y análisis para pastelerías.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${alegreya.className} antialiased`}>
        <AppLayout>
          {children}
        </AppLayout>
        <Toaster />
      </body>
    </html>
  );
}
