import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MapPin, Building2, Clock, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

const columns = [
  { id: 'to-apply', title: 'To Apply' },
  { id: 'APPLIED', title: 'Applied' },
  { id: 'INTERVIEWING', title: 'Interviewing' },
];

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const [recommendedRes, applicationsRes] = await Promise.all([
          api.get('/opportunities/recommended').catch(() => ({ data: { data: [] } })),
          api.get('/opportunities/applications').catch(() => ({ data: { data: [] } }))
        ]);
        
        const recommended = recommendedRes.data.data.map((opt: any) => ({
          ...opt,
          status: 'to-apply',
          time: opt.publishedAt ? new Date(opt.publishedAt).toLocaleDateString() : 'Recent'
        }));

        const applied = applicationsRes.data.data.map((app: any) => ({
          ...app.opportunity,
          applicationId: app.id,
          status: app.status,
          time: new Date(app.createdAt).toLocaleDateString()
        }));

        setJobs([...recommended, ...applied]);
      } catch (error) {
        console.error('Failed to fetch jobs', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchJobs();
  }, []);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto h-[calc(100vh-4rem)] flex flex-col animate-in fade-in duration-500">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading text-foreground">Job Applications</h1>
          <p className="text-muted-foreground mt-2">Track your applications and discover matched opportunities.</p>
        </div>
        <Button variant="accent">Find Opportunities</Button>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-x-auto min-h-0">
        {columns.map(col => (
          <div key={col.id} className="flex flex-col bg-surface/30 rounded-xl p-4 border border-border">
            <h3 className="font-semibold text-foreground mb-4 flex items-center justify-between">
              {col.title}
              <span className="bg-surface-muted text-muted-foreground text-xs px-2 py-1 rounded-full">
                {jobs.filter(j => j.status === col.id).length}
              </span>
            </h3>
            
            <div className="flex-1 overflow-y-auto space-y-4">
              {isLoading ? (
                <div className="animate-pulse space-y-4">
                   {[1,2].map(i => <div key={i} className="h-32 bg-surface-muted rounded-xl"></div>)}
                </div>
              ) : jobs.filter(j => j.status === col.id).length > 0 ? (
                jobs.filter(j => j.status === col.id).map(job => (
                  <Card key={job.id} className="cursor-pointer hover:border-primary/40 transition-colors shadow-sm hover:shadow-md">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="w-10 h-10 rounded-lg bg-surface-muted flex items-center justify-center text-primary">
                          <Building2 size={20} />
                        </div>
                        {job.matchScore && (
                          <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-full">
                            {job.matchScore}% Match
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-foreground line-clamp-1" title={job.title}>{job.title}</h4>
                      <p className="text-muted-foreground text-sm mb-3">{job.company}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                        <span className="flex items-center gap-1"><MapPin size={12} /> {job.location || 'Remote'}</span>
                        <span className="flex items-center gap-1"><Clock size={12} /> {job.time}</span>
                      </div>
                      
                      <Button variant="outline" size="sm" className="w-full" onClick={() => job.url && window.open(job.url, '_blank')}>
                        {job.status === 'to-apply' ? 'Apply Now' : 'Update Status'}
                      </Button>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center pt-8">No jobs here yet.</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
