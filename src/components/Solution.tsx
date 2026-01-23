import { Brain, Target, Lightbulb, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const agents = [
  {
    icon: Brain,
    name: "Profile Agent",
    description: "Understands candidate capability, experience, and career intent beyond keywords.",
    color: "bg-chart-1",
  },
  {
    icon: Target,
    name: "Role Agent",
    description: "Analyzes real job needs beyond JD text to understand what success looks like.",
    color: "bg-chart-2",
  },
  {
    icon: Lightbulb,
    name: "Fit Agent",
    description: "Reasons about alignment, trade-offs, and gaps with explainable decisions.",
    color: "bg-chart-3",
  },
  {
    icon: RefreshCw,
    name: "Feedback Agent",
    description: "Learns from outcomes & recruiter signals, improving accuracy over time.",
    color: "bg-chart-4",
  },
];

const features = [
  {
    title: "Reasoning, Not Filtering",
    items: [
      "Evaluates transferable skills, not just exact matches",
      "Flags high-potential but non-obvious candidates",
      "Explains why someone was shortlisted or rejected",
    ],
  },
  {
    title: "Action-Oriented Intelligence",
    items: [
      "Suggests specific CV improvements per role",
      "Recommends skill positioning strategies",
      "Adapts recommendations based on market demand",
    ],
  },
  {
    title: "Continuous Learning Loop",
    items: [
      "Learns from recruiter actions and interview results",
      "Improves fit prediction over time",
      "Becomes more accurate with scale",
    ],
  },
];

const Solution = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">
            The Solution
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mt-4 mb-6 font-serif">
            Multi-Agent
            <span className="text-primary"> Hiring Intelligence</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Recruit AI simulates how an experienced recruiter thinks—
            operating continuously, objectively, and at massive scale.
          </p>
        </div>

        {/* Agent Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {agents.map((agent, index) => (
            <Card
              key={index}
              className="group hover:shadow-lg transition-all duration-300 border-border hover:border-primary/50 relative overflow-hidden"
            >
              <div className={`absolute top-0 left-0 w-full h-1 ${agent.color}`} />
              <CardContent className="p-6 pt-8">
                <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center mb-4">
                  <agent.icon className="w-7 h-7 text-accent-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-2">
                  {agent.name}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {agent.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-12">
          {features.map((feature, index) => (
            <div key={index} className="p-6 rounded-2xl bg-card border border-border">
              <h3 className="text-xl font-semibold text-card-foreground mb-4">
                {feature.title}
              </h3>
              <ul className="space-y-3">
                {feature.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    </div>
                    <span className="text-muted-foreground text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Differentiator */}
        <div className="mt-16 p-8 rounded-2xl bg-primary/10 border border-primary/20 text-center">
          <p className="text-xl md:text-2xl font-semibold text-foreground">
            "Recruit AI replaces resume filtering with{" "}
            <span className="text-primary">hiring intelligence.</span>"
          </p>
        </div>
      </div>
    </section>
  );
};

export default Solution;
