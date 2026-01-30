import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, FileText, Calendar, CheckCircle } from "lucide-react";
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

  const statCards = [
    { title: "Total CVs", value: stats.totalCVs, icon: FileText, color: "text-chart-1" },
    { title: "Screenings", value: stats.totalScreenings, icon: BarChart3, color: "text-chart-2" },
    { title: "Selected", value: stats.selectedCandidates, icon: CheckCircle, color: "text-chart-1" },
    { title: "Open Jobs", value: stats.openJobs, icon: Users, color: "text-chart-4" },
    { title: "Upcoming Events", value: stats.upcomingEvents, icon: Calendar, color: "text-chart-5" },
    { title: "Emails Sent", value: stats.emailsSent, icon: TrendingUp, color: "text-primary" }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-serif">Performance</h1>
        <p className="text-muted-foreground">Track your recruiting metrics and activity</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{loading ? "..." : stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recruiting Activity</CardTitle>
          <CardDescription>Your recent recruitment performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium">Selection Rate</span>
              <span className="text-2xl font-bold">
                {stats.totalScreenings > 0 
                  ? Math.round((stats.selectedCandidates / stats.totalScreenings) * 100) 
                  : 0}%
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium">Avg CVs per Job</span>
              <span className="text-2xl font-bold">
                {stats.openJobs > 0 
                  ? Math.round(stats.totalCVs / stats.openJobs) 
                  : stats.totalCVs}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
