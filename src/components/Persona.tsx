import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Laptop, Target, Clock, Shield } from "lucide-react";

const Persona = () => {
  return (
    <section className="py-20 bg-card">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">
            Built For
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-card-foreground mt-4 mb-6 font-serif">
            Meet <span className="text-primary">Sarah</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Talent Acquisition Manager who finally reviews 50+ applications
            before lunch without burnout.
          </p>
        </div>

        {/* Persona Card */}
        <div className="max-w-5xl mx-auto">
          <Card className="overflow-hidden border-border">
            <CardContent className="p-0">
              <div className="grid md:grid-cols-3">
                {/* Profile Section */}
                <div className="p-8 bg-primary/5 border-b md:border-b-0 md:border-r border-border">
                  <div className="text-center">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center mx-auto mb-4">
                      <span className="text-4xl font-bold text-primary-foreground">S</span>
                    </div>
                    <h3 className="text-2xl font-bold text-card-foreground">Sarah</h3>
                    <p className="text-primary font-medium">Talent Acquisition Manager</p>
                    <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                      <p>Age: 32-42 years</p>
                      <p>Location: Bengaluru, India</p>
                      <p>Income: ₹15-25 LPA</p>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2 justify-center">
                      <Badge variant="secondary">High Digital Literacy</Badge>
                      <Badge variant="secondary">Daily SaaS User</Badge>
                    </div>
                  </div>
                </div>

                {/* Pains & Gains */}
                <div className="md:col-span-2 p-8">
                  <div className="grid sm:grid-cols-2 gap-8">
                    {/* Pains */}
                    <div>
                      <h4 className="text-lg font-semibold text-destructive mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-destructive" />
                        Pain Points
                      </h4>
                      <ul className="space-y-3">
                        {[
                          "Buried in unstructured PDFs daily",
                          "Decision fatigue from high-volume screening",
                          "Fear of missing great talent",
                          "Audit & compliance gaps",
                        ].map((pain, i) => (
                          <li key={i} className="flex items-start gap-2 text-muted-foreground text-sm">
                            <span className="text-destructive mt-1">×</span>
                            {pain}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Gains */}
                    <div>
                      <h4 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary" />
                        Desired Gains
                      </h4>
                      <ul className="space-y-3">
                        {[
                          "Faster time-to-hire metrics",
                          "Consistent, bias-reduced shortlisting",
                          "More time for candidate relationships",
                          "Prove ROI to leadership",
                        ].map((gain, i) => (
                          <li key={i} className="flex items-start gap-2 text-muted-foreground text-sm">
                            <span className="text-primary mt-1">✓</span>
                            {gain}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Success Metrics */}
                  <div className="mt-8 pt-6 border-t border-border">
                    <h4 className="text-sm font-semibold text-muted-foreground mb-4">
                      SUCCESS METRICS
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {[
                        { icon: Clock, label: "Time-to-shortlist", value: "< 24 hrs" },
                        { icon: Target, label: "Accuracy", value: "95%+" },
                        { icon: Laptop, label: "Platform", value: "Web + Mobile" },
                        { icon: Shield, label: "Compliance", value: "Full Audit Trail" },
                      ].map((metric, i) => (
                        <div key={i} className="text-center">
                          <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center mx-auto mb-2">
                            <metric.icon className="w-5 h-5 text-accent-foreground" />
                          </div>
                          <div className="text-sm font-semibold text-foreground">{metric.value}</div>
                          <div className="text-xs text-muted-foreground">{metric.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Persona;
