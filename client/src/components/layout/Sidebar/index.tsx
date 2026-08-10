import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, Map, BookOpen, Code2, 
  Briefcase, GraduationCap, Bot, Users, Settings, User 
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/app/dashboard', icon: LayoutDashboard },
  { name: 'Roadmap', href: '/app/roadmap', icon: Map },
  { name: 'Coding Profiles', href: '/app/coding', icon: Code2 },
  { name: 'Projects', href: '/app/projects', icon: Briefcase },
  { name: 'Study Room', href: '/app/study-room', icon: BookOpen },
  { name: 'Jobs & Internships', href: '/app/jobs', icon: GraduationCap },
  { name: 'AI Mentor', href: '/app/ai-mentor', icon: Bot },
];

export function Sidebar() {
  return (
    <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 border-r border-border bg-surface z-40">
      <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-6 mb-8">
          <span className="text-2xl font-bold tracking-tighter text-primary font-heading">
            CareerOS<span className="text-accent">.</span>
          </span>
        </div>
        <nav className="mt-5 flex-1 px-4 space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  isActive 
                    ? 'bg-accent/10 text-accent font-medium' 
                    : 'text-muted-foreground hover:bg-surface-muted hover:text-foreground',
                  'group flex items-center px-3 py-2.5 text-sm rounded-md transition-colors'
                )
              }
            >
              <item.icon
                className={cn('mr-3 flex-shrink-0 h-5 w-5', 'group-hover:text-accent')}
                aria-hidden="true"
              />
              {item.name}
            </NavLink>
          ))}
        </nav>
        <div className="px-4 mt-auto space-y-1">
          <NavLink
            to="/app/profile"
            className={({ isActive }) =>
              cn(
                isActive 
                  ? 'bg-accent/10 text-accent font-medium' 
                  : 'text-muted-foreground hover:bg-surface-muted hover:text-foreground',
                'group flex items-center px-3 py-2.5 text-sm rounded-md transition-colors'
              )
            }
          >
            <User className="mr-3 flex-shrink-0 h-5 w-5" />
            Profile
          </NavLink>
          <NavLink
            to="/app/settings"
            className={({ isActive }) =>
              cn(
                isActive 
                  ? 'bg-accent/10 text-accent font-medium' 
                  : 'text-muted-foreground hover:bg-surface-muted hover:text-foreground',
                'group flex items-center px-3 py-2.5 text-sm rounded-md transition-colors'
              )
            }
          >
            <Settings className="mr-3 flex-shrink-0 h-5 w-5" />
            Settings
          </NavLink>
        </div>
      </div>
    </div>
  );
}
