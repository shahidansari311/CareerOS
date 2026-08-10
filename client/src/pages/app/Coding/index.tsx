import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Code2, Trophy, Flame, Loader2, Plus, AlertCircle, X } from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface CodingProfile {
  id: string;
  platform: string;
  username: string;
  solved: number;
  rating: number;
  rank: number;
  streak: number;
}

const PLATFORMS = [
  { key: 'LEETCODE', name: 'LeetCode', color: '#FFA116', label: 'L' },
  { key: 'HACKERRANK', name: 'HackerRank', color: '#00EA64', label: 'H' },
  { key: 'CODECHEF', name: 'CodeChef', color: '#5B4636', label: 'C' },
  { key: 'CODEFORCES', name: 'Codeforces', color: '#3182CE', label: 'CF' },
  { key: 'GITHUB', name: 'GitHub', color: '#24292E', label: 'GH' },
  { key: 'GEEKSFORGEEKS', name: 'GeeksforGeeks', color: '#2F8D46', label: 'GFG' },
];

export default function CodingProfilesPage() {
  const [profiles, setProfiles] = useState<CodingProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Connection modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState('LEETCODE');
  const [username, setUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProfiles = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/coding-profiles');
      setProfiles(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch coding profiles', error);
      toast.error('Failed to load coding accounts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error('Please enter a username');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.post('/coding-profiles', {
        platform: selectedPlatform,
        username: username.trim(),
      });
      toast.success(`${selectedPlatform.replace('_', ' ')} account connected!`);
      setUsername('');
      setShowModal(false);
      await fetchProfiles();
    } catch (error: any) {
      console.error('Connection error', error);
      toast.error(error.response?.data?.error?.message || 'Failed to connect account');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDisconnect = async (id: string, platformName: string) => {
    if (!confirm(`Are you sure you want to disconnect your ${platformName} account?`)) {
      return;
    }
    try {
      await api.delete(`/coding-profiles/${id}`);
      toast.success(`${platformName} disconnected`);
      await fetchProfiles();
    } catch (error) {
      console.error('Disconnection error', error);
      toast.error('Failed to disconnect account');
    }
  };

  // Compute aggregate metrics
  const totalSolved = profiles.reduce((acc, p) => acc + p.solved, 0);
  const maxStreak = profiles.length > 0 ? Math.max(...profiles.map(p => p.streak)) : 0;
  const bestRank = profiles.length > 0 
    ? Math.min(...profiles.filter(p => p.rank > 0).map(p => p.rank)) 
    : 0;

  // Format Radar data
  const radarData = profiles.map(p => {
    const platInfo = PLATFORMS.find(pl => pl.key === p.platform);
    return {
      subject: platInfo ? platInfo.name : p.platform,
      A: p.solved,
      fullMark: 500,
    };
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 bg-background text-foreground">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading text-foreground">Coding Intelligence</h1>
          <p className="text-muted-foreground mt-2">Track your problem-solving progress across platforms.</p>
        </div>
        <Button variant="accent" onClick={() => setShowModal(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Connect Platform
        </Button>
      </div>

      {isLoading ? (
        <div className="flex h-60 items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-surface to-surface-muted border-border shadow-sm">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-4 bg-primary/10 text-primary rounded-xl"><Code2 size={24} /></div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Solved</p>
                  <h2 className="text-3xl font-bold font-heading">{totalSolved || '--'}</h2>
                </div>
              </CardContent>
            </Card>
            <Card className={cn("bg-gradient-to-br from-surface to-surface-muted border-border shadow-sm", profiles.length === 0 && "opacity-50")}>
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-4 bg-accent/10 text-accent rounded-xl"><Flame size={24} /></div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Max Streak</p>
                  <h2 className="text-3xl font-bold font-heading">{profiles.length > 0 ? `${maxStreak} days` : '--'}</h2>
                </div>
              </CardContent>
            </Card>
            <Card className={cn("bg-gradient-to-br from-surface to-surface-muted border-border shadow-sm", profiles.length === 0 && "opacity-50")}>
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-4 bg-secondary/10 text-secondary-foreground rounded-xl"><Trophy size={24} /></div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Best Rank</p>
                  <h2 className="text-3xl font-bold font-heading">{bestRank ? `#${bestRank.toLocaleString()}` : '--'}</h2>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 border-border bg-surface">
              <CardHeader>
                <CardTitle>Skill Distribution Radar</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center items-center h-[350px]">
                {profiles.length === 0 ? (
                  <div className="text-center space-y-3">
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto text-muted-foreground">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <p className="text-sm text-muted-foreground">No accounts connected yet. Link an account to populate radar.</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                      <PolarGrid stroke="#374151" />
                      <PolarAngleAxis dataKey="subject" stroke="#9CA3AF" fontSize={12} />
                      <PolarRadiusAxis stroke="#374151" />
                      <Radar name="Solved Problems" dataKey="A" stroke="#10B981" fill="#10B981" fillOpacity={0.4} />
                    </RadarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card className="border-border bg-surface">
              <CardHeader>
                <CardTitle>Connected Platforms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {PLATFORMS.map(platform => {
                  const conn = profiles.find(p => p.platform === platform.key);
                  return (
                    <div key={platform.key} className={cn(
                      "flex items-center justify-between p-4 border rounded-xl transition-all",
                      conn ? "bg-surface-muted/30 border-border" : "border-dashed border-border/60 opacity-60"
                    )}>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm"
                          style={{ backgroundColor: platform.color }}
                        >
                          {platform.label}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{platform.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {conn ? `@${conn.username} (${conn.solved} solved)` : 'Not connected'}
                          </p>
                        </div>
                      </div>
                      {conn ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => handleDisconnect(conn.id, platform.name)}
                        >
                          Disconnect
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedPlatform(platform.key);
                            setShowModal(true);
                          }}
                        >
                          Connect
                        </Button>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Connect Account Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                   <Card className="w-full max-w-md bg-surface border-border animate-in zoom-in-95 duration-200">
            <CardHeader className="flex flex-row justify-between items-center pb-2">
              <CardTitle className="text-xl font-bold font-heading">Connect Coding Platform</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowModal(false)}>
                <X className="w-5 h-5" />
              </Button>
            </CardHeader>
            <CardContent className="pt-4">
              <form onSubmit={handleConnect} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Platform</label>
                  <select
                    value={selectedPlatform}
                    onChange={e => setSelectedPlatform(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-surface text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {PLATFORMS.map(p => (
                      <option key={p.key} value={p.key} className="bg-surface text-foreground">{p.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Username</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter platform username..."
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-transparent text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="accent"
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    Connect
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

