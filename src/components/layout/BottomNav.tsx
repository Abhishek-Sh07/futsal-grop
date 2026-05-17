'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, CreditCard, Receipt, BarChart3,
  Home, Wallet, Globe, Megaphone, User, Layers
} from 'lucide-react';
import { cn } from '@/lib/utils/format';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const ADMIN_NAV: NavItem[] = [
  { href: '/admin',              label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { href: '/admin/payments',     label: 'Payments',  icon: <CreditCard size={20} /> },
  { href: '/admin/players',      label: 'Players',   icon: <Users size={20} /> },
  { href: '/admin/formations',   label: 'Lineup',    icon: <Layers size={20} /> },
  { href: '/admin/expenses',     label: 'Expenses',  icon: <Receipt size={20} /> },
  { href: '/admin/reports',      label: 'Reports',   icon: <BarChart3 size={20} /> },
];

const PLAYER_NAV: NavItem[] = [
  { href: '/player',                label: 'Home',        icon: <Home size={22} /> },
  { href: '/player/payments',       label: 'My Payments', icon: <Wallet size={22} /> },
  { href: '/player/team',           label: 'Team',        icon: <Globe size={22} /> },
  { href: '/player/announcements',  label: 'Updates',     icon: <Megaphone size={22} /> },
  { href: '/player/profile',        label: 'Profile',     icon: <User size={22} /> },
];

interface BottomNavProps {
  role: 'admin' | 'player';
}

export function BottomNav({ role }: BottomNavProps) {
  const pathname = usePathname();
  const items = role === 'admin' ? ADMIN_NAV : PLAYER_NAV;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[var(--color-border)] safe-bottom">
      <div className="flex items-stretch h-16">
        {items.map(item => {
          const isActive = pathname === item.href || (item.href !== '/admin' && item.href !== '/player' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-0.5 pt-2 pb-1 transition-all duration-150',
                isActive
                  ? 'text-[var(--color-primary)]'
                  : 'text-[var(--color-muted)] hover:text-[var(--color-charcoal)]'
              )}
            >
              <span className={cn(
                'relative transition-transform duration-150',
                isActive && 'scale-110'
              )}>
                {isActive && (
                  <span className="absolute -inset-1.5 bg-[var(--color-primary)]/10 rounded-xl" />
                )}
                <span className="relative">{item.icon}</span>
              </span>
              <span className={cn(
                'text-[10px] font-medium leading-none',
                isActive && 'font-semibold'
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
