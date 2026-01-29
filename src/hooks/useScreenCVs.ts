import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CVResult } from "@/components/screening/CVResultCard";

interface CV {
  id: string;
  file_name: string;
  file_path: string;
}

export const useScreenCVs = () => {
  const [screening, setScreening] = useState(false);
  const [results, setResults] = useState<CVResult[] | null>(null);
  const { toast } = useToast();

  const extractTextFromBlob = async (blob: Blob, fileName: string): Promise<string> => {
    // For PDF files, we'll send the raw text if it's extractable
    // For other files, we read as text
    const text = await blob.text();
    
    // If the file appears to be binary (PDF/DOCX), return a placeholder
    // The AI will work with what we can extract
    if (text.includes("%PDF") || text.startsWith("PK")) {
      // For PDFs and DOCXs, we extract what readable text we can
      // Filter out binary characters and keep readable content
      const readableText = text
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\xFF]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      
      return readableText.length > 100 
        ? readableText 
        : `[Document: ${fileName}] - Unable to extract full text. The CV contains binary data that requires specialized parsing.`;
    }
    
    return text;
  };

  const screenCVs = async (jobDescription: string, selectedCVs: CV[], userId?: string, userEmail?: string) => {
    if (!jobDescription.trim()) {
      toast({
        variant: "destructive",
        title: "Job description required",
        description: "Please enter a job description to screen CVs against.",
      });
      return;
    }

    if (selectedCVs.length === 0) {
      toast({
        variant: "destructive",
        title: "No CVs selected",
        description: "Please select at least one CV to screen.",
      });
      return;
    }

    setScreening(true);
    setResults(null);

    try {
      // Send data to n8n webhook when AI screening starts
      const webhookData = {
        action: "run_ai_screening",
        userId: userId || null,
        userEmail: userEmail || null,
        jobDescription,
        selectedCVs: selectedCVs.map(cv => ({
          id: cv.id,
          fileName: cv.file_name,
          filePath: cv.file_path,
        })),
        totalSelected: selectedCVs.length,
        timestamp: new Date().toISOString(),
      };

      await fetch("https://rahe-123456789.app.n8n.cloud/webhook-test/9f14d533-9f56-496e-8eed-0e8fd02cb5f1", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(webhookData),
      }).catch(err => console.error("Failed to send AI screening webhook:", err));
      // Download and extract text from each CV
      const cvTexts = await Promise.all(
        selectedCVs.map(async (cv) => {
          const { data, error } = await supabase.storage
            .from("cvs")
            .download(cv.file_path);

          if (error) {
            console.error(`Failed to download ${cv.file_name}:`, error);
            return {
              id: cv.id,
              name: cv.file_name,
              content: `[Could not read CV: ${cv.file_name}]`,
            };
          }

          const content = await extractTextFromBlob(data, cv.file_name);
          return {
            id: cv.id,
            name: cv.file_name,
            content,
          };
        })
      );

      // Call the screening edge function
      const { data, error } = await supabase.functions.invoke("screen-cvs", {
        body: { jobDescription, cvTexts },
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setResults(data.results);
      
      const selected = data.results.filter((r: CVResult) => r.status === "selected").length;
      toast({
        title: "Screening complete!",
        description: `${selected} of ${data.results.length} candidates shortlisted.`,
      });

    } catch (error) {
      console.error("Screening error:", error);
      toast({
        variant: "destructive",
        title: "Screening failed",
        description: error instanceof Error ? error.message : "Failed to screen CVs. Please try again.",
      });
    } finally {
      setScreening(false);
    }
  };

  const clearResults = () => {
    setResults(null);
  };

  return {
    screening,
    results,
    screenCVs,
    clearResults,
  };
};
