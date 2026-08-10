import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { MapPin, Mail, GraduationCap, Building2, ExternalLink, PenSquare, Loader2, Camera, X, FileText, Upload, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [skills, setSkills] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form Fields State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [currentStatus, setCurrentStatus] = useState('');
  const [location, setLocation] = useState('');
  const [college, setCollege] = useState('');
  const [branch, setBranch] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [currentYear, setCurrentYear] = useState('');
  const [semester, setSemester] = useState('');
  const [cgpa, setCgpa] = useState('');

  const fetchProfileData = async () => {
    try {
      const [profileRes, skillsRes] = await Promise.all([
        api.get('/profile'),
        api.get('/skills/my-skills')
      ]);
      const prof = profileRes.data.data;
      setProfile(prof);
      setSkills(skillsRes.data.data || []);

      // Populate form fields
      setFirstName(prof?.user?.firstName || '');
      setLastName(prof?.user?.lastName || '');
      setHeadline(prof?.headline || '');
      setBio(prof?.bio || '');
      setCurrentStatus(prof?.currentStatus || '');
      setLocation(prof?.location || '');
      setCollege(prof?.college || '');
      setBranch(prof?.branch || '');
      setGraduationYear(prof?.graduationYear ? String(prof.graduationYear) : '');
      setCurrentYear(prof?.currentYear ? String(prof.currentYear) : '');
      setSemester(prof?.semester ? String(prof.semester) : '');
      setCgpa(prof?.cgpa ? String(prof.cgpa) : '');
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const [isUploadingResume, setIsUploadingResume] = useState(false);

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF documents are allowed.');
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);

    try {
      setIsUploadingResume(true);
      const res = await api.post('/profile/upload-resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Resume uploaded successfully!');
      setProfile((prev: any) => ({
        ...prev,
        resumeUrl: res.data.data.resumeUrl,
      }));
    } catch (error: any) {
      console.error('Error uploading resume:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to upload resume');
    } finally {
      setIsUploadingResume(false);
    }
  };

  const handleResumeDelete = async () => {
    if (!window.confirm('Are you sure you want to remove your resume?')) return;
    try {
      setIsUploadingResume(true);
      await api.put('/profile', {
        resumeUrl: null,
      });
      toast.success('Resume removed successfully.');
      setProfile((prev: any) => ({
        ...prev,
        resumeUrl: null,
      }));
    } catch (error: any) {
      console.error('Error removing resume:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to remove resume');
    } finally {
      setIsUploadingResume(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      setIsUploading(true);
      const res = await api.post('/profile/upload-avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Avatar updated successfully!');
      // Update local profile state
      setProfile((prev: any) => ({
        ...prev,
        avatarUrl: res.data.data.avatarUrl,
      }));
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to upload avatar');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      // 1. Update basic profile fields
      await api.put('/profile', {
        firstName,
        lastName,
        headline,
        bio,
        currentStatus,
        location,
        college,
        branch,
        graduationYear: graduationYear ? Number(graduationYear) : null,
        currentYear: currentYear ? Number(currentYear) : null,
        semester: semester ? Number(semester) : null,
        cgpa: cgpa ? Number(cgpa) : null,
      });

      toast.success('Profile updated successfully!');
      setIsEditing(false);
      await fetchProfileData();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to update profile');
      setIsLoading(false);
    }
  };

  if (isLoading && !profile) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Use the profile user data or fallback if empty
  const user = profile?.user || {};
  const education = profile ? {
    college: profile.college,
    branch: profile.branch,
    graduationYear: profile.graduationYear,
    currentYear: profile.currentYear,
    semester: profile.semester,
    cgpa: profile.cgpa,
  } : null;

  const initials = user.firstName ? `${user.firstName[0]}${user.lastName ? user.lastName[0] : ''}` : 'ME';
  const hasAvatar = !!profile?.avatarUrl;
  const avatarSrc = profile?.avatarUrl
    ? (profile.avatarUrl.startsWith('http') ? profile.avatarUrl : `http://localhost:3000${profile.avatarUrl}`)
    : '';

  const resumeSrc = profile?.resumeUrl
    ? (profile.resumeUrl.startsWith('http') ? profile.resumeUrl : `http://localhost:3000${profile.resumeUrl}`)
    : '';

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 bg-background text-foreground">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading text-foreground">Student Profile</h1>
          <p className="text-muted-foreground mt-2">Manage your public portfolio and resume details.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2"><ExternalLink size={16} /> Public View</Button>
          <Button variant="accent" className="gap-2" onClick={() => setIsEditing(true)}>
            <PenSquare size={16} /> Edit Profile
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Basic Info */}
        <Card className="md:col-span-1 h-fit shadow-sm bg-surface border-border">
          <CardContent className="p-6 flex flex-col items-center text-center border-b border-border bg-muted/20">
            <div className="relative group mb-4">
              {hasAvatar ? (
                <img
                  src={avatarSrc}
                  alt="Avatar"
                  className="w-24 h-24 rounded-full object-cover shadow-md border-2 border-primary"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-heading text-3xl font-bold shadow-md">
                  {initials}
                </div>
              )}
              {/* Overlay for avatar edit */}
              <label className="absolute inset-0 bg-black/60 text-white rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity duration-200 text-xs">
                {isUploading ? (
                  <Loader2 className="w-5 h-5 animate-spin mb-1 text-white" />
                ) : (
                  <>
                    <Camera size={18} className="mb-1 text-white" />
                    <span>Upload Photo</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={isUploading}
                />
              </label>
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-accent font-medium mt-1">
              {profile?.headline || 'Aspiring Professional'}
            </p>
            <div className="flex items-center gap-2 mt-4 text-muted-foreground text-sm">
              <MapPin size={14} /> {profile?.location || 'Location not set'}
            </div>
            <div className="flex items-center gap-2 mt-2 text-muted-foreground text-sm">
              <Mail size={14} /> {user.email || 'email@example.com'}
            </div>
          </CardContent>
          <CardContent className="p-6 space-y-5 bg-surface">
            <div className="space-y-1.5">
              <h4 className="text-sm font-semibold text-foreground">Education</h4>
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <GraduationCap size={16} className="mt-0.5 shrink-0" />
                <div className="flex flex-col">
                  {education?.college ? (
                    <>
                      <span className="font-semibold text-foreground">{education.college}</span>
                      <span>{education.branch}</span>
                      {education.currentYear && <span>Year {education.currentYear}, Semester {education.semester}</span>}
                      {education.cgpa && <span>CGPA: {education.cgpa} / 10</span>}
                      {education.graduationYear && <span>Expected Graduation: {education.graduationYear}</span>}
                    </>
                  ) : (
                    <span>No education details set</span>
                  )}
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <h4 className="text-sm font-semibold text-foreground">Current Status</h4>
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <Building2 size={16} className="mt-0.5 shrink-0" />
                <span>{profile?.currentStatus || 'Actively looking for opportunities'}</span>
              </div>
            </div>
            
            <div className="space-y-1.5 pt-4 border-t border-border">
              <h4 className="text-sm font-semibold text-foreground">Resume</h4>
              {profile?.resumeUrl ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText size={16} className="text-accent shrink-0" />
                    <span className="truncate flex-1 text-left font-medium">Uploaded Resume.pdf</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs h-8 gap-1"
                      onClick={() => window.open(resumeSrc, '_blank')}
                      disabled={isUploadingResume}
                    >
                      <ExternalLink size={12} /> View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-8 gap-1 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20"
                      onClick={handleResumeDelete}
                      disabled={isUploadingResume}
                    >
                      <Trash2 size={12} /> Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="pt-1">
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-border/80 hover:border-accent/50 rounded-xl p-4 cursor-pointer transition-colors group">
                    {isUploadingResume ? (
                      <Loader2 className="w-6 h-6 animate-spin text-accent" />
                    ) : (
                      <>
                        <Upload size={20} className="text-muted-foreground group-hover:text-accent transition-colors mb-1.5" />
                        <span className="text-xs font-semibold text-foreground">Upload Resume</span>
                        <span className="text-[10px] text-muted-foreground mt-0.5">PDF (max 10MB)</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={handleResumeUpload}
                      disabled={isUploadingResume}
                    />
                  </label>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Details */}
        <div className="md:col-span-2 space-y-6">
          <Card className="shadow-sm bg-surface border-border">
            <CardHeader>
              <CardTitle>About Me</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {profile?.bio || 'No bio added yet. Write a short professional summary.'}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm bg-surface border-border">
            <CardHeader>
              <CardTitle>Skills & Proficiencies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {skills.length > 0 ? skills.map((skill: any) => (
                  <div
                    key={skill.id}
                    className="px-3 py-1.5 bg-muted/50 text-foreground rounded-lg text-sm font-medium border border-border/50 shadow-sm flex items-center gap-2"
                  >
                    <span>{skill.skill?.name || skill.name}</span>
                    <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold">
                      {skill.currentLevel}/10
                    </span>
                  </div>
                )) : (
                  <p className="text-sm text-muted-foreground">No skills added yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="bg-surface border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl p-6 relative flex flex-col space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h2 className="text-2xl font-bold font-heading text-foreground">Edit Student Profile</h2>
              <button
                onClick={() => setIsEditing(false)}
                className="text-muted-foreground hover:text-foreground transition-colors p-1"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-foreground">First Name</label>
                  <Input
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First Name"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-foreground">Last Name</label>
                  <Input
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last Name"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-foreground">Headline</label>
                <Input
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g. Aspiring Backend Engineer | Node.js & React"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-foreground">Bio</label>
                <textarea
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-foreground">Current Status</label>
                  <Input
                    value={currentStatus}
                    onChange={(e) => setCurrentStatus(e.target.value)}
                    placeholder="e.g. Seeking Summer Internships"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-foreground">Location</label>
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. San Francisco, CA"
                  />
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <h3 className="text-lg font-bold font-heading text-foreground mb-4">Education Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-foreground">College / University</label>
                    <Input
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      placeholder="e.g. Global Institute of Tech"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-foreground">Branch / Major</label>
                    <Input
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      placeholder="e.g. Computer Science"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-foreground">Current Year</label>
                    <Input
                      type="number"
                      min="1"
                      max="5"
                      value={currentYear}
                      onChange={(e) => setCurrentYear(e.target.value)}
                      placeholder="e.g. 3"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-foreground">Current Semester</label>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={semester}
                      onChange={(e) => setSemester(e.target.value)}
                      placeholder="e.g. 5"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-foreground">CGPA</label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      value={cgpa}
                      onChange={(e) => setCgpa(e.target.value)}
                      placeholder="e.g. 8.5"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-foreground">Graduation Year</label>
                    <Input
                      type="number"
                      min="2020"
                      max="2100"
                      value={graduationYear}
                      onChange={(e) => setGraduationYear(e.target.value)}
                      placeholder="e.g. 2026"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="accent"
                  className="gap-2"
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
