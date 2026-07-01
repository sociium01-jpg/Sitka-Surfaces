'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminIndex() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center text-xs font-mono tracking-wider uppercase text-stone-dim">
      Redirecting to dashboard...
    </div>
  );
}
