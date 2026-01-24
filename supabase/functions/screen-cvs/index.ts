import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { jobDescription, cvTexts } = await req.json();

    if (!jobDescription || !cvTexts || cvTexts.length === 0) {
      return new Response(
        JSON.stringify({ error: "Job description and CV texts are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert HR recruiter and ATS (Applicant Tracking System) analyzer. Your job is to:
1. Analyze CVs against a job description
2. Calculate an ATS compatibility score (0-100)
3. Identify missing keywords
4. Provide clear selection/rejection reasons

For each CV, you must return:
- score: number between 0-100
- status: "selected" (score >= 60) or "rejected" (score < 60)
- missingKeywords: array of important keywords from job description missing in CV
- selectionReasons: array of bullet points explaining why candidate is a good fit (if selected)
- rejectionReasons: array of bullet points explaining why candidate doesn't fit (if rejected)
- matchedSkills: array of skills that match the job requirements
- experienceMatch: brief assessment of experience relevance

Be objective and thorough in your analysis.`;

    const userPrompt = `Analyze these CVs against the following job description and provide ATS scores with detailed feedback.

JOB DESCRIPTION:
${jobDescription}

CVS TO ANALYZE:
${cvTexts.map((cv: { id: string; name: string; content: string }, index: number) => 
  `\n--- CV ${index + 1} (ID: ${cv.id}, Name: ${cv.name}) ---\n${cv.content}`
).join("\n")}

Return a JSON array with the analysis for each CV. Each object should have:
{
  "cvId": "the CV id",
  "cvName": "the CV filename",
  "score": number,
  "status": "selected" | "rejected",
  "missingKeywords": ["keyword1", "keyword2"],
  "matchedSkills": ["skill1", "skill2"],
  "selectionReasons": ["reason1", "reason2"],
  "rejectionReasons": ["reason1", "reason2"],
  "experienceMatch": "brief assessment"
}

Return ONLY the JSON array, no other text.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    // Parse the JSON response
    let results;
    try {
      // Clean the response - remove markdown code blocks if present
      let cleanContent = content.trim();
      if (cleanContent.startsWith("```json")) {
        cleanContent = cleanContent.slice(7);
      }
      if (cleanContent.startsWith("```")) {
        cleanContent = cleanContent.slice(3);
      }
      if (cleanContent.endsWith("```")) {
        cleanContent = cleanContent.slice(0, -3);
      }
      results = JSON.parse(cleanContent.trim());
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse AI response");
    }

    return new Response(
      JSON.stringify({ results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Screen CVs error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
