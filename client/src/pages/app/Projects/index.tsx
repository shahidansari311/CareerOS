import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ExternalLink, Plus, FolderGit2, X, Trash2, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

export default function ProjectsPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [techInput, setTechInput] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/projects');
      setProjects(res.data.data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !techInput) {
      toast.error('Please fill in all required fields.');
      return;
    }

    const techArray = techInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    try {
      setIsSaving(true);
      await api.post('/projects', {
        title,
        description,
        tech: techArray,
        githubUrl: githubUrl || null,
        liveUrl: liveUrl || null,
      });

      toast.success('Project added successfully!');
      setIsAddModalOpen(false);
      
      // Reset Form State
      setTitle('');
      setDescription('');
      setTechInput('');
      setGithubUrl('');
      setLiveUrl('');

      // Refresh list
      fetchProjects();
    } catch (error: any) {
      console.error('Error adding project:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to add project');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;

    try {
      await api.delete(`/projects/${id}`);
      toast.success('Project deleted successfully.');
      fetchProjects();
    } catch (error: any) {
      console.error('Error deleting project:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to delete project');
    }
  };

  if (isLoading && projects.length === 0) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 bg-background text-foreground">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading text-foreground">Project Portfolio</h1>
          <p className="text-muted-foreground mt-2">Manage the projects that will land you your first job.</p>
        </div>
        <Button className="gap-2" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={20} /> Add Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <Card className="border-dashed border-border shadow-none bg-muted/20">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
              <FolderGit2 size={32} className="text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">No projects added yet</h3>
            <p className="text-muted-foreground max-w-sm mb-6">
              Add your projects manually to showcase your skills and calculate your ATS score.
            </p>
            <Button variant="accent" className="gap-2" onClick={() => setIsAddModalOpen(true)}>
              <Plus size={18} /> Add Your First Project
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="group hover:border-primary/50 transition-colors flex flex-col h-full shadow-sm hover:shadow-md bg-surface border-border">
              <CardContent className="p-6 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-muted rounded-xl text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <FolderGit2 size={24} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 bg-emerald-100 dark:bg-emerald-950/55 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-full text-xs font-semibold">
                      {project.matchScore}% ATS Match
                    </span>
                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors p-1"
                      title="Delete Project"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2 text-foreground line-clamp-1">{project.title}</h3>
                <p className="text-muted-foreground text-sm line-clamp-3 mb-6 flex-1 whitespace-pre-wrap">
                  {project.description}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  {project.tech.map((t: string) => (
                    <span key={t} className="text-xs px-2.5 py-1 bg-muted text-muted-foreground rounded-md font-medium border border-border/40">
                      {t}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2"
                    disabled={!project.githubUrl}
                    onClick={() => project.githubUrl && window.open(project.githubUrl, '_blank', 'noopener,noreferrer')}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    Code
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2"
                    disabled={!project.liveUrl}
                    onClick={() => project.liveUrl && window.open(project.liveUrl, '_blank', 'noopener,noreferrer')}
                  >
                    <ExternalLink size={16} /> Live
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Project Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface border border-border rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-xl font-bold text-foreground">Add New Project</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-muted-foreground hover:text-foreground p-1">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddProject} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1">Project Title *</label>
                <Input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. E-commerce App"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1">Description *</label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-transparent border border-input rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  rows={3}
                  placeholder="What did you build? (minimum 5 characters)"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1">Technologies Used (comma separated) *</label>
                <Input
                  type="text"
                  required
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  placeholder="e.g. React, Node.js, PostgreSQL"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1">GitHub Repo URL</label>
                  <Input
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1">Live Demo URL</label>
                  <Input
                    type="url"
                    value={liveUrl}
                    onChange={(e) => setLiveUrl(e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                <Button type="submit" variant="accent" disabled={isSaving}>
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Save Project
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
