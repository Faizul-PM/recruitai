import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, CheckCircle, Zap, Shield, Users, BarChart } from "lucide-react";

export default function AboutPage() {
  const features = [
    {
      icon: Zap,
      title: "AI-Powered Screening",
      description: "Instantly analyze CVs against job descriptions using advanced AI algorithms."
    },
    {
      icon: BarChart,
      title: "ATS Scoring",
      description: "Get detailed ATS compatibility scores and keyword analysis for each candidate."
    },
    {
      icon: Users,
      title: "Candidate Management",
      description: "Organize and track candidates throughout your hiring pipeline."
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your data is encrypted and protected with enterprise-grade security."
    }
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-primary-foreground" />
          </div>
        </div>
        <h1 className="text-4xl font-bold font-serif">
          Recruit<span className="text-primary">AI</span>
        </h1>
        <p className="text-xl text-muted-foreground">
          Intelligent Recruitment Made Simple
        </p>
        <Badge variant="secondary" className="text-sm">Version 1.0.0</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>About RecruitAI</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert">
          <p>
            RecruitAI is an AI-powered recruitment platform designed to streamline your hiring process. 
            Our advanced algorithms analyze candidate CVs against your job descriptions, providing 
            instant insights on candidate fit, missing qualifications, and ATS compatibility.
          </p>
          <p>
            Whether you're a small business or a large enterprise, RecruitAI helps you find the 
            right candidates faster, reduce bias in hiring, and make data-driven decisions.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {features.map((feature) => (
          <Card key={feature.title}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <feature.icon className="h-5 w-5 text-primary" />
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

      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { step: 1, title: "Upload CVs", desc: "Upload candidate resumes in PDF or Word format" },
              { step: 2, title: "Enter Job Description", desc: "Paste or type the job requirements" },
              { step: 3, title: "AI Analysis", desc: "Our AI screens and scores each candidate" },
              { step: 4, title: "Review Results", desc: "Get detailed insights and shortlist candidates" }
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 font-bold text-sm">
                  {item.step}
                </div>
                <div>
                  <h4 className="font-medium">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} RecruitAI. All rights reserved.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
