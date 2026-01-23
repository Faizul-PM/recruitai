import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Building } from "lucide-react";

const CTA = () => {
  return (
    <section className="py-20 bg-primary">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-primary-foreground mb-6 font-serif">
            Ready to Transform Your Hiring?
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-10 max-w-2xl mx-auto">
            Join thousands of recruiters and job seekers already using Recruit AI
            to make smarter hiring decisions.
          </p>

          {/* Dual CTA */}
          <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Job Seekers */}
            <div className="p-6 rounded-2xl bg-primary-foreground/10 border border-primary-foreground/20">
              <div className="w-12 h-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-primary-foreground mb-2">
                For Job Seekers
              </h3>
              <p className="text-primary-foreground/70 text-sm mb-4">
                Get matched with roles where you'll succeed. Optimize your CV with AI insights.
              </p>
              <Button
                size="lg"
                className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                asChild
              >
                <Link to="/auth">
                  Start Free
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>

            {/* Recruiters */}
            <div className="p-6 rounded-2xl bg-primary-foreground/10 border border-primary-foreground/20">
              <div className="w-12 h-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center mx-auto mb-4">
                <Building className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-primary-foreground mb-2">
                For Recruiters
              </h3>
              <p className="text-primary-foreground/70 text-sm mb-4">
                Screen candidates 10x faster. Find talent others miss with AI intelligence.
              </p>
              <Button
                size="lg"
                variant="outline"
                className="w-full border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 bg-transparent"
                asChild
              >
                <Link to="/auth">
                  Request Demo
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 flex flex-wrap justify-center gap-8 text-primary-foreground/60 text-sm">
            <span>✓ Free to start</span>
            <span>✓ No credit card required</span>
            <span>✓ GDPR compliant</span>
            <span>✓ SOC 2 certified</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
