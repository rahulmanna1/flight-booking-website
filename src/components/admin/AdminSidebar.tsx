'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  Plane,
  Tag,
  Receipt,
  Server,
  BarChart3,
  Settings,
  FileText,
  ChevronLeft,
  ChevronRight,
  Shield,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  superAdminOnly?: boolean;
}

const navigationItems: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    name: 'Users',
    href: '/admin/users',
    icon: Users,
  },
  {
    name: 'Bookings',
    href: '/admin/bookings',
    icon: Plane,
  },
  {
    name: 'Refunds',
    href: '/admin/refunds',
    icon: Receipt,
  },
  {
    name: 'Promo Codes',
    href: '/admin/promo-codes',
    icon: Tag,
  },
  {
    name: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
  },
  {
    name: 'API Providers',
    href: '/admin/providers',
    icon: Server,
  },
  {
    name: 'Audit Logs',
    href: '/admin/audit-logs',
    icon: FileText,
    superAdminOnly: true,
  },
  {
    name: 'System Settings',
    href: '/admin/settings',
    icon: Settings,
    superAdminOnly: true,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { isSuperAdmin } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const filteredItems = navigationItems.filter(item => 
    !item.superAdminOnly || isSuperAdmin
  );

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname?.startsWith(href);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-50 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
      >
        {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-40
          transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-20' : 'w-64'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
            {!isCollapsed && (
              <div className="flex items-center space-x-2">
                <Shield className="w-6 h-6 text-blue-600" />
                <span className="font-bold text-gray-900">Admin Panel</span>
              </div>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:block p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isCollapsed ? (
                <ChevronRight className="w-5 h-5 text-gray-600" />
              ) : (
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-3">
            <ul className="space-y-1">
              {filteredItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={`
                        flex items-center space-x-3 px-3 py-2.5 rounded-lg
                        transition-all duration-200
                        ${active 
                          ? 'bg-blue-50 text-blue-600 font-medium' 
                          : 'text-gray-700 hover:bg-gray-100'
                        }
                        ${isCollapsed ? 'justify-center' : ''}
                      `}
                      title={isCollapsed ? item.name : undefined}
                    >
                      <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-blue-600' : 'text-gray-500'}`} />
                      {!isCollapsed && (
                        <>
                          <span className="flex-1">{item.name}</span>
                          {item.badge && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-600 rounded-full">
                              {item.badge}
                            </span>
                          )}
                          {item.superAdminOnly && (
                            <Shield className="w-4 h-4 text-purple-500" />
                          )}
                        </>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <Link
              href="/dashboard"
              className={`
                flex items-center space-x-3 px-3 py-2.5 rounded-lg
                text-gray-700 hover:bg-gray-100 transition-colors
                ${isCollapsed ? 'justify-center' : ''}
              `}
              title={isCollapsed ? 'Back to User Dashboard' : undefined}
            >
              <ChevronLeft className="w-5 h-5 text-gray-500" />
              {!isCollapsed && <span>Back to Dashboard</span>}
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
