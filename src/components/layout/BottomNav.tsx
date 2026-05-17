'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard, Users, CreditCard, Receipt, BarChart3,
  Home, Wallet, Globe, Megaphone, User, Layers, UsersRound
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
  { href: '/player',                label: 'Home',        icon: <Home size={20} /> },
  { href: '/player/payments',       label: 'Payments',    icon: <Wallet size={20} /> },
  { href: '/player/formations',     label: 'Lineup',      icon: <Layers size={20} /> },
  { href: '/player/team',           label: 'Team',        icon: <UsersRound size={20} /> },
  { href: '/player/profile',        label: 'Profile',     icon: <User size={20} /> },
];

interface BottomNavProps {
  role: 'admin' | 'player';
}

export function BottomNav({ role }: BottomNavProps) {
  const pathname = usePathname();
  const [tapped, setTapped] = useState<string | null>(null);
  const items = role === 'admin' ? ADMIN_NAV : PLAYER_NAV;

  // Clear tapped state when navigation completes
  useEffect(() => { setTapped(null); }, [pathname]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[var(--color-border)] safe-bottom">
      <div className="flex items-stretch h-16">
        {items.map(item => {
          const isActive = pathname === item.href || (item.href !== '/admin' && item.href !== '/player' && pathname.startsWith(item.href));
          const isTapped = tapped === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onMouseDown={() => setTapped(item.href)}
              onTouchStart={() => setTapped(item.href)}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-0.5 pt-2 pb-1 transition-all duration-100 select-none',
                isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-muted)]',
                isTapped && !isActive && 'text-[var(--color-primary)] scale-95 opacity-70',
              )}
            >
              <span className={cn(
                'relative transition-all duration-100',
                (isActive || isTapped) && 'scale-110'
              )}>
                {(isActive || isTapped) && (
                  <span className="absolute -inset-1.5 bg-[var(--color-primary)]/10 rounded-xl" />
                )}
                <span className="relative">{item.icon}</span>
              </span>
              <span className={cn(
                'text-[10px] leading-none transition-all duration-100',
                (isActive || isTapped) ? 'font-semibold' : 'font-medium'
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
