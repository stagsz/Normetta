'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore, useUIStore } from '@/lib/store';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { MotionProvider } from '@/components/providers/motion-provider';
import { useSessionTimeout } from '@/hooks/useSessionTimeout';
import { CommandPalette } from '@/components/ui/command-palette';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, hasHydrated } = useAuthStore();
  const { sidebarOpen } = useUIStore();
  const [paletteOpen, setPaletteOpen] = useState(false);

  useSessionTimeout({ enabled: isAuthenticated });

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.push('/login');
    }
  }, [hasHydrated, isAuthenticated, router]);

  useEffect(() => {
    const handleOpen = () => setPaletteOpen(true);
    window.addEventListener('open-command-palette', handleOpen);
    return () => window.removeEventListener('open-command-palette', handleOpen);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, []);

  if (!hasHydrated || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[var(--surface-page)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--brand)]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--surface-page)] text-[var(--text-body)]">
      <Sidebar />
      <Header />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      <main
        className={`pt-24 transition-all duration-300 ml-0 ${
          sidebarOpen ? 'md:ml-72' : 'md:ml-16'
        }`}
      >
        {/* keyed on the route so every navigation replays the entrance */}
        <div key={pathname} className="p-4 md:p-8 page-enter">
          {children}
        </div>
        <MotionProvider />
      </main>
    </div>
  );
}
