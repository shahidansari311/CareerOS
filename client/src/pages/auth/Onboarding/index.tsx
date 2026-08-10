import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { motion } from 'framer-motion';

export default function OnboardingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold font-heading text-primary">CareerOS<span className="text-accent">.</span></h1>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-foreground font-heading">
            Tell us about yourself
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Step 1 of 8: Let's personalize your career roadmap.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>What year are you in?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['1st Year', '2nd Year', '3rd Year', '4th Year'].map((year) => (
                <button
                  key={year}
                  className="flex items-center justify-center p-4 border border-border rounded-xl hover:border-accent hover:bg-accent/5 transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
                >
                  <span className="font-medium text-foreground">{year}</span>
                </button>
              ))}
            </div>
            
            <div className="pt-6 flex justify-between">
              <Button variant="ghost" onClick={() => navigate(-1)}>Back</Button>
              <Button variant="accent" onClick={() => navigate('/app/dashboard')}>
                Skip to Dashboard →
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
