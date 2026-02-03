import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { BarChart3, TrendingUp, Users, FileText, Calendar, CheckCircle, Target, Percent } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

interface Stats {
  totalCVs: number;
  totalScreenings: number;
  selectedCandidates: number;
  openJobs: number;
  upcomingEvents: number;
  emailsSent: number;
}

export default function PerformancePage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalCVs: 0,
    totalScreenings: 0,
    selectedCandidates: 0,
    openJobs: 0,
    upcomingEvents: 0,
    emailsSent: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      const [cvsRes, screeningsRes, jobsRes, eventsRes, emailsRes] = await Promise.all([
        supabase.from("cvs").select("id", { count: "exact", head: true }),
        supabase.from("cv_screenings").select("id, status"),
        supabase.from("job_roles").select("id, status"),
        supabase.from("calendar_events").select("id, start_time").gte("start_time", new Date().toISOString()),
        supabase.from("emails").select("id", { count: "exact", head: true })
      ]);

      const selectedCount = screeningsRes.data?.filter(s => s.status === "selected").length || 0;
      const openJobsCount = jobsRes.data?.filter(j => j.status === "open").length || 0;

      setStats({
        totalCVs: cvsRes.count || 0,
        totalScreenings: screeningsRes.data?.length || 0,
        selectedCandidates: selectedCount,
        openJobs: openJobsCount,
        upcomingEvents: eventsRes.data?.length || 0,
        emailsSent: emailsRes.count || 0
      });

      setLoading(false);
    };

    fetchStats();
  }, [user]);

  const selectionRate = stats.totalScreenings > 0 
    ? Math.round((stats.selectedCandidates / stats.totalScreenings) * 100) 
    : 0;

  const avgCVsPerJob = stats.openJobs > 0 
    ? Math.round(stats.totalCVs / stats.openJobs) 
    : stats.totalCVs;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Performance"
        description="Track your recruiting metrics and activity"
        icon={<BarChart3 className="w-6 h-6 text-primary" />}
      />

      {/* Main Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Total CVs"
          value={loading ? "..." : stats.totalCVs}
          icon={<FileText className="h-5 w-5 text-primary" />}
        />
        <StatsCard
          title="Screenings"
          value={loading ? "..." : stats.totalScreenings}
          icon={<BarChart3 className="h-5 w-5 text-chart-2" />}
        />
        <StatsCard
          title="Selected Candidates"
          value={loading ? "..." : stats.selectedCandidates}
          icon={<CheckCircle className="h-5 w-5 text-chart-1" />}
        />
        <StatsCard
          title="Open Jobs"
          value={loading ? "..." : stats.openJobs}
          icon={<Users className="h-5 w-5 text-chart-4" />}
        />
        <StatsCard
          title="Upcoming Events"
          value={loading ? "..." : stats.upcomingEvents}
          icon={<Calendar className="h-5 w-5 text-chart-3" />}
        />
        <StatsCard
          title="Emails Sent"
          value={loading ? "..." : stats.emailsSent}
          icon={<TrendingUp className="h-5 w-5 text-primary" />}
        />
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-gradient-to-r from-chart-1/10 to-transparent">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="w-8 h-8 rounded-lg bg-chart-1/20 flex items-center justify-center">
                <Percent className="h-4 w-4 text-chart-1" />
              </div>
              Selection Rate
            </CardTitle>
            <CardDescription>Percentage of candidates selected after screening</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex items-end gap-2">
              <span className="text-5xl font-bold text-chart-1">{loading ? "..." : selectionRate}</span>
              <span className="text-2xl text-muted-foreground mb-1">%</span>
            </div>
            <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-chart-1 to-chart-2 rounded-full transition-all duration-500"
                style={{ width: `${selectionRate}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              {stats.selectedCandidates} selected out of {stats.totalScreenings} screened
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-gradient-to-r from-primary/10 to-transparent">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <Target className="h-4 w-4 text-primary" />
              </div>
              Avg CVs per Job
            </CardTitle>
            <CardDescription>Average number of candidates per open position</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex items-end gap-2">
              <span className="text-5xl font-bold text-primary">{loading ? "..." : avgCVsPerJob}</span>
              <span className="text-lg text-muted-foreground mb-1">candidates</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-muted/50 border">
                <p className="text-xs text-muted-foreground">Total CVs</p>
                <p className="text-lg font-semibold">{stats.totalCVs}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 border">
                <p className="text-xs text-muted-foreground">Open Positions</p>
                <p className="text-lg font-semibold">{stats.openJobs}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Activity Summary
          </CardTitle>
          <CardDescription>Overview of your recent recruitment activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 rounded-xl bg-gradient-to-br from-chart-1/10 to-chart-1/5 border border-chart-1/20">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="h-5 w-5 text-chart-1" />
                <span className="font-medium">Candidates Processed</span>
              </div>
              <p className="text-3xl font-bold">{stats.totalScreenings}</p>
              <p className="text-sm text-muted-foreground mt-1">Total screenings completed</p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-chart-2/10 to-chart-2/5 border border-chart-2/20">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="h-5 w-5 text-chart-2" />
                <span className="font-medium">Scheduled Events</span>
              </div>
              <p className="text-3xl font-bold">{stats.upcomingEvents}</p>
              <p className="text-sm text-muted-foreground mt-1">Upcoming interviews & tasks</p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span className="font-medium">Communications</span>
              </div>
              <p className="text-3xl font-bold">{stats.emailsSent}</p>
              <p className="text-sm text-muted-foreground mt-1">Emails sent to candidates</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
