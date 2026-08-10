import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Bot } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center mb-8 animate-bounce-slow">
        <Bot size={48} className="text-primary" />
      </div>
      
      <h1 className="text-6xl font-bold font-heading text-foreground mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-foreground mb-4">Page under construction</h2>
      
      <p className="text-muted-foreground max-w-md mx-auto mb-10 text-lg">
        It looks like this feature is coming soon or the page has moved. We're constantly building new tools for your career!
      </p>
      
      <div className="flex gap-4">
        <Button variant="accent" size="lg" asChild>
          <Link to="/app/dashboard">Return to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
