import React from 'react';
import { motion } from 'framer-motion';
import { Code2, GitMerge, FileText, Target, Users, Bot } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';

const features = [
  {
    icon: <Code2 size={24} className="text-accent" />,
    title: 'Coding Intelligence',
    description: 'Connect LeetCode, CodeChef, and Codeforces to track your problem-solving progress in one dashboard.'
  },
  {
    icon: <GitMerge size={24} className="text-primary" />,
    title: 'Skill Gap Analyzer',
    description: 'Compare your current skills against the requirements for your target role and get actionable advice.'
  },
  {
    icon: <Target size={24} className="text-secondary" />,
    title: 'Opportunity Radar',
    description: 'Discover internships and jobs specifically matched to your current skill level and career goals.'
  },
  {
    icon: <FileText size={24} className="text-muted" />,
    title: 'RAG Study Room',
    description: 'Upload your college PDFs and ask our AI to explain concepts, generate quizzes, or summarize topics.'
  },
  {
    icon: <Users size={24} className="text-accent" />,
    title: 'Resume & Interview',
    description: 'Get automated ATS scoring for your resume and practice with our AI mock interview engine.'
  },
  {
    icon: <Bot size={24} className="text-primary" />,
    title: 'AI Career Mentor',
    description: 'A dedicated AI mentor that understands your college year, skills, and goals to give personalized advice.'
  }
];

export function FeaturesSection() {
  return (
    <section className="py-24 bg-surface" id="features">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold font-heading mb-6"
          >
            Your Entire Career <br />
            <span className="text-accent">in One Place.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground"
          >
            Stop jumping between 10 different platforms. CareerOS brings your learning, practice, building, and applying into a single intelligent operating system.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow border-border/50 bg-background/50 hover:bg-background">
                <CardContent className="p-8">
                  <div className="mb-6 h-12 w-12 rounded-xl bg-surface-muted flex items-center justify-center">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
