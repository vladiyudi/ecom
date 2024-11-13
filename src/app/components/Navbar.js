'use client';

import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ShinyButton from '@/components/ui/shiny-button';
import ShimmerButton from "@/components/ui/shimmer-button";

export default function Navbar({titillium}) {
  const { data: session } = useSession();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  return (
    
      <div className="max-w-7xl mx-auto flex justify-end">
        {session && (
          <ShimmerButton
            onClick={handleLogout}
            className={`border ${titillium.className}`}
          >
            Logout
          </ShimmerButton>
        )}
      </div>
  
  );
}
