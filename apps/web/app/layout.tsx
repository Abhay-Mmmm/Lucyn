import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/providers';

export const metadata: Metadata = {
  title: 'Lucyn - AI Product Engineer',
  description: 'The AI Product Engineer that works inside your company',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Critical CSS inlined to prevent FOUT - font is set before any content renders */}
        <style dangerouslySetInnerHTML={{ __html: `
          @font-face {
            font-family: 'Milanesa Serif';
            src: url('/fonts/Milaness.otf') format('opentype');
            font-weight: 400;
            font-style: normal;
            font-display: block;
          }
          html, body, * {
            font-family: 'Milanesa Serif' !important;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
        ` }} />
      </head>
      <body className="font-serif antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
