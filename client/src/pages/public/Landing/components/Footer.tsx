import React from 'react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-surface py-16 border-t border-border">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-16">
          <div className="md:col-span-2">
            <Link to="/" className="text-2xl font-bold tracking-tighter text-primary font-heading mb-6 inline-block">
              CareerOS<span className="text-accent">.</span>
            </Link>
            <p className="text-muted-foreground max-w-sm mb-6 leading-relaxed">
              From Your First Year to Your First Job. The personalized career operating system for ambitious college students.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-primary">Product</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-muted-foreground hover:text-accent transition-colors">Features</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-accent transition-colors">AI Mentor</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-accent transition-colors">Roadmap</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-accent transition-colors">Coding</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-primary">Resources</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-muted-foreground hover:text-accent transition-colors">Blog</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-accent transition-colors">Career Guides</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-accent transition-colors">Interview Prep</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-accent transition-colors">Resume Templates</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-primary">Company</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-muted-foreground hover:text-accent transition-colors">About</a></li>
              <li><a href="mailto:careerOS.work@gmail.com" className="text-muted-foreground hover:text-accent transition-colors">Contact (careerOS.work@gmail.com)</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-accent transition-colors">Privacy</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-accent transition-colors">Terms</a></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between">
          <p className="text-muted-foreground text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} CareerOS. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <a href="#" className="text-muted-foreground hover:text-accent">Twitter</a>
            <a href="#" className="text-muted-foreground hover:text-accent">LinkedIn</a>
            <a href="#" className="text-muted-foreground hover:text-accent">GitHub</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
