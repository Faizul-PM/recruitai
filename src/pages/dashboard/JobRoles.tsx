import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Briefcase, Trash2, Edit, Users, Calendar } from "lucide-react";
import { format } from "date-fns";

interface JobRole {
  id: string;
  title: string;
  description: string | null;
  requirements: string[] | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function JobRoles() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<JobRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobRole | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    status: "open"
  });

  const fetchJobs = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("job_roles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching jobs:", error);
    } else {
      setJobs(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchJobs();
  }, [user]);

  const handleOpenDialog = (job?: JobRole) => {
    if (job) {
      setEditingJob(job);
      setFormData({
        title: job.title,
        description: job.description || "",
        requirements: job.requirements?.join("\n") || "",
        status: job.status
      });
    } else {
      setEditingJob(null);
      setFormData({ title: "", description: "", requirements: "", status: "open" });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!user || !formData.title) {
      toast({
        variant: "destructive",
        title: "Missing title",
        description: "Please enter a job title."
      });
      return;
    }

    const requirementsArray = formData.requirements
      .split("\n")
      .map(r => r.trim())
      .filter(r => r.length > 0);

    if (editingJob) {
      const { error } = await supabase
        .from("job_roles")
        .update({
          title: formData.title,
          description: formData.description || null,
          requirements: requirementsArray.length > 0 ? requirementsArray : null,
          status: formData.status
        })
        .eq("id", editingJob.id);

      if (error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to update job role." });
      } else {
        toast({ title: "Job role updated!" });
      }
    } else {
      const { error } = await supabase.from("job_roles").insert({
        user_id: user.id,
        title: formData.title,
        description: formData.description || null,
        requirements: requirementsArray.length > 0 ? requirementsArray : null,
        status: formData.status
      });

      if (error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to create job role." });
      } else {
        toast({ title: "Job role created!" });
      }
    }

    setIsDialogOpen(false);
    fetchJobs();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("job_roles").delete().eq("id", id);
    if (!error) {
      toast({ title: "Job role deleted" });
      fetchJobs();
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      open: "default",
      closed: "secondary",
      draft: "outline"
    };
    return <Badge variant={variants[status]}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-serif">Job Roles</h1>
          <p className="text-muted-foreground">Manage open positions and match candidates</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Job Role
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingJob ? "Edit Job Role" : "Create Job Role"}</DialogTitle>
              <DialogDescription>
                {editingJob ? "Update the job role details" : "Add a new position to your listings"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Job Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Senior Software Engineer"
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Job description..."
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label>Requirements (one per line)</Label>
                <Textarea
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  placeholder="5+ years of experience&#10;Bachelor's degree&#10;Strong communication skills"
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                {editingJob ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {jobs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No job roles created yet</p>
            <Button className="mt-4" onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Job Role
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <Card key={job.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{job.title}</CardTitle>
                    {getStatusBadge(job.status)}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenDialog(job)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(job.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {job.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {job.description}
                  </p>
                )}
                {job.requirements && job.requirements.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {job.requirements.slice(0, 3).map((req, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {req.length > 20 ? req.slice(0, 20) + "..." : req}
                      </Badge>
                    ))}
                    {job.requirements.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{job.requirements.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}
                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(job.created_at), "MMM d, yyyy")}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
