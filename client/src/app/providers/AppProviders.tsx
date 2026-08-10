import React from 'react';
import { ThemeProvider } from './ThemeProvider';
import { QueryProvider } from './QueryProvider';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="system">
      <QueryProvider>
        {children}
      </QueryProvider>
    </ThemeProvider>
  );
}
