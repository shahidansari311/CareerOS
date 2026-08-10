import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function SettingsPage() {
  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold font-heading text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your account and preferences.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-muted-foreground">First Name</label>
              <Input defaultValue="Shahid" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-muted-foreground">Last Name</label>
              <Input defaultValue="Ansari" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-muted-foreground">Email</label>
            <Input defaultValue="shahid@example.com" type="email" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-muted-foreground">Target Role</label>
            <Input defaultValue="Frontend Developer" />
          </div>
          <Button variant="accent">Save Changes</Button>
        </CardContent>
      </Card>
    </div>
  );
}
