'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import AdminSidebar from './AdminSidebar';
import { ChevronRight, Home } from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

const pathNameMap: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/users': 'Users',
  '/admin/bookings': 'Bookings',
  '/admin/refunds': 'Refunds',
  '/admin/promo-codes': 'Promo Codes',
  '/admin/analytics': 'Analytics',
  '/admin/providers': 'API Providers',
  '/admin/audit-logs': 'Audit Logs',
  '/admin/settings': 'System Settings',
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();

  // Generate breadcrumbs
  const generateBreadcrumbs = () => {
    const paths = pathname?.split('/').filter(Boolean) || [];
    const breadcrumbs = [
      { name: 'Home', href: '/dashboard' },
    ];

    let currentPath = '';
    paths.forEach((path, index) => {
      currentPath += `/${path}`;
      const name = pathNameMap[currentPath] || path.charAt(0).toUpperCase() + path.slice(1);
      
      breadcrumbs.push({
        name,
        href: currentPath,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64 transition-all duration-300">
        {/* Breadcrumbs */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center space-x-2 text-sm">
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.href} className="flex items-center">
                {index > 0 && (
                  <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
                )}
                {index === breadcrumbs.length - 1 ? (
                  <span className="text-gray-900 font-medium">{crumb.name}</span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="text-gray-500 hover:text-gray-700 transition-colors flex items-center"
                  >
                    {index === 0 && <Home className="w-4 h-4 mr-1" />}
                    {crumb.name}
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
