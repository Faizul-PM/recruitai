import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { 
  Sparkles, 
  Upload, 
  FileText, 
  Trash2, 
  LogOut, 
  User,
  Loader2,
  Download,
  Calendar
} from "lucide-react";
import { format } from "date-fns";

interface CV {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  uploaded_at: string;
}

const Dashboard = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [cvs, setCvs] = useState<CV[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchCVs = useCallback(async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from("cvs")
      .select("*")
      .order("uploaded_at", { ascending: false });
    
    if (error) {
      console.error("Error fetching CVs:", error);
    } else {
      setCvs(data || []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchCVs();
    }
  }, [user, fetchCVs]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !user) return;

    setUploading(true);
    let uploadedCount = 0;

    for (const file of Array.from(files)) {
      // Validate file type
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      
      if (!allowedTypes.includes(file.type)) {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: `${file.name} is not a valid CV format. Please upload PDF or Word documents.`,
        });
        continue;
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: `${file.name} exceeds the 10MB limit.`,
        });
        continue;
      }

      const filePath = `${user.id}/${Date.now()}-${file.name}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("cvs")
        .upload(filePath, file);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        toast({
          variant: "destructive",
          title: "Upload failed",
          description: `Failed to upload ${file.name}. Please try again.`,
        });
        continue;
      }

      // Save metadata to database
      const { error: dbError } = await supabase.from("cvs").insert({
        user_id: user.id,
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
      });

      if (dbError) {
        console.error("Database error:", dbError);
        // Try to delete the uploaded file
        await supabase.storage.from("cvs").remove([filePath]);
        toast({
          variant: "destructive",
          title: "Upload failed",
          description: `Failed to save ${file.name}. Please try again.`,
        });
        continue;
      }

      uploadedCount++;
    }

    if (uploadedCount > 0) {
      toast({
        title: "Upload successful!",
        description: `${uploadedCount} CV(s) uploaded successfully.`,
      });
      fetchCVs();
    }

    setUploading(false);
    e.target.value = "";
  };

  const handleDelete = async (cv: CV) => {
    setDeleting(cv.id);

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from("cvs")
      .remove([cv.file_path]);

    if (storageError) {
      console.error("Storage delete error:", storageError);
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from("cvs")
      .delete()
      .eq("id", cv.id);

    if (dbError) {
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: "Failed to delete the CV. Please try again.",
      });
    } else {
      toast({
        title: "CV deleted",
        description: "The CV has been removed from your account.",
      });
      fetchCVs();
    }

    setDeleting(null);
  };

  const handleDownload = async (cv: CV) => {
    const { data, error } = await supabase.storage
      .from("cvs")
      .download(cv.file_path);

    if (error) {
      toast({
        variant: "destructive",
        title: "Download failed",
        description: "Failed to download the CV. Please try again.",
      });
      return;
    }

    // Create download link
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = cv.file_name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "Unknown size";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">
              Recruit<span className="text-primary">AI</span>
            </span>
          </a>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">{user?.email}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground font-serif mb-2">
              Your Dashboard
            </h1>
            <p className="text-muted-foreground">
              Upload and manage your CVs. Our AI will help you get shortlisted for the right roles.
            </p>
          </div>

          {/* Upload Section */}
          <Card className="mb-8 border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-primary" />
                Upload CVs
              </CardTitle>
              <CardDescription>
                Upload your resumes in PDF or Word format (max 10MB each). You can upload multiple files at once.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                <input
                  type="file"
                  id="cv-upload"
                  className="hidden"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  multiple
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
                <label
                  htmlFor="cv-upload"
                  className="cursor-pointer flex flex-col items-center gap-4"
                >
                  {uploading ? (
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <FileText className="w-8 h-8 text-primary" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-foreground">
                      {uploading ? "Uploading..." : "Click to upload or drag and drop"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      PDF, DOC, DOCX (max 10MB)
                    </p>
                  </div>
                  {!uploading && (
                    <Button variant="outline" className="pointer-events-none">
                      Choose Files
                    </Button>
                  )}
                </label>
              </div>
            </CardContent>
          </Card>

          {/* CVs List */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Your CVs
                </span>
                <span className="text-sm font-normal text-muted-foreground">
                  {cvs.length} file{cvs.length !== 1 ? "s" : ""}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cvs.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No CVs uploaded yet</p>
                  <p className="text-sm">Upload your first CV to get started!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cvs.map((cv) => (
                    <div
                      key={cv.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-accent/30 border border-border hover:border-primary/30 transition-colors"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {cv.file_name}
                          </p>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span>{formatFileSize(cv.file_size)}</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(cv.uploaded_at), "MMM d, yyyy")}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(cv)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(cv)}
                          disabled={deleting === cv.id}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          {deleting === cv.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
