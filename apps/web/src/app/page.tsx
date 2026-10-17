'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useSession } from '@/entities/session';

// «/» — по состоянии сессии: авторизован → /dashboard, иначе → /login.
export default function HomePage() {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === 'loading') {
      return;
    }
    router.replace(status === 'authenticated' ? '/dashboard' : '/login');
  }, [router, status]);

  return null;
}
