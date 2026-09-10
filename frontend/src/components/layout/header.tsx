'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  AlertTriangle,
  Bell,
  CheckCircle,
  ClipboardList,
  Clock,
  Download,
  LogOut,
  Menu,
  Search,
} from 'lucide-react';
import { useAuthStore, useUIStore } from '@/lib/store';
import { orgInviteApi } from '@/lib/api';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { CommandPalette } from '@/components/ui/command-palette';

const placeholderNotifications = [
  {
    id: '1',
    type: 'ncr' as const,
    title: 'NCR requires attention',
    message: 'Non-conformity #NCR-2024-001 is overdue for resolution',
    time: '10 minutes ago',
    read: false,
  },
  {
    id: '2',
    type: 'info' as const,
    title: 'Assessment assigned',
    message: 'You have been assigned as Lead Auditor for Q1 Internal Audit',
    time: '1 hour ago',
    read: false,
  },
  {
    id: '3',
    type: 'success' as const,
    title: 'Corrective action verified',
    message: 'CA-2024-015 has been verified and closed',
    time: '3 hours ago',
    read: true,
  },
  {
    id: '4',
    type: 'info' as const,
    title: 'Assessment due soon',
    message: 'Surveillance Audit is due in 3 days',
    time: '1 day ago',
    read: true,
  },
];

const pageTitles: Record<string, { title: string; subtitle?: string }> = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Overview of your compliance status' },
  '/assessments': { title: 'Self-Assessments', subtitle: 'ISO 9001:2015 Audit Readiness' },
  '/non-conformities': { title: 'Non-Conformities', subtitle: 'Track and resolve findings' },
  '/actions': { title: 'Corrective Actions', subtitle: 'Manage improvement activities' },
  '/reports': { title: 'Reports & Analytics', subtitle: 'Compliance insights and exports' },
  '/standards': { title: 'ISO Standards', subtitle: 'Requirements and clause mapping' },
  '/settings': { title: 'Settings', subtitle: 'Organization and profile settings' },
  '/admin/users': { title: 'Team Access', subtitle: 'Manage user roles and permissions' },
  '/help': { title: 'Help Center', subtitle: 'Guides, FAQ and support' },
};

function getPageInfo(pathname: string) {
  for (const [path, info] of Object.entries(pageTitles)) {
    if (pathname.startsWith(path)) return info;
  }
  return { title: 'Normetta', subtitle: 'Compliance Platform' };
}

function NotificationIcon({ type }: { type: 'warning' | 'info' | 'success' | 'ncr' }) {
  switch (type) {
    case 'ncr':
      return <ClipboardList size={16} className="text-rose-500 dark:text-rose-400" />;
    case 'warning':
      return <AlertTriangle size={16} className="text-[var(--status-obs-fg)]" />;
    case 'success':
      return <CheckCircle size={16} className="text-[var(--brand)]" />;
    default:
      return <Clock size={16} className="text-[var(--blue-100)]" />;
  }
}

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, clearAuth } = useAuthStore();
  const { sidebarOpen, openMobileMenu } = useUIStore();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const [pendingInvites, setPendingInvites] = useState(0);

  const unreadCount = placeholderNotifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (!user) return;
    orgInviteApi.pendingCount()
      .then((res) => setPendingInvites(res.data?.data?.count ?? 0))
      .catch(() => {});
  }, [user]);

  const pageInfo = getPageInfo(pathname ?? '/');

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    }
    if (notificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [notificationsOpen]);

  return (
    <header
      className={`fixed top-0 right-0 z-30 h-24 transition-all duration-300 left-0 md:left-16 ${
        sidebarOpen ? 'md:left-72' : 'md:left-16'
      }`}
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(12px) saturate(1.4)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      <div className="flex items-center justify-between h-full px-4 md:px-8">
        {/* Left: mobile menu + page title */}
        <div className="flex items-center gap-4">
          <button
            onClick={openMobileMenu}
            className="p-2 text-[var(--text-muted)] hover:text-[var(--text-strong)] hover:bg-[var(--surface-sunken)] rounded-xl md:hidden transition-colors"
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>
          <div className="flex flex-col">
            <h2 className="text-xl md:text-2xl font-medium text-[var(--text-strong)] tracking-tight">
              {pageInfo.title}
            </h2>
            {pageInfo.subtitle && (
              <p className="text-sm text-[var(--text-muted)] font-medium mt-0.5 hidden sm:block">
                {pageInfo.subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right: search, notifications, export, logout */}
        <div className="flex items-center gap-3 md:gap-6">
          {/* Search */}
          <div className="relative group hidden lg:block">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-subtle)] group-focus-within:text-[var(--brand)] transition-colors"
            />
            <button
              id="search-launcher"
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.dispatchEvent(new CustomEvent('open-command-palette'));
              }}
              className="w-56 xl:w-72 bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-full py-2.5 pl-11 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-[var(--border-focus)] transition-all placeholder:text-[var(--text-subtle)] text-left text-[var(--text-subtle)]"
              placeholder="Search"
            >
              Search clauses, findings...
            </button>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <kbd className="bg-[var(--surface-sunken)] text-[var(--text-subtle)] border border-[var(--border-subtle)] rounded px-1.5 py-0.5 text-[10px] font-bold">
                Ctrl
              </kbd>
              <kbd className="bg-[var(--surface-sunken)] text-[var(--text-subtle)] border border-[var(--border-subtle)] rounded px-1.5 py-0.5 text-[10px] font-bold">
                K
              </kbd>
            </div>
          </div>

          <div
            className="hidden lg:block"
            style={{ position: 'absolute', visibility: 'hidden', height: 0, overflow: 'hidden' } as any}
          >
            <input
              id="search-real-input"
              className="bg-transparent outline-none"
              placeholder="Search"
              autoComplete="off"
            />
          </div>

          {/* Mobile search */}
          <button className="p-2 text-[var(--text-muted)] hover:text-[var(--text-strong)] hover:bg-[var(--surface-sunken)] rounded-xl lg:hidden transition-colors">
            <Search size={20} />
          </button>

          {/* Notifications */}
          <div className="ml-auto flex items-center gap-3 md:gap-4">
            <div className="hidden xl:flex flex-col items-end">
              <p className="text-sm font-semibold text-[var(--text-strong)]">
                {(user?.organization?.name) || 'Organization'}
              </p>
              <p className="text-xs text-[var(--text-muted)] font-medium">
                {(user?.role ?? '').replace(/_/g, ' ')}
              </p>
            </div>
            <div className="hidden xl:block h-9 w-px bg-[var(--border-subtle)]" />
            <ThemeToggle />
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="w-10 h-10 rounded-full bg-[var(--surface-card)] border border-[var(--border-subtle)] flex items-center justify-center relative hover:border-[var(--brand)] hover:text-[var(--brand)] transition-colors"
              aria-label="Notifications"
              aria-expanded={notificationsOpen}
            >
              <Bell size={18} className="text-[var(--text-body)]" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-[var(--status-fail-solid)] text-white text-[10px] font-bold rounded-full border-2 border-[var(--surface-card)] px-1">
                  {unreadCount}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[var(--surface-card)] rounded-2xl shadow-[var(--shadow-lg)] border border-[var(--border-subtle)] overflow-hidden z-50 animate-enter">
                <div className="px-4 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between">
                  <h3 className="font-bold text-[var(--text-strong)]">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="text-xs font-bold text-[var(--brand-strong)] bg-[var(--brand-soft)] px-2 py-0.5 rounded-full">
                      {unreadCount} unread
                    </span>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto">
                  <ul>
                    {placeholderNotifications.map((notification) => (
                      <li
                        key={notification.id}
                        className={`px-4 py-3 hover:bg-[var(--surface-sunken)] cursor-pointer border-b border-[var(--border-subtle)] last:border-b-0 transition-colors ${
                          !notification.read ? 'bg-[var(--brand-soft)]' : ''
                        }`}
                        onClick={() => setNotificationsOpen(false)}
                      >
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 mt-0.5">
                            <NotificationIcon type={notification.type} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm ${!notification.read ? 'font-bold text-[var(--text-strong)]' : 'text-[var(--text-body)]'}`}>
                              {notification.title}
                            </p>
                            <p className="text-sm text-[var(--text-muted)] truncate">{notification.message}</p>
                            <p className="text-xs text-[var(--text-subtle)] mt-1">{notification.time}</p>
                          </div>
                          {!notification.read && (
                            <span className="w-2 h-2 bg-[var(--brand)] rounded-full block flex-shrink-0 mt-2" />
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="px-4 py-3 border-t border-[var(--border-subtle)] bg-[var(--surface-sunken)]">
                  <button className="w-full text-sm text-[var(--brand)] hover:text-[var(--brand-strong)] font-bold transition-colors">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Export button */}
          <button className="hidden xl:flex bg-[var(--brand)] hover:bg-[var(--brand-strong)] text-[var(--text-on-brand)] px-6 py-2.5 rounded-full font-bold text-sm shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] transition-all items-center gap-2 transform hover:-translate-y-0.5">
            <Download size={16} />
            Export Report
          </button>

          {/* Pending invites bell */}
          <Link
            href="/admin/invites"
            className="relative w-11 h-11 rounded-full bg-[var(--surface-card)] shadow-[var(--shadow-sm)] border border-[var(--border-subtle)] flex items-center justify-center hover:bg-[var(--surface-sunken)] transition-colors"
            aria-label="Pending invites"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[var(--text-body)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {pendingInvites > 0 && (
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[var(--status-fail-solid)] rounded-full border border-[var(--surface-card)]" />
            )}
          </Link>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-11 h-11 rounded-full bg-[var(--surface-card)] shadow-[var(--shadow-sm)] border border-[var(--border-subtle)] flex items-center justify-center hover:bg-[var(--status-fail-bg)] hover:border-[var(--status-fail-line)] hover:text-[var(--status-fail-fg)] text-[var(--text-muted)] transition-colors"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
