import { Inter } from 'next/font/google';
import './globals.css';
import { NextAuthProvider } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'KNBL FSHN',
  description: 'Your AI Fashion Assistant',
  icons: {
    icon: '/knbl.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NextAuthProvider>
          {children}
        </NextAuthProvider>
      </body>
    </html>
  );
}
