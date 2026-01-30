import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, FileText, Download, Eye, Calendar, TrendingUp, TrendingDown, Minus } from "lucide-react";
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
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      selected: "default",
      rejected: "destructive",
      review: "secondary",
      pending: "outline"
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  const getScoreIcon = (score: number | null) => {
    if (score === null) return <Minus className="h-4 w-4 text-muted-foreground" />;
    if (score >= 70) return <TrendingUp className="h-4 w-4 text-chart-1" />;
    if (score >= 40) return <Minus className="h-4 w-4 text-chart-4" />;
    return <TrendingDown className="h-4 w-4 text-destructive" />;
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
      <div>
        <h1 className="text-3xl font-bold font-serif">CV History</h1>
        <p className="text-muted-foreground">View all uploaded CVs and their screening results</p>
      </div>

      {cvs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No CVs uploaded yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {cvs.map((cv) => (
            <Card key={cv.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary" />
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
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  Uploaded {format(new Date(cv.uploaded_at), "MMM d, yyyy")}
                </div>

                {cv.screenings.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      Screenings ({cv.screenings.length})
                    </p>
                    {cv.screenings.slice(0, 2).map((screening) => (
                      <div
                        key={screening.id}
                        className="flex items-center justify-between p-2 rounded-md bg-muted/50"
                      >
                        <div className="flex items-center gap-2">
                          {getScoreIcon(screening.ats_score)}
                          <span className="text-sm font-medium">
                            {screening.ats_score !== null ? `${screening.ats_score}%` : "N/A"}
                          </span>
                        </div>
                        {getStatusBadge(screening.status)}
                      </div>
                    ))}
                    {cv.screenings.length > 2 && (
                      <p className="text-xs text-muted-foreground text-center">
                        +{cv.screenings.length - 2} more screenings
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="p-2 rounded-md bg-muted/30 text-center">
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
