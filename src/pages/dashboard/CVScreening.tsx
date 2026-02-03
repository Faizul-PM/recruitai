import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { PageHeader } from "@/components/dashboard/PageHeader";
import JobDescriptionInput from "@/components/screening/JobDescriptionInput";
import ScreeningResults from "@/components/screening/ScreeningResults";
import { useScreenCVs } from "@/hooks/useScreenCVs";
import { 
  Upload, 
  FileText, 
  Trash2, 
  Loader2,
  Download,
  Calendar,
  Search,
  ArrowLeft,
  CheckSquare,
  Sparkles
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

export default function CVScreening() {
  const { user } = useAuth();
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

      await fetch("https://rahe-123456789.app.n8n.cloud/webhook-test/39e32d72-5d1a-4c9b-8876-060ead36fad3", {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <Card className="overflow-hidden border-0 bg-gradient-to-r from-primary/5 via-accent/10 to-background">
        <CardContent className="p-4 md:p-6">
          <div className="flex items-center justify-center gap-2 md:gap-6">
            {[
              { step: "upload", label: "1. Upload CVs", icon: Upload },
              { step: "job-description", label: "2. Job Description", icon: FileText },
              { step: "results", label: "3. Results", icon: Search },
            ].map(({ step, label, icon: Icon }, index) => (
              <div key={step} className="flex items-center gap-2">
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    currentStep === step
                      ? "bg-primary text-primary-foreground shadow-md"
                      : currentStep === "results" && index < 2
                      ? "bg-chart-1/20 text-chart-1"
                      : currentStep === "job-description" && index === 0
                      ? "bg-chart-1/20 text-chart-1"
                      : "bg-muted/50 text-muted-foreground"
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    currentStep === step ? "bg-primary-foreground/20" : ""
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="hidden sm:inline">{label}</span>
                </div>
                {index < 2 && (
                  <div className={`w-8 h-0.5 hidden md:block transition-colors ${
                    (currentStep === "results" && index < 2) || (currentStep === "job-description" && index === 0)
                      ? "bg-chart-1/50"
                      : "bg-border"
                  }`} />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step 1: Upload CVs */}
      {currentStep === "upload" && (
        <>
          <PageHeader
            title="Upload & Select CVs"
            description="Upload candidate CVs and select which ones to screen against a job description."
            icon={<Sparkles className="w-6 h-6 text-primary" />}
          />

          {/* Upload Section */}
          <Card className="overflow-hidden">
            <CardHeader className="border-b bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Upload className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Upload CVs</CardTitle>
                  <CardDescription>
                    Upload resumes in PDF or Word format (max 10MB each).
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 group">
                <input
                  type="file"
                  id="cv-upload"
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                  multiple
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
                <label
                  htmlFor="cv-upload"
                  className="cursor-pointer flex flex-col items-center gap-4"
                >
                  {uploading ? (
                    <Loader2 className="w-14 h-14 text-primary animate-spin" />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <FileText className="w-10 h-10 text-primary" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-lg">
                      {uploading ? "Uploading..." : "Click to upload or drag and drop"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      PDF, DOC, DOCX (max 10MB)
                    </p>
                  </div>
                  {!uploading && (
                    <Button variant="outline" className="pointer-events-none mt-2">
                      Choose Files
                    </Button>
                  )}
                </label>
              </div>
            </CardContent>
          </Card>

          {/* CVs List */}
          <Card className="overflow-hidden">
            <CardHeader className="border-b bg-muted/30">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-chart-2/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-chart-2" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Select CVs to Screen</CardTitle>
                    <CardDescription>
                      {cvs.length} CV(s) uploaded • {selectedCVs.size} selected
                    </CardDescription>
                  </div>
                </div>
                {cvs.length > 0 && (
                  <Button variant="outline" size="sm" onClick={selectAllCVs} className="gap-2">
                    <CheckSquare className="w-4 h-4" />
                    {selectedCVs.size === cvs.length ? "Deselect All" : "Select All"}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {cvs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                    <FileText className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="font-medium text-muted-foreground">No CVs uploaded yet</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">
                    Upload some CVs to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {cvs.map((cv) => (
                    <div
                      key={cv.id}
                      className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 cursor-pointer group ${
                        selectedCVs.has(cv.id)
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border hover:border-primary/50 hover:bg-muted/30"
                      }`}
                      onClick={() => toggleCVSelection(cv.id)}
                    >
                      <Checkbox
                        checked={selectedCVs.has(cv.id)}
                        onCheckedChange={() => toggleCVSelection(cv.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                        selectedCVs.has(cv.id)
                          ? "bg-gradient-to-br from-primary/30 to-accent/40"
                          : "bg-gradient-to-br from-primary/10 to-accent/20 group-hover:scale-105"
                      }`}>
                        <FileText className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{cv.file_name}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                          <span>{formatFileSize(cv.file_size)}</span>
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {format(new Date(cv.uploaded_at), "MMM d, yyyy")}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(cv);
                          }}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(cv);
                          }}
                          disabled={deleting === cv.id}
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

          {selectedCVs.size > 0 && (
            <div className="flex justify-end">
              <Button size="lg" onClick={handleStartScreening} className="gap-2 shadow-md">
                <Search className="w-4 h-4" />
                Screen {selectedCVs.size} CV{selectedCVs.size > 1 ? "s" : ""}
              </Button>
            </div>
          )}
        </>
      )}

      {/* Step 2: Job Description */}
      {currentStep === "job-description" && (
        <>
          <PageHeader
            title="Job Description"
            description={`Enter the job description to screen ${selectedCVs.size} selected CV(s) against.`}
            icon={<FileText className="w-6 h-6 text-primary" />}
            actions={
              <Button variant="ghost" size="sm" onClick={handleBackToUpload} className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            }
          />

          <JobDescriptionInput
            value={jobDescription}
            onChange={setJobDescription}
            disabled={screening}
          />
          
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={handleBackToUpload}>
              Back
            </Button>
            <Button onClick={handleRunScreening} disabled={screening || !jobDescription.trim()} className="gap-2 shadow-md">
              {screening ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Screening...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
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
          <PageHeader
            title="Screening Results"
            description={`AI analysis complete for ${results.length} candidate(s).`}
            icon={<Search className="w-6 h-6 text-primary" />}
            actions={
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleNewScreening} className="gap-2">
                  <Sparkles className="w-4 h-4" />
                  New Screening
                </Button>
                <Button variant="outline" size="sm" onClick={handleBackToUpload} className="gap-2">
                  <Upload className="w-4 h-4" />
                  Upload More CVs
                </Button>
              </div>
            }
          />

          <ScreeningResults results={results} />
        </>
      )}
    </div>
  );
}
