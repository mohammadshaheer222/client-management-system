'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Plus, Settings } from 'lucide-react';

const navItems = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/leads', icon: Users, label: 'Leads' },
  { href: '/leads/new', icon: Plus, label: 'Add Lead' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav">
      {navItems.map(({ href, icon: Icon, label }) => {
        const isActive =
          href === '/' ? pathname === '/' : pathname.startsWith(href) && href !== '/leads/new'
            ? !pathname.startsWith('/leads/new')
            : pathname === href;

        const active =
          href === '/' ? pathname === '/'
          : href === '/leads/new' ? pathname === '/leads/new'
          : href === '/leads' ? (pathname.startsWith('/leads') && pathname !== '/leads/new')
          : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            className={`nav-item ${active ? 'active' : ''}`}
            aria-label={label}
          >
            <Icon className="nav-item-icon" size={22} />
            <span className="nav-item-label">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
