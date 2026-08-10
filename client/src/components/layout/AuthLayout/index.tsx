import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 md:px-24 xl:px-32 relative py-20 lg:py-0">
        <div className="absolute top-8 left-8 sm:top-12 sm:left-12">
          <Link to="/" className="text-2xl font-bold tracking-tighter text-primary font-heading">
            CareerOS<span className="text-accent">.</span>
          </Link>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full mx-auto"
        >
          <h1 className="text-3xl font-bold font-heading mb-2 text-foreground">{title}</h1>
          <p className="text-muted-foreground mb-8">{subtitle}</p>
          
          {children}
        </motion.div>
      </div>

      {/* Right side - Visual */}
      <div className="hidden lg:flex lg:w-1/2 bg-surface-muted relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-primary/5" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative z-10 p-12 text-center max-w-lg"
        >
          <h2 className="text-4xl font-bold font-heading text-primary leading-tight mb-6">
            Your entire career.<br />One operating system.
          </h2>
          <p className="text-lg text-muted-foreground">
            Join thousands of ambitious students tracking their coding progress, building skills, and landing their first jobs.
          </p>
        </motion.div>
        
        {/* Decorative elements */}
        <div className="absolute top-1/4 -left-12 w-64 h-64 bg-accent/20 rounded-full blur-3xl mix-blend-multiply" />
        <div className="absolute bottom-1/4 -right-12 w-80 h-80 bg-primary/10 rounded-full blur-3xl mix-blend-multiply" />
      </div>
    </div>
  );
}
