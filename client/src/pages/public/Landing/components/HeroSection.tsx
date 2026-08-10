import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

export function HeroSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut" as const,
      },
    },
  };

  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden" id="hero">
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1 
            variants={itemVariants}
            className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 text-foreground font-heading leading-tight"
          >
            From Your First Year <br className="hidden md:block" />
            <span className="text-primary/80 italic">to Your First Job.</span>
          </motion.h1>
          
          <motion.p 
            variants={itemVariants}
            className="text-lg md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            CareerOS turns your college journey into a personalized career roadmap — helping you learn, build, practice, and get hired.
          </motion.p>
          
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button variant="accent" size="lg" className="w-full sm:w-auto text-base h-14 px-8 shadow-xl shadow-accent/20" asChild>
              <Link to="/register">Build My Career Path</Link>
            </Button>
            <Button variant="outline" size="lg" className="w-full sm:w-auto text-base h-14 px-8" asChild>
              <a href="#features">Explore CareerOS</a>
            </Button>
          </motion.div>
        </motion.div>

        {/* Dashboard Preview Visualization */}
        <motion.div 
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mt-20 relative max-w-5xl mx-auto"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent rounded-3xl blur-3xl" />
          <Card className="relative bg-surface/80 backdrop-blur-xl border-border/50 shadow-2xl overflow-hidden">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-6">
                  <div className="bg-surface rounded-xl p-6 border shadow-sm flex flex-col items-center justify-center">
                    <span className="text-sm text-muted-foreground font-medium mb-2">Career Readiness</span>
                    <span className="text-4xl font-bold text-primary">78%</span>
                  </div>
                  <div className="bg-surface rounded-xl p-6 border shadow-sm">
                    <span className="text-sm text-muted-foreground font-medium mb-4 block">Current Goal</span>
                    <span className="text-lg font-semibold">Backend Developer</span>
                  </div>
                </div>
                
                <div className="md:col-span-2 bg-surface rounded-xl p-6 border shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm text-muted-foreground font-medium mb-2">Next Best Action</h3>
                    <p className="text-2xl font-semibold mb-4 text-accent">Complete 2 Graph Problems</p>
                    <p className="text-muted-foreground">You've solved only 12 Graph problems. This is currently one of your biggest gaps for your Backend Developer goal.</p>
                  </div>
                  <div className="mt-6 flex gap-4">
                    <div className="flex-1 bg-surface-muted h-2 rounded-full overflow-hidden">
                      <div className="w-[68%] bg-secondary h-full rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
