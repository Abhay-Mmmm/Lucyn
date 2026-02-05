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
        {/* Critical CSS - Load both fonts before content renders */}
        <style dangerouslySetInnerHTML={{ __html: `
          @font-face {
            font-family: 'Grenda';
            src: url('/fonts/grenda.otf') format('opentype');
            font-weight: 400;
            font-style: normal;
            font-display: swap;
          }
          @font-face {
            font-family: 'Milanesa Serif';
            src: url('/fonts/Milaness.otf') format('opentype');
            font-weight: 400;
            font-style: normal;
            font-display: block;
          }
          html, body {
            font-family: 'Grenda', system-ui, sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          .font-display {
            font-family: 'Milanesa Serif', Georgia, serif !important;
          }
        ` }} />
      </head>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
