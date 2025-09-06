'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { MessageSquare, Settings, BarChart3, Users, HelpCircle, ArrowLeft } from 'lucide-react';
import { useAccount } from '@/contexts/AccountContext';

interface AccountNavigationProps {
  accountId: string;
  accountName?: string;
  showBackButton?: boolean;
}

export default function AccountNavigation({ 
  accountId, 
  accountName,
  showBackButton = true 
}: AccountNavigationProps) {
  const pathname = usePathname();
  const { currentAccount } = useAccount();
  
  const navigation = [
    { 
      name: 'Dashboard', 
      href: `/dashboard/accounts/${accountId}`, 
      icon: BarChart3 
    },
    { 
      name: 'Flows', 
      href: `/dashboard/accounts/${accountId}/flows`, 
      icon: MessageSquare 
    },
    { 
      name: 'Flow Builder', 
      href: `/dashboard/accounts/${accountId}/flow-builder`, 
      icon: Settings 
    },
    { 
      name: 'Analytics', 
      href: `/dashboard/accounts/${accountId}/analytics`, 
      icon: BarChart3 
    },
    { 
      name: 'Team', 
      href: `/dashboard/accounts/${accountId}/team`, 
      icon: Users 
    },
    { 
      name: 'Settings', 
      href: `/dashboard/accounts/${accountId}/settings`, 
      icon: Settings 
    },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <div className="flex items-center space-x-3">
                {showBackButton && (
                  <Link 
                    href="/dashboard"
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Link>
                )}
                <Link href="/" className="text-xl font-bold text-gray-900">
                  NevoChat
                </Link>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`${
                      isActive
                        ? 'border-neon-green text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              Compte: {accountName || currentAccount?.name || `#${accountId}`}
            </div>
            <div className="h-6 w-px bg-gray-300"></div>
            <Link 
              href={`/dashboard/accounts/${accountId}/settings`}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Paramètres
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="sm:hidden">
        <div className="pt-2 pb-3 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`${
                  isActive
                    ? 'bg-green-50 border-neon-green text-green-700'
                    : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
              >
                <div className="flex items-center">
                  <Icon className="w-4 h-4 mr-3" />
                  {item.name}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
