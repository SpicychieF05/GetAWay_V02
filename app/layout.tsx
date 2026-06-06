import type {Metadata} from 'next';
import { Inter, JetBrains_Mono, Space_Grotesk } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-display' });

export const metadata: Metadata = {
  title: 'GetAWay',
  description: 'AI-powered browser-native interview proctoring platform.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable} ${spaceGrotesk.variable} dark`} suppressHydrationWarning>
      <body suppressHydrationWarning className="bg-background text-text-primary antialiased min-h-screen border-border selection:bg-brand-primary/30">
        {children}
      </body>
    </html>
  );
}
