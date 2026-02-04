import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Loader2, FileText, Download, Calendar, TrendingUp, TrendingDown, Minus, History, Eye, Users, CheckCircle2, XCircle, Clock } from "lucide-react";
import { format } from "date-fns";

interface CVWithScreening {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  uploaded_at: string;
  screenings: {
    id: string;
    ats_score: number | null;
    status: string;
    screened_at: string;
    job_role?: {
      title: string;
    } | null;
  }[];
}

export default function CVHistory() {
  const { user } = useAuth();
  const [cvs, setCvs] = useState<CVWithScreening[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCVHistory = async () => {
      if (!user) return;

      const { data: cvsData, error: cvsError } = await supabase
        .from("cvs")
        .select("*")
        .order("uploaded_at", { ascending: false });

      if (cvsError) {
        console.error("Error fetching CVs:", cvsError);
        setLoading(false);
        return;
      }

      const { data: screeningsData, error: screeningsError } = await supabase
        .from("cv_screenings")
        .select(`
          id,
          cv_id,
          ats_score,
          status,
          screened_at,
          job_roles (title)
        `)
        .order("screened_at", { ascending: false });

      if (screeningsError) {
        console.error("Error fetching screenings:", screeningsError);
      }

      const cvsWithScreenings = (cvsData || []).map(cv => ({
        ...cv,
        screenings: (screeningsData || [])
          .filter(s => s.cv_id === cv.id)
          .map(s => ({
            id: s.id,
            ats_score: s.ats_score,
            status: s.status,
            screened_at: s.screened_at,
            job_role: s.job_roles
          }))
      }));

      setCvs(cvsWithScreenings);
      setLoading(false);
    };

    fetchCVHistory();
  }, [user]);

  const handleDownload = async (cv: CVWithScreening) => {
    const { data, error } = await supabase.storage
      .from("cvs")
      .download(cv.file_path);

    if (error) return;

    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = cv.file_name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; className: string; icon: React.ReactNode }> = {
      selected: { variant: "default", className: "bg-chart-1 hover:bg-chart-1/80 border-0", icon: <CheckCircle2 className="h-3 w-3" /> },
      rejected: { variant: "destructive", className: "border-0", icon: <XCircle className="h-3 w-3" /> },
      review: { variant: "secondary", className: "bg-chart-4 text-foreground hover:bg-chart-4/80 border-0", icon: <Clock className="h-3 w-3" /> },
      pending: { variant: "outline", className: "bg-muted/50", icon: <Clock className="h-3 w-3" /> }
    };
    const { variant, className, icon } = config[status] || config.pending;
    return (
      <Badge variant={variant} className={`${className} flex items-center gap-1 capitalize`}>
        {icon}
        {status}
      </Badge>
    );
  };

  const getScoreDisplay = (score: number | null) => {
    if (score === null) return { icon: Minus, color: "text-muted-foreground", bg: "bg-muted/50", ring: "ring-muted" };
    if (score >= 70) return { icon: TrendingUp, color: "text-chart-1", bg: "bg-chart-1/10", ring: "ring-chart-1/30" };
    if (score >= 40) return { icon: Minus, color: "text-chart-4", bg: "bg-chart-4/10", ring: "ring-chart-4/30" };
    return { icon: TrendingDown, color: "text-destructive", bg: "bg-destructive/10", ring: "ring-destructive/30" };
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "Unknown";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Calculate stats
  const totalCVs = cvs.length;
  const totalScreenings = cvs.reduce((acc, cv) => acc + cv.screenings.length, 0);
  const selectedCount = cvs.reduce((acc, cv) => acc + cv.screenings.filter(s => s.status === 'selected').length, 0);
  const avgScore = cvs.reduce((acc, cv) => {
    const scores = cv.screenings.filter(s => s.ats_score !== null).map(s => s.ats_score as number);
    return acc + scores.reduce((a, b) => a + b, 0);
  }, 0) / (totalScreenings || 1);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
            <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" />
          </div>
          <p className="text-muted-foreground text-sm">Loading CV history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="CV History"
        description="View all uploaded CVs and their screening results"
        icon={<History className="w-6 h-6 text-primary" />}
      />

      {/* Stats Section */}
      {cvs.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total CVs"
            value={totalCVs}
            icon={<FileText className="h-5 w-5 text-primary" />}
          />
          <StatsCard
            title="Total Screenings"
            value={totalScreenings}
            icon={<Eye className="h-5 w-5 text-primary" />}
          />
          <StatsCard
            title="Selected Candidates"
            value={selectedCount}
            icon={<Users className="h-5 w-5 text-primary" />}
          />
          <StatsCard
            title="Avg. ATS Score"
            value={`${Math.round(avgScore)}%`}
            icon={<TrendingUp className="h-5 w-5 text-primary" />}
          />
        </div>
      )}

      {cvs.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-8 h-8 text-primary" />}
          title="No CVs uploaded yet"
          description="Start by uploading some candidate CVs to see their history and screening results here."
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cvs.map((cv) => (
            <Card 
              key={cv.id} 
              className="group relative overflow-hidden hover:shadow-xl hover:border-primary/40 transition-all duration-500 hover:-translate-y-1"
            >
              {/* Decorative gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <CardHeader className="pb-4 relative">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-accent/30 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-sm">
                        <FileText className="h-7 w-7 text-primary" />
                      </div>
                      {cv.screenings.length > 0 && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-chart-1 flex items-center justify-center text-[10px] font-bold text-primary-foreground ring-2 ring-card">
                          {cv.screenings.length}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-base font-semibold truncate group-hover:text-primary transition-colors">
                        {cv.file_name}
                      </CardTitle>
                      <CardDescription className="text-xs mt-1 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted/50 text-muted-foreground">
                          {formatFileSize(cv.file_size)}
                        </span>
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDownload(cv)}
                    className="opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-primary/10 hover:text-primary"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4 relative">
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 rounded-lg px-3 py-2">
                  <Calendar className="h-3.5 w-3.5 text-primary/70" />
                  <span>Uploaded {format(new Date(cv.uploaded_at), "MMM d, yyyy 'at' h:mm a")}</span>
                </div>

                {cv.screenings.length > 0 ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <Eye className="h-3.5 w-3.5 text-primary" />
                        Screening Results
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {cv.screenings.length} {cv.screenings.length === 1 ? 'screening' : 'screenings'}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      {cv.screenings.slice(0, 2).map((screening) => {
                        const scoreDisplay = getScoreDisplay(screening.ats_score);
                        const ScoreIcon = scoreDisplay.icon;
                        return (
                          <div
                            key={screening.id}
                            className={`flex items-center justify-between p-3 rounded-xl ${scoreDisplay.bg} border border-border/50 ring-1 ${scoreDisplay.ring} transition-all duration-300 hover:scale-[1.02]`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl ${scoreDisplay.bg} flex items-center justify-center`}>
                                <ScoreIcon className={`h-5 w-5 ${scoreDisplay.color}`} />
                              </div>
                              <div>
                                <span className={`text-lg font-bold ${scoreDisplay.color}`}>
                                  {screening.ats_score !== null ? `${screening.ats_score}%` : "N/A"}
                                </span>
                                {screening.job_role && (
                                  <p className="text-xs text-muted-foreground truncate max-w-[120px]">
                                    {screening.job_role.title}
                                  </p>
                                )}
                              </div>
                            </div>
                            {getStatusBadge(screening.status)}
                          </div>
                        );
                      })}
                    </div>
                    
                    {cv.screenings.length > 2 && (
                      <Button variant="ghost" className="w-full text-xs text-muted-foreground hover:text-primary hover:bg-primary/5">
                        +{cv.screenings.length - 2} more screenings
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="p-6 rounded-xl bg-gradient-to-br from-muted/30 to-muted/10 border border-dashed border-border text-center">
                    <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-2">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">Not screened yet</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">Run AI screening to analyze</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}