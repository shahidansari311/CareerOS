import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/store/useAuth';
import { api } from '@/lib/api';

export default function Dashboard() {
  const { user } = useAuth();
  const [nextAction, setNextAction] = useState<any>(null);
  const [readiness, setReadiness] = useState<any>(null);
  const [skills, setSkills] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [actionRes, readinessRes, skillsRes] = await Promise.all([
          api.get('/intelligence/next-action').catch(() => ({ data: { data: null } })),
          api.get('/intelligence/readiness').catch(() => ({ data: { data: null } })),
          api.get('/skills/my-skills').catch(() => ({ data: { data: [] } }))
        ]);
        
        setNextAction(actionRes.data.data);
        setReadiness(readinessRes.data.data);
        setSkills(skillsRes.data.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 slide-in-from-bottom-4">
      <div>
        <h1 className="text-3xl font-bold font-heading text-foreground">Good evening, {user?.profile?.firstName || 'Student'}.</h1>
        <p className="text-muted-foreground mt-2">Let's move one step closer to your goal.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 border-accent/20 shadow-md shadow-accent/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-32 bg-accent/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Your Next Best Action</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-surface-muted rounded w-3/4"></div>
                <div className="h-4 bg-surface-muted rounded w-1/4"></div>
              </div>
            ) : nextAction ? (
              <>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">{nextAction.title}</h2>
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary/20 text-secondary-foreground mb-4 mr-2">
                  {nextAction.actionType}
                </div>
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary mb-4">
                  {nextAction.context}
                </div>
                <p className="text-muted-foreground mb-4 max-w-lg leading-relaxed">
                  {nextAction.description}
                </p>
                <p className="text-sm text-accent mb-6 font-medium">
                  <strong>Why:</strong> {nextAction.rationale}
                </p>
                <Button variant="accent">Start Action →</Button>
              </>
            ) : (
              <p className="text-muted-foreground">Complete your onboarding to generate your next best action!</p>
            )}
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Career Readiness</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center pt-4">
            {isLoading ? (
              <div className="animate-pulse w-32 h-32 rounded-full bg-surface-muted mb-6"></div>
            ) : readiness ? (
              <>
                <div className="relative flex items-center justify-center mb-6">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-surface-muted" />
                    <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray="351.8" strokeDashoffset={351.8 - (351.8 * readiness.score) / 100} className="text-accent transition-all duration-1000 ease-out" />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-3xl font-bold text-foreground font-heading">{Math.round(readiness.score)}%</span>
                  </div>
                </div>
                <p className="text-sm text-center text-muted-foreground font-medium">
                  {readiness.analysis}
                </p>
              </>
            ) : (
              <p className="text-center text-muted-foreground">No readiness score available yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground text-sm">No recent activity found. Connect your GitHub or start learning to populate this feed!</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Skill Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {isLoading ? (
                <div className="animate-pulse space-y-4">
                  {[1,2,3].map(i => <div key={i} className="h-6 bg-surface-muted rounded w-full"></div>)}
                </div>
              ) : skills.length > 0 ? (
                skills.slice(0, 5).map((skill, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{skill.skill.name}</span>
                      <span className="text-muted-foreground">{skill.proficiencyLevel}%</span>
                    </div>
                    <div className="w-full bg-surface-muted h-2 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all duration-1000"
                        style={{ width: `${skill.proficiencyLevel}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">No skills added yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
