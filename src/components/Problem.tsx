import { AlertCircle, XCircle, Clock, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const problems = [
  {
    icon: AlertCircle,
    title: "1,000+ CVs Per Role",
    description: "Recruiters are overwhelmed with applications, leading to hasty decisions and missed talent.",
  },
  {
    icon: XCircle,
    title: "Silent Rejections",
    description: "Candidates apply to 30+ roles daily but never know why they were rejected.",
  },
  {
    icon: Clock,
    title: "Time Wasted on Screening",
    description: "Recruiters spend 60% of their time on manual CV review instead of candidate relationships.",
  },
  {
    icon: Users,
    title: "Great Talent Filtered Out",
    description: "ATS systems reject qualified candidates due to keyword mismatches, not lack of capability.",
  },
];

const Problem = () => {
  return (
    <section className="py-20 bg-card">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">
            The Problem
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-card-foreground mt-4 mb-6 font-serif">
            Hiring is Automated—
            <br />
            <span className="text-muted">But Intelligence is Missing</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Traditional ATS systems ask: "Does this CV match keywords?"
            <br />
            They should ask: "Will this candidate succeed in this role?"
          </p>
        </div>

        {/* Problem Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {problems.map((problem, index) => (
            <Card
              key={index}
              className="group hover:shadow-lg transition-all duration-300 border-border hover:border-primary/50"
            >
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center mb-4 group-hover:bg-destructive/20 transition-colors">
                  <problem.icon className="w-6 h-6 text-destructive" />
                </div>
                <h3 className="text-lg font-semibold text-card-foreground mb-2">
                  {problem.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {problem.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quote */}
        <div className="mt-16 text-center">
          <blockquote className="text-xl md:text-2xl text-muted-foreground italic max-w-3xl mx-auto">
            "Sarah applies to 30-40 roles every day—but hears back from almost none.
            Not because she's unqualified. Because her CV never passes automated shortlisting."
          </blockquote>
        </div>
      </div>
    </section>
  );
};

export default Problem;
