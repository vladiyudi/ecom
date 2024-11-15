import { Inter } from 'next/font/google';
import './globals.css';
import { NextAuthProvider } from './providers';


const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'KNBL FSHN',
  description: 'Your AI Fashion Assistant',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        <NextAuthProvider>
          {children}
        </NextAuthProvider>
      </body>
    </html>
  );
}
