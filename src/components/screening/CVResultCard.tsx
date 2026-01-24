import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  FileText,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export interface CVResult {
  cvId: string;
  cvName: string;
  score: number;
  status: "selected" | "rejected";
  missingKeywords: string[];
  matchedSkills: string[];
  selectionReasons: string[];
  rejectionReasons: string[];
  experienceMatch: string;
}

interface CVResultCardProps {
  result: CVResult;
}

const CVResultCard = ({ result }: CVResultCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const isSelected = result.status === "selected";

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-chart-1";
    if (score >= 60) return "text-chart-2";
    if (score >= 40) return "text-chart-4";
    return "text-destructive";
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-chart-1";
    if (score >= 60) return "bg-chart-2";
    if (score >= 40) return "bg-chart-4";
    return "bg-destructive";
  };

  return (
    <Card className={`border-border transition-all ${isSelected ? "border-l-4 border-l-chart-1" : "border-l-4 border-l-destructive"}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isSelected ? "bg-chart-1/10" : "bg-destructive/10"}`}>
              <FileText className={`w-5 h-5 ${isSelected ? "text-chart-1" : "text-destructive"}`} />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-lg truncate">{result.cvName}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={isSelected ? "default" : "destructive"} className="text-xs">
                  {isSelected ? (
                    <><CheckCircle2 className="w-3 h-3 mr-1" /> Selected</>
                  ) : (
                    <><XCircle className="w-3 h-3 mr-1" /> Rejected</>
                  )}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="text-right flex-shrink-0">
            <div className={`text-3xl font-bold ${getScoreColor(result.score)}`}>
              {result.score}
            </div>
            <div className="text-xs text-muted-foreground">ATS Score</div>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-muted-foreground">Match Score</span>
            <span className={getScoreColor(result.score)}>{result.score}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${getProgressColor(result.score)}`}
              style={{ width: `${result.score}%` }}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Experience Match Summary */}
        <p className="text-sm text-muted-foreground mb-4">
          {result.experienceMatch}
        </p>

        {/* Matched Skills */}
        {result.matchedSkills.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-chart-1" />
              Matched Skills
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {result.matchedSkills.slice(0, expanded ? undefined : 5).map((skill, i) => (
                <Badge key={i} variant="secondary" className="text-xs bg-chart-1/10 text-chart-1 border-0">
                  {skill}
                </Badge>
              ))}
              {!expanded && result.matchedSkills.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{result.matchedSkills.length - 5} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Missing Keywords */}
        {result.missingKeywords.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4 text-chart-4" />
              Missing Keywords
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {result.missingKeywords.slice(0, expanded ? undefined : 5).map((keyword, i) => (
                <Badge key={i} variant="outline" className="text-xs border-chart-4/30 text-chart-4">
                  {keyword}
                </Badge>
              ))}
              {!expanded && result.missingKeywords.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{result.missingKeywords.length - 5} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Expandable Details */}
        {expanded && (
          <div className="space-y-4 pt-2 border-t border-border mt-4">
            {/* Selection Reasons */}
            {isSelected && result.selectionReasons.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-chart-1 mb-2">
                  ✓ Selection Reasons
                </h4>
                <ul className="space-y-1.5">
                  {result.selectionReasons.map((reason, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-chart-1 mt-0.5">•</span>
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Rejection Reasons */}
            {!isSelected && result.rejectionReasons.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-destructive mb-2">
                  ✕ Rejection Reasons
                </h4>
                <ul className="space-y-1.5">
                  {result.rejectionReasons.map((reason, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-destructive mt-0.5">•</span>
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-2"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <>
              <ChevronUp className="w-4 h-4 mr-1" />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4 mr-1" />
              View Details
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default CVResultCard;
