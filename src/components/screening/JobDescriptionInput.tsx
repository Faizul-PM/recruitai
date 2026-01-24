import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

interface JobDescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const JobDescriptionInput = ({ value, onChange, disabled }: JobDescriptionInputProps) => {
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Job Description
        </CardTitle>
        <CardDescription>
          Paste the job description to match against your uploaded CVs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder="Paste the job description here...

Example:
We are looking for a Senior Software Engineer with:
- 5+ years of experience in React and TypeScript
- Strong backend skills in Node.js or Python
- Experience with cloud platforms (AWS/GCP)
- Excellent communication skills..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-[200px] resize-y"
          disabled={disabled}
        />
      </CardContent>
    </Card>
  );
};

export default JobDescriptionInput;
