import { Inter } from 'next/font/google';
import './globals.css';
import { NextAuthProvider } from './providers';
import Navbar from './components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Ecom Outfit',
  description: 'Your AI Fashion Assistant',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NextAuthProvider>
          <Navbar />
          {children}
        </NextAuthProvider>
      </body>
    </html>
  );
}
