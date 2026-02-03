import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Loader2, FileText, Download, Calendar, TrendingUp, TrendingDown, Minus, History, Eye } from "lucide-react";
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
    const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; className: string }> = {
      selected: { variant: "default", className: "bg-chart-1 hover:bg-chart-1/80" },
      rejected: { variant: "destructive", className: "" },
      review: { variant: "secondary", className: "bg-chart-4 text-foreground hover:bg-chart-4/80" },
      pending: { variant: "outline", className: "" }
    };
    const { variant, className } = config[status] || config.pending;
    return <Badge variant={variant} className={className}>{status}</Badge>;
  };

  const getScoreDisplay = (score: number | null) => {
    if (score === null) return { icon: Minus, color: "text-muted-foreground", bg: "bg-muted/50" };
    if (score >= 70) return { icon: TrendingUp, color: "text-chart-1", bg: "bg-chart-1/10" };
    if (score >= 40) return { icon: Minus, color: "text-chart-4", bg: "bg-chart-4/10" };
    return { icon: TrendingDown, color: "text-destructive", bg: "bg-destructive/10" };
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "Unknown";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
      <PageHeader
        title="CV History"
        description="View all uploaded CVs and their screening results"
        icon={<History className="w-6 h-6 text-primary" />}
      />

      {cvs.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-8 h-8 text-primary" />}
          title="No CVs uploaded yet"
          description="Start by uploading some candidate CVs to see their history and screening results here."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {cvs.map((cv) => (
            <Card key={cv.id} className="group hover:shadow-lg hover:border-primary/30 transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-sm font-medium truncate">
                        {cv.file_name}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {formatFileSize(cv.file_size)}
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDownload(cv)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  Uploaded {format(new Date(cv.uploaded_at), "MMM d, yyyy")}
                </div>

                {cv.screenings.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      Screenings ({cv.screenings.length})
                    </p>
                    {cv.screenings.slice(0, 2).map((screening) => {
                      const scoreDisplay = getScoreDisplay(screening.ats_score);
                      const ScoreIcon = scoreDisplay.icon;
                      return (
                        <div
                          key={screening.id}
                          className={`flex items-center justify-between p-3 rounded-lg ${scoreDisplay.bg} border border-border/50`}
                        >
                          <div className="flex items-center gap-2">
                            <ScoreIcon className={`h-4 w-4 ${scoreDisplay.color}`} />
                            <span className={`text-sm font-semibold ${scoreDisplay.color}`}>
                              {screening.ats_score !== null ? `${screening.ats_score}%` : "N/A"}
                            </span>
                          </div>
                          {getStatusBadge(screening.status)}
                        </div>
                      );
                    })}
                    {cv.screenings.length > 2 && (
                      <p className="text-xs text-muted-foreground text-center py-1">
                        +{cv.screenings.length - 2} more screenings
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="p-4 rounded-lg bg-muted/30 border border-dashed border-border text-center">
                    <p className="text-xs text-muted-foreground">Not screened yet</p>
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
