import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import JobDescriptionInput from "@/components/screening/JobDescriptionInput";
import ScreeningResults from "@/components/screening/ScreeningResults";
import { useScreenCVs } from "@/hooks/useScreenCVs";
import { 
  Sparkles, 
  Upload, 
  FileText, 
  Trash2, 
  LogOut, 
  User,
  Loader2,
  Download,
  Calendar,
  Search,
  ArrowLeft,
  CheckSquare
} from "lucide-react";
import { format } from "date-fns";

interface CV {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  uploaded_at: string;
}

type Step = "upload" | "job-description" | "results";

const Dashboard = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [cvs, setCvs] = useState<CV[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [selectedCVs, setSelectedCVs] = useState<Set<string>>(new Set());
  const [currentStep, setCurrentStep] = useState<Step>("upload");
  const [jobDescription, setJobDescription] = useState("");
  
  const { screening, results, screenCVs, clearResults } = useScreenCVs();

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

      if (file.size > 10 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: `${file.name} exceeds the 10MB limit.`,
        });
        continue;
      }

      const filePath = `${user.id}/${Date.now()}-${file.name}`;

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

      const { error: dbError } = await supabase.from("cvs").insert({
        user_id: user.id,
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
      });

      if (dbError) {
        console.error("Database error:", dbError);
        await supabase.storage.from("cvs").remove([filePath]);
        toast({
          variant: "destructive",
          title: "Upload failed",
          description: `Failed to save ${file.name}. Please try again.`,
        });
        continue;
      }

      // Send CV data to n8n webhook
      try {
        const { data: publicUrlData } = supabase.storage
          .from("cvs")
          .getPublicUrl(filePath);

        await fetch("https://faizulislam.app.n8n.cloud/webhook-test/9e3837ee-a381-4ad2-acdd-cd1de73979c0", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fileName: file.name,
            filePath: filePath,
            fileSize: file.size,
            fileUrl: publicUrlData.publicUrl,
            userId: user.id,
            userEmail: user.email,
            uploadedAt: new Date().toISOString(),
          }),
        });
      } catch (webhookError) {
        console.error("Webhook error:", webhookError);
        // Continue even if webhook fails - CV is already saved
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

    const { error: storageError } = await supabase.storage
      .from("cvs")
      .remove([cv.file_path]);

    if (storageError) {
      console.error("Storage delete error:", storageError);
    }

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
      setSelectedCVs(prev => {
        const next = new Set(prev);
        next.delete(cv.id);
        return next;
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

  const toggleCVSelection = (cvId: string) => {
    setSelectedCVs(prev => {
      const next = new Set(prev);
      if (next.has(cvId)) {
        next.delete(cvId);
      } else {
        next.add(cvId);
      }
      return next;
    });
  };

  const selectAllCVs = () => {
    if (selectedCVs.size === cvs.length) {
      setSelectedCVs(new Set());
    } else {
      setSelectedCVs(new Set(cvs.map(cv => cv.id)));
    }
  };

  const handleStartScreening = async () => {
    if (selectedCVs.size === 0) {
      toast({
        variant: "destructive",
        title: "No CVs selected",
        description: "Please select at least one CV to screen.",
      });
      return;
    }

    // Send selected CVs data to webhook
    try {
      const selectedCVData = cvs.filter(cv => selectedCVs.has(cv.id));
      const cvDetails = selectedCVData.map(cv => {
        const { data: publicUrlData } = supabase.storage
          .from("cvs")
          .getPublicUrl(cv.file_path);
        
        return {
          id: cv.id,
          fileName: cv.file_name,
          filePath: cv.file_path,
          fileSize: cv.file_size,
          fileUrl: publicUrlData.publicUrl,
          uploadedAt: cv.uploaded_at,
        };
      });

      await fetch("https://rahe-123456789.app.n8n.cloud/webhook-test/bee9e0e8-adf6-4aa0-9408-9d77af6d6bc3", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "start_screening",
          userId: user?.id,
          userEmail: user?.email,
          selectedCVs: cvDetails,
          totalSelected: selectedCVs.size,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (webhookError) {
      console.error("Webhook error:", webhookError);
    }

    setCurrentStep("job-description");
  };

  const handleRunScreening = async () => {
    const selectedCVData = cvs.filter(cv => selectedCVs.has(cv.id));
    await screenCVs(jobDescription, selectedCVData, user?.id, user?.email);
    if (!screening) {
      setCurrentStep("results");
    }
  };

  const handleBackToUpload = () => {
    setCurrentStep("upload");
    clearResults();
  };

  const handleNewScreening = () => {
    setCurrentStep("job-description");
    clearResults();
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
      <header className="border-b border-border bg-card sticky top-0 z-50">
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

      {/* Progress Steps */}
      <div className="border-b border-border bg-card/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-2 md:gap-8">
            {[
              { step: "upload", label: "1. Upload CVs", icon: Upload },
              { step: "job-description", label: "2. Job Description", icon: FileText },
              { step: "results", label: "3. Results", icon: Search },
            ].map(({ step, label, icon: Icon }, index) => (
              <div key={step} className="flex items-center gap-2">
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    currentStep === step
                      ? "bg-primary text-primary-foreground"
                      : currentStep === "results" && index < 2
                      ? "bg-chart-1/20 text-chart-1"
                      : currentStep === "job-description" && index === 0
                      ? "bg-chart-1/20 text-chart-1"
                      : "bg-muted/30 text-muted-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                </div>
                {index < 2 && (
                  <div className="w-8 h-0.5 bg-border hidden md:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          
          {/* Step 1: Upload CVs */}
          {currentStep === "upload" && (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground font-serif mb-2">
                  Upload & Select CVs
                </h1>
                <p className="text-muted-foreground">
                  Upload candidate CVs and select which ones to screen against a job description.
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
                    Upload resumes in PDF or Word format (max 10MB each).
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

              {/* CVs List with Selection */}
              <Card className="border-border">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      Select CVs to Screen
                    </CardTitle>
                    <div className="flex items-center gap-3">
                      {cvs.length > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={selectAllCVs}
                        >
                          <CheckSquare className="w-4 h-4 mr-2" />
                          {selectedCVs.size === cvs.length ? "Deselect All" : "Select All"}
                        </Button>
                      )}
                      <span className="text-sm text-muted-foreground">
                        {selectedCVs.size} of {cvs.length} selected
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {cvs.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No CVs uploaded yet</p>
                      <p className="text-sm">Upload CVs to get started!</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3 mb-6">
                        {cvs.map((cv) => (
                          <div
                            key={cv.id}
                            className={`flex items-center justify-between p-4 rounded-lg border transition-colors cursor-pointer ${
                              selectedCVs.has(cv.id)
                                ? "bg-primary/5 border-primary/30"
                                : "bg-accent/30 border-border hover:border-primary/30"
                            }`}
                            onClick={() => toggleCVSelection(cv.id)}
                          >
                            <div className="flex items-center gap-4 min-w-0">
                              <Checkbox
                                checked={selectedCVs.has(cv.id)}
                                onCheckedChange={() => toggleCVSelection(cv.id)}
                                onClick={(e) => e.stopPropagation()}
                              />
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
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownload(cv);
                                }}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(cv);
                                }}
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

                      <Button
                        className="w-full"
                        size="lg"
                        onClick={handleStartScreening}
                        disabled={selectedCVs.size === 0}
                      >
                        <Search className="w-5 h-5 mr-2" />
                        Screen {selectedCVs.size} CV{selectedCVs.size !== 1 ? "s" : ""}
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </>
          )}

          {/* Step 2: Job Description */}
          {currentStep === "job-description" && (
            <>
              <div className="mb-8">
                <Button
                  variant="ghost"
                  onClick={handleBackToUpload}
                  className="mb-4"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to CV Selection
                </Button>
                <h1 className="text-3xl font-bold text-foreground font-serif mb-2">
                  Enter Job Description
                </h1>
                <p className="text-muted-foreground">
                  Paste the job description to match {selectedCVs.size} selected CV{selectedCVs.size !== 1 ? "s" : ""} against.
                </p>
              </div>

              <JobDescriptionInput
                value={jobDescription}
                onChange={setJobDescription}
                disabled={screening}
              />

              <div className="mt-6 flex gap-4">
                <Button
                  variant="outline"
                  onClick={handleBackToUpload}
                  disabled={screening}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  className="flex-1"
                  size="lg"
                  onClick={handleRunScreening}
                  disabled={screening || !jobDescription.trim()}
                >
                  {screening ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Analyzing CVs...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Run AI Screening
                    </>
                  )}
                </Button>
              </div>
            </>
          )}

          {/* Step 3: Results */}
          {currentStep === "results" && results && (
            <>
              <div className="mb-8">
                <Button
                  variant="ghost"
                  onClick={handleNewScreening}
                  className="mb-4"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  New Screening
                </Button>
                <h1 className="text-3xl font-bold text-foreground font-serif mb-2">
                  Screening Results
                </h1>
                <p className="text-muted-foreground">
                  AI analysis complete. Review the ATS scores and recommendations below.
                </p>
              </div>

              <ScreeningResults results={results} />

              <div className="mt-8 flex gap-4">
                <Button
                  variant="outline"
                  onClick={handleBackToUpload}
                  className="flex-1"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload More CVs
                </Button>
                <Button
                  onClick={handleNewScreening}
                  className="flex-1"
                >
                  <Search className="w-4 h-4 mr-2" />
                  New Screening
                </Button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
