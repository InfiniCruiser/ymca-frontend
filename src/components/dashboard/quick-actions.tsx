'use client';

import Link from 'next/link';
import {
  PlusIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CogIcon,
} from '@heroicons/react/24/outline';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface QuickActionsProps {
  user: User;
}

export function QuickActions({ user }: QuickActionsProps) {
  const actions = [
    {
      name: 'Create Period',
      href: '/periods/new',
      icon: PlusIcon,
      description: 'Start a new reporting period',
    },
    {
      name: 'View Responses',
      href: '/responses',
      icon: DocumentTextIcon,
      description: 'Review submitted responses',
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: ChartBarIcon,
      description: 'View compliance analytics',
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: CogIcon,
      description: 'Manage portal settings',
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-soft p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-1 gap-3">
        {actions.map((action) => (
          <Link
            key={action.name}
            href={action.href}
            className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
          >
            <action.icon className="h-5 w-5 text-gray-400 mr-3" />
            <div>
              <div className="text-sm font-medium text-gray-900">{action.name}</div>
              <div className="text-xs text-gray-500">{action.description}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
