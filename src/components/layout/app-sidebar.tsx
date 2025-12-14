'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Calendar,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Plus,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppSidebarProps {
  user?: {
    name: string;
    email: string;
    role: string;
  };
  workspace?: {
    name: string;
  };
}

export function AppSidebar({ user, workspace }: AppSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const currentPath = usePathname();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      current: currentPath === '/dashboard' || currentPath === '',
    },
    {
      name: 'Leads',
      href: '/leads',
      icon: Users,
      current: currentPath.startsWith('/leads'),
    },
    {
      name: 'Conversations',
      href: '/conversations',
      icon: MessageSquare,
      current: currentPath.startsWith('/conversations'),
    },
    {
      name: 'Meetings',
      href: '/meetings',
      icon: Calendar,
      current: currentPath.startsWith('/meetings'),
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: BarChart3,
      current: currentPath.startsWith('/analytics'),
    },
    {
      name: 'Widget Setup',
      href: '/widget-setup',
      icon: Plus,
      current: currentPath.startsWith('/widget-setup'),
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      current: currentPath.startsWith('/settings'),
    },
  ];

  return (
    <div className={cn(
      'flex flex-col h-full bg-white border-r border-gray-200 transition-all duration-300',
      collapsed ? 'w-16' : 'w-64'
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!collapsed && (
          <div className="flex items-center gap-4">
            <img src="/logo-icon.svg" alt="LeadFlow AI" className="w-12 h-12" />
            <div>
              <h1 className="text-2xl font-bold text-primary">LeadFlow AI</h1>
              {workspace && (
                <p className="text-sm text-gray-500">{workspace.name}</p>
              )}
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>



      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="sidebar-nav">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'sidebar-nav-item',
                  item.current && 'active'
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && (
                  <span className="flex-1">{item.name}</span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        {collapsed ? (
          <div className="flex justify-center">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-primary/10 text-primary text-sm">
                {user?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-primary/10 text-primary">
                {user?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.email || 'user@example.com'}
              </p>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}