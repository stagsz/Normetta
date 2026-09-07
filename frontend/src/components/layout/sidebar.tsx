'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import {
  LayoutDashboard,
  ClipboardCheck,
  AlertTriangle,
  FileText,
  Settings,
  Users,
  BarChart3,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  X,
  HelpCircle,
  ShieldCheck,
} from 'lucide-react';
import { useUIStore, useAuthStore } from '@/lib/store';

const mainNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Self-Assessment', href: '/assessments', icon: ClipboardCheck },
  { name: 'Non-Conformities', href: '/non-conformities', icon: AlertTriangle, badge: 'count' },
  { name: 'Corrective Actions', href: '/actions', icon: FileText },
  { name: 'Reports & Analytics', href: '/reports', icon: BarChart3 },
  { name: 'Standards', href: '/standards', icon: BookOpen },
];

const settingsNavigation = [
  { name: 'Team Access', href: '/admin/users', icon: Users, admin: true },
  { name: 'Organization Profile', href: '/settings', icon: Settings },
  { name: 'Help', href: '/help', icon: HelpCircle },
];

type NavItem = typeof mainNavigation[0] & { badge?: string; admin?: boolean };

function NavLink({ item, isMobile = false }: { item: NavItem; isMobile?: boolean }) {
  const pathname = usePathname();
  const { sidebarOpen } = useUIStore();
  const isActive = (pathname ?? '').startsWith(item.href);
  const showLabel = sidebarOpen || isMobile;

  return (
    <Link
      href={item.href}
      className={clsx(
        'flex items-center py-3 rounded-2xl transition-all duration-200 group relative',
        showLabel ? 'gap-3 px-4' : 'justify-center px-2',
        isActive
          ? 'bg-[var(--brand-soft)] text-[var(--text-link)] shadow-[var(--shadow-sm)]'
          : 'text-[var(--text-muted)] hover:bg-[var(--surface-raised)] hover:text-[var(--text-body)]'
      )}
    >
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-[var(--brand)] rounded-r-full" />
      )}
      <item.icon
        size={20}
        className={clsx(
          'flex-shrink-0 transition-colors',
          isActive ? 'text-[var(--brand)]' : 'group-hover:text-[var(--brand)]'
        )}
      />
      {showLabel && (
        <>
          <span className={clsx(
            'text-sm font-semibold',
            isActive ? 'text-[var(--text-link)]' : 'text-[var(--text-muted)]'
          )}>
            {item.name}
          </span>
          {isActive && item.badge === 'count' && (
            <span className="ml-auto bg-[var(--brand-soft)] text-[var(--brand-strong)] py-0.5 px-2 rounded-full text-[10px] font-bold">
              ACTIVE
            </span>
          )}
        </>
      )}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, mobileMenuOpen, toggleSidebar, closeMobileMenu } = useUIStore();
  const { user } = useAuthStore();

  const isAdmin = user?.role === 'SYSTEM_ADMIN' || user?.role === 'QUALITY_MANAGER';

  useEffect(() => {
    closeMobileMenu();
  }, [pathname, closeMobileMenu]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMobileMenu();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [closeMobileMenu]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const NavContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className={`flex h-full flex-col border-r border-[var(--border-subtle)] pt-8 pb-6 ${sidebarOpen || isMobile ? 'px-5' : 'px-2'}`} style={{ background: 'var(--sidebar-bg)' }}>
      {/* Logo */}
      <div className={`flex px-3 mb-10 ${sidebarOpen || isMobile ? 'items-center justify-between' : 'flex-col items-center gap-3 px-0'}`}>
        <div className="flex items-center gap-3 cursor-pointer">
          <div className="w-10 h-10 rounded-2xl bg-[var(--brand)] shadow-[var(--shadow-lg)] flex items-center justify-center text-[var(--text-on-brand)] flex-shrink-0">
            <ShieldCheck size={22} />
          </div>
          {(sidebarOpen || isMobile) && (
            <div>
              <h1 className="font-bold text-lg tracking-tight text-[var(--text-strong)] leading-tight">Normetta</h1>
              <p className="text-xs text-[var(--text-muted)] font-medium">Compliance Platform</p>
            </div>
          )}
        </div>
        {isMobile ? (
          <button
            onClick={closeMobileMenu}
            className="p-2 text-[var(--text-muted)] hover:text-[var(--text-strong)] hover:bg-[var(--surface-sunken)] rounded-xl transition-colors"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        ) : (
          <button
            onClick={toggleSidebar}
            className="p-2 text-[var(--text-muted)] hover:text-[var(--text-strong)] hover:bg-[var(--surface-sunken)] rounded-xl transition-colors hidden md:flex"
          >
            {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
        )}
      </div>

      {/* New assessment CTA */}
      {sidebarOpen && (
        <div className="px-4 mb-4">
          <Link
            href="/assessments/new"
            className="flex items-center justify-center gap-2 rounded-full bg-[var(--brand)] px-4 py-2.5 text-sm font-semibold text-[var(--text-on-brand)] shadow-[var(--shadow-sm)] hover:bg-[var(--brand-strong)] transition-colors"
          >
            <ClipboardCheck size={16} />
            New assessment
          </Link>
        </div>
      )}

      {/* Main Menu */}
      <nav className="flex-1 space-y-2 overflow-y-auto">
        {(sidebarOpen || isMobile) && (
          <div className="px-3 mb-2">
            <p className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-subtle)]">Main Menu</p>
          </div>
        )}
        {mainNavigation.map((item) => (
          <NavLink key={item.name} item={item} isMobile={isMobile} />
        ))}

        {/* Settings section */}
        {(sidebarOpen || isMobile) && (
          <div className="px-3 mb-2 mt-8">
            <p className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-subtle)]">Settings</p>
          </div>
        )}
        {settingsNavigation
          .filter((item) => !item.admin || isAdmin)
          .map((item) => (
            <NavLink key={item.name} item={item} isMobile={isMobile} />
          ))}
      </nav>

      {/* User card */}
      {user && (sidebarOpen || isMobile) && (
        <div className="mt-auto bg-[var(--surface-card)] rounded-3xl p-4 shadow-[var(--shadow-sm)] border border-[var(--border-subtle)] flex items-center gap-3 cursor-pointer hover:shadow-[var(--shadow-md)] transition-shadow">
          <div className="w-10 h-10 rounded-full bg-[var(--brand)] flex items-center justify-center text-[var(--text-on-brand)] text-sm font-bold flex-shrink-0 border-2 border-[var(--surface-card)] shadow-[var(--shadow-sm)]">
            {user.firstName[0]}{user.lastName[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-[var(--text-strong)] truncate">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs text-[var(--text-muted)] truncate">
              {(user.role ?? '').replace(/_/g, ' ')}
            </p>
          </div>
          <ChevronUp size={16} className="text-[var(--text-subtle)] flex-shrink-0" />
        </div>
      )}

      {/* Collapsed user avatar */}
      {user && !sidebarOpen && !isMobile && (
        <div className="mt-auto flex justify-center">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--brand)] to-[var(--brand-strong)] flex items-center justify-center text-[var(--text-on-brand)] text-sm font-bold border-2 border-[var(--sidebar-bg)] shadow-[var(--shadow-sm)]">
            {user.firstName[0]}{user.lastName[0]}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] md:hidden"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}

      {/* Desktop sidebar */}
      <aside
        className={clsx(
          'fixed left-0 top-0 z-50 h-screen transition-all duration-300',
          'hidden md:block',
          sidebarOpen ? 'md:w-72' : 'md:w-16'
        )}
      >
        <NavContent />
      </aside>

      {/* Mobile drawer */}
      <aside
        className={clsx(
          'fixed left-0 top-0 z-50 h-screen w-72 transition-transform duration-300 ease-in-out md:hidden',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <NavContent isMobile />
      </aside>
    </>
  );
}
