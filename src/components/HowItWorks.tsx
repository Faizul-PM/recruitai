import { Upload, Brain, FileCheck, Briefcase } from "lucide-react";

const steps = [
  {
    icon: Upload,
    step: "01",
    title: "Upload Your CV",
    description: "Simply upload your resume. Our AI instantly parses and understands your complete profile.",
  },
  {
    icon: Brain,
    step: "02",
    title: "AI Analysis",
    description: "Multi-agent system evaluates your skills, experience, and career trajectory intelligently.",
  },
  {
    icon: FileCheck,
    step: "03",
    title: "Get Insights",
    description: "Receive actionable feedback on CV improvements and skill positioning strategies.",
  },
  {
    icon: Briefcase,
    step: "04",
    title: "Match & Apply",
    description: "Get matched with roles where you'll truly succeed, not just keyword matches.",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">
            How It Works
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mt-4 mb-6 font-serif">
            From CV to Career—
            <span className="text-primary"> In 4 Steps</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Whether you're a job seeker or recruiter, getting started is simple.
          </p>
        </div>

        {/* Steps */}
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((item, index) => (
              <div key={index} className="relative group">
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-full w-full h-0.5 bg-border -translate-y-1/2 z-0">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary" />
                  </div>
                )}

                <div className="relative z-10 p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg text-center">
                  {/* Step Number */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full">
                    {item.step}
                  </div>

                  {/* Icon */}
                  <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mx-auto mt-4 mb-4 group-hover:bg-primary/10 transition-colors">
                    <item.icon className="w-8 h-8 text-accent-foreground group-hover:text-primary transition-colors" />
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-semibold text-card-foreground mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
