import { LayoutDashboard, Video, BarChart2, Settings, FileText } from 'lucide-react';
import Link from 'next/link';

interface SidebarProps {
  /** The authenticated recruiter's email address, used to display identity. */
  userEmail?: string;
}

export function Sidebar({ userEmail }: SidebarProps) {
  const links = [
    { name: 'Overview', href: '/recruiter', icon: LayoutDashboard },
    { name: 'Sessions', href: '/recruiter/sessions', icon: Video },
    { name: 'Reports', href: '/recruiter/reports', icon: FileText },
    { name: 'Analytics', href: '/recruiter/analytics', icon: BarChart2 },
    { name: 'Settings', href: '/recruiter/settings', icon: Settings },
  ];

  // Derive the avatar initial from the user's email, fallback to 'R'.
  const avatarInitial = userEmail ? userEmail[0].toUpperCase() : 'R';
  const displayLabel = userEmail ?? 'Recruiter';

  return (
    <aside className="w-64 border-r border-border bg-surface-base h-screen flex flex-col p-6 shrink-0">
      <div className="flex items-center space-x-2 mb-10 pl-1">
        <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center">
          <span className="text-black font-black font-display text-lg">GW</span>
        </div>
        <span className="text-xl font-display font-semibold text-text-primary tracking-tight">GetAWay</span>
      </div>

      <nav className="flex-1 space-y-1.5">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.name}
              href={link.href}
              className="flex items-center space-x-3 px-3 py-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors font-medium text-sm"
            >
              <Icon className="w-4 h-4" />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-4 border-t border-border flex items-center space-x-3 min-w-0">
        <div className="w-8 h-8 rounded-full bg-surface-hover border border-border flex items-center justify-center text-xs font-mono font-medium text-brand-accent shrink-0">
          {avatarInitial}
        </div>
        <div className="flex flex-col min-w-0">
          <span
            className="text-sm font-medium text-text-primary truncate"
            title={displayLabel}
          >
            {displayLabel}
          </span>
          <span className="text-[10px] text-text-secondary uppercase tracking-widest font-medium">
            Verified
          </span>
        </div>
      </div>
    </aside>
  );
}

