import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CheckCircle2, Lock, PlayCircle, Loader2, Plus, Trash2, Compass, ArrowLeft, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

export default function RoadmapPage() {
  const [roadmaps, setRoadmaps] = useState<any[]>([]);
  const [careerPaths, setCareerPaths] = useState<any[]>([]);
  const [allSkills, setAllSkills] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  // Custom path form state
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [customIndustry, setCustomIndustry] = useState('Software Engineering');
  const [selectedSkills, setSelectedSkills] = useState<{ skillId: string; targetLevel: number }[]>([]);

  const fetchRoadmap = async () => {
    try {
      setIsLoading(true);
      const [roadmapRes, pathsRes, skillsRes] = await Promise.all([
        api.get('/roadmap'),
        api.get('/roadmap/career-paths').catch(() => ({ data: { data: [] } })),
        api.get('/skills/list').catch(() => ({ data: { data: [] } }))
      ]);
      setRoadmaps(roadmapRes.data.data || []);
      setCareerPaths(pathsRes.data.data || []);
      setAllSkills(skillsRes.data.data || []);
    } catch (error) {
      console.error('Failed to fetch roadmap data', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const handleGenerateRoadmap = async (careerPathId: string) => {
    try {
      setIsGenerating(true);
      const res = await api.post('/roadmap/generate', { careerPathId });
      toast.success('Your career roadmap has been generated!');
      await fetchRoadmap();
    } catch (error: any) {
      console.error('Failed to generate roadmap', error);
      toast.error(error.response?.data?.error?.message || 'Failed to generate roadmap');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateCustomPath = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) {
      toast.error('Please enter a career path title');
      return;
    }
    if (selectedSkills.length === 0) {
      toast.error('Please select at least one skill requirement');
      return;
    }

    try {
      setIsGenerating(true);
      // 1. Create the custom career path
      const pathRes = await api.post('/roadmap/career-paths', {
        title: customTitle,
        description: customDescription,
        industry: customIndustry,
        skills: selectedSkills
      });
      const newPathId = pathRes.data.data.id;

      // 2. Generate roadmap from that path
      await api.post('/roadmap/generate', { careerPathId: newPathId });
      toast.success('Custom Career Roadmap generated!');
      
      // Reset form state
      setCustomTitle('');
      setCustomDescription('');
      setSelectedSkills([]);
      setShowCustomForm(false);
      
      await fetchRoadmap();
    } catch (error: any) {
      console.error('Failed to create custom roadmap', error);
      toast.error(error.response?.data?.error?.message || 'Failed to create custom roadmap');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleResetRoadmap = async (roadmapId: string) => {
    if (!confirm('Are you sure you want to delete this roadmap and choose a new career path?')) {
      return;
    }
    try {
      setIsLoading(true);
      await api.delete(`/roadmap/${roadmapId}`);
      toast.success('Roadmap cleared successfully');
      await fetchRoadmap();
    } catch (error: any) {
      console.error('Failed to reset roadmap', error);
      toast.error('Failed to reset roadmap');
      setIsLoading(false);
    }
  };

  const handleUpdateStepStatus = async (roadmapId: string, stepId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'PENDING' ? 'IN_PROGRESS' : 'COMPLETED';
    
    try {
      await api.put(`/roadmap/${roadmapId}/steps/${stepId}`, { status: nextStatus });
      toast.success(`Step marked as ${nextStatus.replace('_', ' ').toLowerCase()}`);
      // Refresh roadmap
      const response = await api.get('/roadmap');
      setRoadmaps(response.data.data || []);
    } catch (error: any) {
      console.error('Failed to update step status', error);
      toast.error(error.response?.data?.error?.message || 'Failed to update step');
    }
  };

  const toggleSkillSelection = (skillId: string) => {
    setSelectedSkills(prev => {
      const exists = prev.find(s => s.skillId === skillId);
      if (exists) {
        return prev.filter(s => s.skillId !== skillId);
      } else {
        return [...prev, { skillId, targetLevel: 5 }];
      }
    });
  };

  const handleSkillLevelChange = (skillId: string, level: number) => {
    setSelectedSkills(prev =>
      prev.map(s => s.skillId === skillId ? { ...s, targetLevel: level } : s)
    );
  };

  if (isLoading && roadmaps.length === 0) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const activeRoadmap = roadmaps.find(r => r.status === 'ACTIVE' || r.status === 'COMPLETED') || roadmaps[0];

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 bg-background text-foreground">
      {activeRoadmap ? (
        <>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold font-heading text-foreground">Your Career Roadmap</h1>
              <p className="text-muted-foreground mt-2">
                Target Role: <strong className="text-foreground">{activeRoadmap.careerPath?.title || 'Selected Path'}</strong>
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-muted-foreground">
                  Progress: {Math.round(activeRoadmap.completionPercentage)}%
                </span>
                <div className="w-32 bg-muted h-3 rounded-full overflow-hidden border border-border/60">
                  <div
                    className="bg-accent h-full rounded-full transition-all duration-500"
                    style={{ width: `${activeRoadmap.completionPercentage}%` }}
                  />
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive mt-1 border-destructive/20"
                onClick={() => handleResetRoadmap(activeRoadmap.id)}
              >
                Choose Different Path
              </Button>
            </div>
          </div>

          <div className="relative pt-8">
            <div className="absolute left-[27px] top-8 bottom-0 w-1 bg-border rounded-full" />
            
            <div className="space-y-8 relative">
              {activeRoadmap.steps && activeRoadmap.steps
                .sort((a: any, b: any) => a.orderIndex - b.orderIndex)
                .map((node: any) => {
                  const isCompleted = node.status === 'COMPLETED';
                  const isInProgress = node.status === 'IN_PROGRESS';
                  
                  return (
                    <div key={node.id} className="flex gap-6 relative">
                      <div className="relative z-10 flex flex-col items-center">
                        <div className={cn(
                          "w-14 h-14 rounded-full flex items-center justify-center border-4 border-background transition-all cursor-pointer",
                          isCompleted ? "bg-accent text-accent-foreground" :
                          isInProgress ? "bg-primary text-primary-foreground ring-4 ring-primary/20" :
                          "bg-muted text-muted-foreground border-border"
                        )}>
                          {isCompleted ? <CheckCircle2 size={24} /> :
                           isInProgress ? <PlayCircle size={24} /> :
                           <Lock size={20} />}
                        </div>
                      </div>
                      
                      <Card className={cn("flex-1 transition-all bg-surface border-border", 
                        !isCompleted && !isInProgress && "opacity-60",
                        isInProgress && "border-primary/50 shadow-md ring-1 ring-primary/10"
                      )}>
                        <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                              Step {node.orderIndex} • {node.type}
                            </div>
                            <h3 className="text-xl font-bold text-foreground">{node.title}</h3>
                            <p className="text-sm text-muted-foreground mt-2">{node.description}</p>
                          </div>
                          
                          <div className="shrink-0">
                            {node.status === 'PENDING' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUpdateStepStatus(activeRoadmap.id, node.id, 'PENDING')}
                              >
                                Start Step
                              </Button>
                            )}
                            {node.status === 'IN_PROGRESS' && (
                              <Button
                                variant="accent"
                                size="sm"
                                onClick={() => handleUpdateStepStatus(activeRoadmap.id, node.id, 'IN_PROGRESS')}
                              >
                                Mark Completed
                              </Button>
                            )}
                            {node.status === 'COMPLETED' && (
                              <span className="text-xs font-bold text-accent flex items-center gap-1">
                                <CheckCircle2 size={14} /> Completed
                              </span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
            </div>
          </div>
        </>
      ) : showCustomForm ? (
        <Card className="max-w-2xl mx-auto bg-surface border-border">
          <CardHeader className="flex flex-row items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setShowCustomForm(false)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <CardTitle className="text-2xl font-bold font-heading">Setup Custom Career Path</CardTitle>
              <p className="text-sm text-muted-foreground">Select custom requirements to generate your custom AI roadmap.</p>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleCreateCustomPath} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Career Path Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cloud Security Specialist"
                    value={customTitle}
                    onChange={e => setCustomTitle(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Industry / Area</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cybersecurity"
                    value={customIndustry}
                    onChange={e => setCustomIndustry(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Description (Optional)</label>
                <textarea
                  placeholder="Describe your custom career ambitions..."
                  value={customDescription}
                  onChange={e => setCustomDescription(e.target.value)}
                  className="w-full h-20 p-3 rounded-lg border border-border bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold block">Select Core Skills & Targets</label>
                <div className="max-h-60 overflow-y-auto space-y-3 pr-2 border border-border/60 rounded-xl p-3 bg-surface-muted/20">
                  {allSkills.length === 0 ? (
                    <p className="text-sm text-muted-foreground p-2">No skills loaded from DB. Run database seeding first.</p>
                  ) : (
                    allSkills.map(skill => {
                      const selected = selectedSkills.find(s => s.skillId === skill.id);
                      return (
                        <div key={skill.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-2 rounded-lg hover:bg-muted/50 gap-3 border border-border/20">
                          <label className="flex items-center gap-3 cursor-pointer text-sm font-medium">
                            <input
                              type="checkbox"
                              checked={!!selected}
                              onChange={() => toggleSkillSelection(skill.id)}
                              className="rounded border-border text-primary focus:ring-primary h-4 w-4 bg-transparent"
                            />
                            {skill.name}
                          </label>
                          {selected && (
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-muted-foreground">Target Level:</span>
                              <input
                                type="range"
                                min="1"
                                max="10"
                                value={selected.targetLevel}
                                onChange={e => handleSkillLevelChange(skill.id, parseInt(e.target.value))}
                                className="w-24 accent-accent"
                              />
                              <span className="text-sm font-bold text-accent min-w-[20px] text-right">
                                {selected.targetLevel}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <Button
                type="submit"
                variant="accent"
                className="w-full h-11"
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : null}
                Generate Custom Roadmap
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <div className="max-w-3xl mx-auto space-y-8 text-center py-10">
          <div className="space-y-3">
            <h1 className="text-3xl font-bold font-heading text-foreground">Generate Your Career Roadmap</h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Choose a career path below or create a completely custom configuration to track your learning milestones.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
            {careerPaths.map((path) => (
              <Card key={path.id} className="text-left flex flex-col justify-between h-full bg-surface border-border hover:border-primary/50 transition-colors shadow-sm hover:shadow-md">
                <CardContent className="p-6 space-y-4 flex flex-col justify-between h-full">
                  <div className="space-y-2">
                    <span className="text-xs bg-muted text-accent px-2 py-0.5 rounded font-semibold">
                      {path.industry}
                    </span>
                    <h3 className="text-xl font-bold text-foreground">{path.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-4">
                      {path.description || 'No description available for this career path.'}
                    </p>
                  </div>
                  <Button
                    variant="accent"
                    className="w-full mt-4"
                    disabled={isGenerating}
                    onClick={() => handleGenerateRoadmap(path.id)}
                  >
                    {isGenerating ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    Choose Path
                  </Button>
                </CardContent>
              </Card>
            ))}

            {/* Custom Path Creator Card */}
            <Card className="text-left flex flex-col justify-between h-full bg-gradient-to-br from-surface to-primary/5 border-dashed border-2 border-primary/40 hover:border-primary transition-all shadow-sm hover:shadow-md cursor-pointer"
                  onClick={() => setShowCustomForm(true)}>
              <CardContent className="p-6 space-y-4 flex flex-col justify-between h-full min-h-[220px]">
                <div className="space-y-2">
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded font-semibold flex items-center gap-1 w-max">
                    <Compass className="w-3 h-3" /> Customizable
                  </span>
                  <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <Plus className="w-5 h-5 text-primary" /> Create Custom Path
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Customize your specific role, choose custom skills, and configure custom proficiency targets.
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-4 border-primary/20 hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  Configure Custom
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

