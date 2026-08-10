import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Mic, Video, MonitorUp, PhoneOff, Settings, AlertCircle } from 'lucide-react';

export default function MockInterviewPage() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold font-heading text-foreground">Mock Interviews</h1>
          <p className="text-muted-foreground mt-2">Practice with our AI interviewer to ace your real interviews.</p>
        </div>
      </div>

      <Card className="border-dashed shadow-none bg-surface/50">
        <CardContent className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
            <Video size={32} className="text-primary" />
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-3">No Active Interview Session</h3>
          <p className="text-muted-foreground max-w-md mb-8">
            Configure your target role and difficulty level to start a realistic AI-driven video mock interview.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="outline" className="gap-2">
              <Settings size={18} /> Configure Settings
            </Button>
            <Button variant="accent" className="gap-2">
              <Mic size={18} /> Start New Interview
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
