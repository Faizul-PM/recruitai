import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Users } from "lucide-react";
import CVResultCard, { CVResult } from "./CVResultCard";

interface ScreeningResultsProps {
  results: CVResult[];
}

const ScreeningResults = ({ results }: ScreeningResultsProps) => {
  const selectedCandidates = results.filter(r => r.status === "selected");
  const rejectedCandidates = results.filter(r => r.status === "rejected");
  
  // Sort by score descending
  const sortedSelected = [...selectedCandidates].sort((a, b) => b.score - a.score);
  const sortedRejected = [...rejectedCandidates].sort((a, b) => b.score - a.score);
  const allSorted = [...results].sort((a, b) => b.score - a.score);

  const averageScore = results.length > 0 
    ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{results.length}</p>
                <p className="text-xs text-muted-foreground">Total CVs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-chart-1/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-chart-1" />
              </div>
              <div>
                <p className="text-2xl font-bold text-chart-1">{selectedCandidates.length}</p>
                <p className="text-xs text-muted-foreground">Selected</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-destructive">{rejectedCandidates.length}</p>
                <p className="text-xs text-muted-foreground">Rejected</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                <span className="text-lg font-bold text-accent-foreground">%</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{averageScore}</p>
                <p className="text-xs text-muted-foreground">Avg Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all" className="flex items-center gap-2">
            All
            <Badge variant="secondary" className="text-xs">{results.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="selected" className="flex items-center gap-2">
            Selected
            <Badge variant="secondary" className="text-xs bg-chart-1/20 text-chart-1">{selectedCandidates.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex items-center gap-2">
            Rejected
            <Badge variant="secondary" className="text-xs bg-destructive/20 text-destructive">{rejectedCandidates.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid gap-4">
            {allSorted.map((result) => (
              <CVResultCard key={result.cvId} result={result} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="selected" className="mt-6">
          {sortedSelected.length === 0 ? (
            <Card className="border-border">
              <CardContent className="py-12 text-center text-muted-foreground">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No candidates selected</p>
                <p className="text-sm">Candidates with ATS score ≥ 60 will appear here</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {sortedSelected.map((result) => (
                <CVResultCard key={result.cvId} result={result} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rejected" className="mt-6">
          {sortedRejected.length === 0 ? (
            <Card className="border-border">
              <CardContent className="py-12 text-center text-muted-foreground">
                <XCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No candidates rejected</p>
                <p className="text-sm">All candidates meet the requirements!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {sortedRejected.map((result) => (
                <CVResultCard key={result.cvId} result={result} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ScreeningResults;
