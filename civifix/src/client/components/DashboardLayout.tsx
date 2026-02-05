import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSession } from 'modelence/client';
import { useQuery } from '@tanstack/react-query';
import { modelenceQuery } from '@modelence/react-query';
import { Button } from '@/client/components/ui/Button';
import LoadingSpinner from '@/client/components/LoadingSpinner';
import { cn } from '@/client/lib/utils';

type UserProfile = {
  _id: string;
  fullName: string;
  phone: string;
  role: string;
  createdAt: Date;
};

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  isLoading?: boolean;
}

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const citizenNavItems: NavItem[] = [
  {
    path: '/citizen',
    label: 'My Reports',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    path: '/report',
    label: 'Report Issue',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    path: '/map',
    label: 'Map View',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ),
  },
];

const adminNavItems: NavItem[] = [
  {
    path: '/admin',
    label: 'Dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
      </svg>
    ),
  },
  {
    path: '/admin/issues',
    label: 'All Issues',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
  {
    path: '/map',
    label: 'Map View',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ),
  },
];

const technicianNavItems: NavItem[] = [
  {
    path: '/technician',
    label: 'Assigned Issues',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    path: '/map',
    label: 'Map View',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ),
  },
];

const roleColors: Record<string, string> = {
  Citizen: 'bg-forest-100 text-forest-700',
  Admin: 'bg-accent-100 text-accent-700',
  Technician: 'bg-sage-100 text-sage-700',
};

export default function DashboardLayout({ children, title, isLoading = false }: DashboardLayoutProps) {
  const { user } = useSession();
  const location = useLocation();

  const { data: profile } = useQuery({
    ...modelenceQuery<UserProfile | null>('fixnet.getMyProfile'),
    enabled: !!user,
  });

  const navItems = profile?.role === 'Admin' ? adminNavItems :
    profile?.role === 'Technician' ? technicianNavItems : citizenNavItems;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sage-50/30 to-forest-50/20 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-sage-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-forest-500 to-forest-700 rounded-xl flex items-center justify-center shadow-glow transition-transform duration-300 group-hover:scale-105">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-lg text-forest-900">CiviFix</span>
              <p className="text-xs text-sage-500 -mt-0.5">Sustainable Communities</p>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            {profile && (
              <div className="hidden sm:flex items-center gap-3">
                <div className="text-right">
                  <span className="text-sm font-medium text-forest-900 block">{profile.fullName}</span>
                  <span className={cn("text-xs px-2 py-0.5 rounded-full", roleColors[profile.role] || 'bg-sage-100 text-sage-700')}>
                    {profile.role}
                  </span>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-forest-100 to-sage-100 rounded-full flex items-center justify-center text-forest-600 font-semibold">
                  {profile.fullName.charAt(0).toUpperCase()}
                </div>
              </div>
            )}
            <Link to="/logout">
              <Button
                variant="ghost"
                className="text-sage-600 hover:text-forest-700 hover:bg-forest-50 transition-colors"
                size="sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="ml-1 hidden sm:inline">Logout</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-sage-100 sm:hidden overflow-x-auto">
        <div className="flex px-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-1.5 px-4 py-3 text-sm whitespace-nowrap border-b-2 transition-all duration-200",
                location.pathname === item.path
                  ? "border-forest-500 text-forest-700 bg-forest-50/50"
                  : "border-transparent text-sage-600 hover:text-forest-700 hover:bg-sage-50"
              )}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Desktop Sidebar */}
        <aside className="hidden sm:flex w-64 bg-white/60 backdrop-blur-sm border-r border-sage-100 flex-col">
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200",
                  location.pathname === item.path
                    ? "bg-gradient-to-r from-forest-50 to-sage-50 text-forest-700 font-medium shadow-soft border border-forest-100"
                    : "text-sage-600 hover:bg-sage-50 hover:text-forest-700"
                )}
              >
                <span className={cn(
                  "transition-colors",
                  location.pathname === item.path ? "text-forest-600" : ""
                )}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
                {location.pathname === item.path && (
                  <span className="ml-auto w-1.5 h-1.5 bg-forest-500 rounded-full" />
                )}
              </Link>
            ))}
          </nav>

          {/* User info on desktop */}
          {profile && (
            <div className="p-4 border-t border-sage-100 bg-gradient-to-r from-forest-50/50 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-forest-100 to-sage-100 rounded-full flex items-center justify-center text-forest-600 font-semibold text-sm">
                  {profile.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-medium text-forest-900">{profile.fullName}</div>
                  <div className="text-xs text-sage-500">{profile.role}</div>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-6xl mx-auto p-4 sm:p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-forest-900">{title}</h1>
              <div className="h-1 w-12 bg-gradient-to-r from-forest-400 to-accent-400 rounded-full mt-2" />
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <LoadingSpinner />
              </div>
            ) : (
              children
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
