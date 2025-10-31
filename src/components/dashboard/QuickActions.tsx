'use client';

import Link from 'next/link';
import { Search, Calendar, FileText, User } from 'lucide-react';

export default function QuickActions() {
  const actions = [
    {
      icon: Search,
      label: 'Search Flights',
      href: '/search',
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      icon: Calendar,
      label: 'My Bookings',
      href: '/bookings',
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      icon: FileText,
      label: 'View Reports',
      href: '/reports',
      color: 'bg-purple-500 hover:bg-purple-600',
    },
    {
      icon: User,
      label: 'Profile Settings',
      href: '/settings',
      color: 'bg-orange-500 hover:bg-orange-600',
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-4">
        {actions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className={`${action.color} text-white rounded-lg p-4 flex flex-col items-center justify-center space-y-2 transition-colors group`}
          >
            <action.icon className="w-6 h-6" />
            <span className="text-sm font-medium text-center">{action.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
