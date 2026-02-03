import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Sparkles, CheckCircle, Zap, Shield, Users, BarChart, Info, ArrowRight, Rocket, Target } from "lucide-react";

export default function AboutPage() {
  const features = [
    {
      icon: Zap,
      title: "AI-Powered Screening",
      description: "Instantly analyze CVs against job descriptions using advanced AI algorithms.",
      color: "text-chart-1",
      bg: "bg-chart-1/10"
    },
    {
      icon: BarChart,
      title: "ATS Scoring",
      description: "Get detailed ATS compatibility scores and keyword analysis for each candidate.",
      color: "text-chart-2",
      bg: "bg-chart-2/10"
    },
    {
      icon: Users,
      title: "Candidate Management",
      description: "Organize and track candidates throughout your hiring pipeline.",
      color: "text-chart-3",
      bg: "bg-chart-3/10"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your data is encrypted and protected with enterprise-grade security.",
      color: "text-chart-4",
      bg: "bg-chart-4/10"
    }
  ];

  const steps = [
    { step: 1, title: "Upload CVs", desc: "Upload candidate resumes in PDF or Word format", icon: Rocket },
    { step: 2, title: "Enter Job Description", desc: "Paste or type the job requirements", icon: Target },
    { step: 3, title: "AI Analysis", desc: "Our AI screens and scores each candidate", icon: Zap },
    { step: 4, title: "Review Results", desc: "Get detailed insights and shortlist candidates", icon: CheckCircle }
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="About RecruitAI"
        description="Intelligent Recruitment Made Simple"
        icon={<Info className="w-6 h-6 text-primary" />}
      />

      {/* Hero Banner */}
      <Card className="overflow-hidden border-0 bg-gradient-to-br from-primary/10 via-accent/20 to-background">
        <CardContent className="p-8 md:p-12 text-center relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-chart-1 flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Sparkles className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-serif mb-4">
              Recruit<span className="text-primary">AI</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-xl mx-auto mb-4">
              Transform your hiring process with AI-powered candidate screening and intelligent matching.
            </p>
            <Badge variant="secondary" className="text-sm">Version 1.0.0</Badge>
          </div>
        </CardContent>
      </Card>

      {/* About Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Our Mission
          </CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p className="text-muted-foreground leading-relaxed">
            RecruitAI is an AI-powered recruitment platform designed to streamline your hiring process. 
            Our advanced algorithms analyze candidate CVs against your job descriptions, providing 
            instant insights on candidate fit, missing qualifications, and ATS compatibility.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Whether you're a small business or a large enterprise, RecruitAI helps you find the 
            right candidates faster, reduce bias in hiring, and make data-driven decisions.
          </p>
        </CardContent>
      </Card>

      {/* Features Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {features.map((feature) => (
          <Card key={feature.title} className="group hover:shadow-lg hover:border-primary/30 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            How It Works
          </CardTitle>
          <CardDescription>Get started in just 4 simple steps</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {steps.map((item, index) => (
              <div key={item.step} className="flex items-start gap-4 group">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-chart-1 text-primary-foreground flex items-center justify-center shrink-0 font-bold text-lg shadow-md group-hover:scale-110 transition-transform">
                    {item.step}
                  </div>
                  {index < steps.length - 1 && (
                    <div className="absolute left-1/2 top-12 w-0.5 h-8 bg-gradient-to-b from-primary/50 to-transparent -translate-x-1/2" />
                  )}
                </div>
                <div className="pt-2 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{item.title}</h4>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <Card className="bg-muted/30">
        <CardContent className="p-6 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} RecruitAI. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Built with ❤️ for modern recruiters
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
