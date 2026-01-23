import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import Solution from "@/components/Solution";
import MarketOpportunity from "@/components/MarketOpportunity";
import HowItWorks from "@/components/HowItWorks";
import Persona from "@/components/Persona";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <Problem />
        <Solution />
        <HowItWorks />
        <MarketOpportunity />
        <Persona />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
