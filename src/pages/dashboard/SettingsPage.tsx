import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Settings, User, Bell, Shield, Loader2, Save, Mail, Phone, Lock, Eye, EyeOff } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    phone: ""
  });
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    screeningComplete: true,
    interviewReminders: true
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        setProfile({
          full_name: data.full_name || "",
          email: data.email || user.email || "",
          phone: data.phone || ""
        });
      } else {
        setProfile({
          full_name: "",
          email: user.email || "",
          phone: ""
        });
      }
      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        phone: profile.phone
      })
      .eq("user_id", user.id);

    if (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to update profile." });
    } else {
      toast({ title: "Profile updated!" });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title="Settings"
        description="Manage your account preferences"
        icon={<Settings className="w-6 h-6 text-primary" />}
      />

      {/* Profile Section */}
      <Card>
        <CardHeader className="border-b bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Profile Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                Full Name
              </Label>
              <Input
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                placeholder="Your name"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                Phone
              </Label>
              <Input
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
              Email
            </Label>
            <Input value={profile.email} disabled className="bg-muted/50" />
            <p className="text-xs text-muted-foreground">Email cannot be changed</p>
          </div>
          <Button onClick={handleSaveProfile} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Changes
          </Button>
        </CardContent>
      </Card>

      {/* Notifications Section */}
      <Card>
        <CardHeader className="border-b bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-chart-2/10 flex items-center justify-center">
              <Bell className="h-5 w-5 text-chart-2" />
            </div>
            <div>
              <CardTitle className="text-lg">Notifications</CardTitle>
              <CardDescription>Configure how you receive updates</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-1">
          <div className="flex items-center justify-between py-4 hover:bg-muted/30 rounded-lg px-3 -mx-3 transition-colors">
            <div className="space-y-0.5">
              <Label className="cursor-pointer">Email Alerts</Label>
              <p className="text-sm text-muted-foreground">Receive email notifications</p>
            </div>
            <Switch
              checked={notifications.emailAlerts}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, emailAlerts: checked })
              }
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between py-4 hover:bg-muted/30 rounded-lg px-3 -mx-3 transition-colors">
            <div className="space-y-0.5">
              <Label className="cursor-pointer">Screening Complete</Label>
              <p className="text-sm text-muted-foreground">Get notified when CV screening finishes</p>
            </div>
            <Switch
              checked={notifications.screeningComplete}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, screeningComplete: checked })
              }
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between py-4 hover:bg-muted/30 rounded-lg px-3 -mx-3 transition-colors">
            <div className="space-y-0.5">
              <Label className="cursor-pointer">Interview Reminders</Label>
              <p className="text-sm text-muted-foreground">Reminders for upcoming interviews</p>
            </div>
            <Switch
              checked={notifications.interviewReminders}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, interviewReminders: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Security Section */}
      <Card>
        <CardHeader className="border-b bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-chart-4/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-chart-4" />
            </div>
            <div>
              <CardTitle className="text-lg">Security</CardTitle>
              <CardDescription>Manage your account security</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <Button variant="outline" className="gap-2">
            <Lock className="h-4 w-4" />
            Change Password
          </Button>
          <Separator />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 rounded-lg bg-muted/30 border">
              <p className="text-xs text-muted-foreground mb-1">Account created</p>
              <p className="font-medium">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                }) : "N/A"}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/30 border">
              <p className="text-xs text-muted-foreground mb-1">Last sign in</p>
              <p className="font-medium">
                {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                }) : "N/A"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
