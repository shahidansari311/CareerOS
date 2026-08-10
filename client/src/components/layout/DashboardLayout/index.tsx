import React, { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from '../Sidebar';
import { Menu, Search, Bell, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/store/useAuth';

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isAuthenticated, isLoading, checkAuth } = useAuth();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      await checkAuth();
      setAuthChecked(true);
    };
    initAuth();
  }, [checkAuth]);

  if (!authChecked || isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const initials = user?.profile?.firstName 
    ? `${user.profile.firstName[0]}${user.profile.lastName ? user.profile.lastName[0] : ''}` 
    : 'ME';
  const fullName = user?.profile?.firstName 
    ? `${user.profile.firstName} ${user.profile.lastName || ''}` 
    : 'Student';

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar />
      
      {/* Mobile Sidebar overlay could go here */}

      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Mobile Topbar */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-surface sticky top-0 z-30">
          <span className="text-xl font-bold text-primary font-heading">CareerOS<span className="text-accent">.</span></span>
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-6 w-6" />
          </Button>
        </div>

        {/* Desktop Topbar */}
        <div className="sticky top-0 z-30 hidden lg:flex h-16 flex-shrink-0 items-center gap-x-4 border-b border-border bg-surface/80 backdrop-blur-sm px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <form className="relative flex flex-1 items-center" action="#" method="GET">
              <label htmlFor="search-field" className="sr-only">Search</label>
              <Search className="pointer-events-none absolute left-0 h-5 w-5 text-muted-foreground ml-2" />
              <Input
                id="search-field"
                className="block h-10 w-full md:w-96 border-0 bg-transparent py-0 pl-10 pr-0 text-foreground focus-visible:ring-0 sm:text-sm"
                placeholder="Search resources, jobs..."
                type="search"
                name="search"
              />
            </form>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <button type="button" className="-m-2.5 p-2.5 text-muted-foreground hover:text-foreground transition-colors">
                <span className="sr-only">View notifications</span>
                <Bell className="h-6 w-6" aria-hidden="true" />
              </button>
              <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-border" aria-hidden="true" />
              <div className="flex items-center gap-x-3">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm shadow-sm cursor-pointer hover:bg-primary/90 transition-colors">
                  {initials}
                </div>
                <span className="text-sm font-medium text-muted-foreground">{fullName}</span>
              </div>
            </div>
          </div>
        </div>

        <main className="flex-1 pb-10 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

