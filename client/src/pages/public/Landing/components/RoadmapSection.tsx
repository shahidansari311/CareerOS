import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { ArrowRight, BookOpen, Code, Terminal, Briefcase } from 'lucide-react';

export function RoadmapSection() {
  const steps = [
    {
      icon: <BookOpen className="text-primary" />,
      title: "Assess & Plan",
      description: "We analyze your current year, skills, and target role to generate a personalized path.",
      color: "bg-surface-muted"
    },
    {
      icon: <Code className="text-accent" />,
      title: "Learn & Build",
      description: "Follow curated learning paths and build projects that actually matter for your resume.",
      color: "bg-accent/10"
    },
    {
      icon: <Terminal className="text-secondary" />,
      title: "Practice",
      description: "Connect your coding profiles and practice the exact problems you need for interviews.",
      color: "bg-secondary/10"
    },
    {
      icon: <Briefcase className="text-muted" />,
      title: "Apply & Get Hired",
      description: "Apply to highly-matched opportunities and pass interviews with our AI Mock Interviewer.",
      color: "bg-muted/10"
    }
  ];

  return (
    <section className="py-32 bg-background relative overflow-hidden" id="how-it-works">
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold font-heading mb-6"
          >
            The CareerOS <br />
            <span className="text-accent">Career Engine</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          {/* Connecting line for desktop */}
          <div className="hidden md:block absolute top-12 left-0 right-0 h-[2px] bg-border/50 z-0" />
          
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="relative z-10 flex flex-col items-center text-center"
            >
              <div className={`w-24 h-24 rounded-full ${step.color} flex items-center justify-center mb-6 shadow-sm border border-border/50`}>
                {step.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
              <p className="text-muted-foreground mb-6">{step.description}</p>
              
              {index < steps.length - 1 && (
                <div className="md:hidden my-4 text-border">
                  <ArrowRight className="rotate-90" />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <Button size="lg" variant="accent" className="h-14 px-8 text-base">
            Start Your Career Journey
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
