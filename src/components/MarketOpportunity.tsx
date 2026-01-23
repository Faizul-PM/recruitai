import { TrendingUp, Users, IndianRupee } from "lucide-react";

const markets = [
  {
    label: "TAM",
    title: "Total Addressable Market",
    value: "₹4,000 Cr",
    subValue: "~USD 480M",
    customers: "8-10M Active Candidates",
    description: "All job seekers in India seeking ₹5-10 LPA roles using recruitment platforms",
    width: "100%",
    bgColor: "bg-chart-1/20",
    borderColor: "border-chart-1",
  },
  {
    label: "SAM",
    title: "Serviceable Available Market",
    value: "₹800-1,000 Cr",
    subValue: "~USD 96-120M",
    customers: "2-2.5M Candidates",
    description: "Candidates reachable via AI shortlisting & CV optimization tools",
    width: "60%",
    bgColor: "bg-chart-2/20",
    borderColor: "border-chart-2",
  },
  {
    label: "SOM",
    title: "Serviceable Obtainable Market",
    value: "₹200-250 Cr",
    subValue: "~USD 24-30M",
    customers: "0.5M Candidates",
    description: "Initial target segment achievable within 1-2 years",
    width: "30%",
    bgColor: "bg-chart-3/20",
    borderColor: "border-chart-3",
  },
];

const drivers = [
  {
    icon: TrendingUp,
    title: "AI Adoption Accelerating",
    description: "75% of recruiters now allocate budgets for AI tools",
  },
  {
    icon: Users,
    title: "Growing Talent Pool",
    description: "Millions of mid-level professionals seeking ₹5-10 LPA roles",
  },
  {
    icon: IndianRupee,
    title: "Efficiency Demand",
    description: "Remote hiring has increased applicant volume 3x per role",
  },
];

const MarketOpportunity = () => {
  return (
    <section className="py-20 bg-card">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">
            Market Opportunity
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-card-foreground mt-4 mb-6 font-serif">
            Why Now?{" "}
            <span className="text-primary">India 2026</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            India's recruitment software and HR tech market is growing at 7-13% CAGR,
            with AI adoption accelerating across the industry.
          </p>
        </div>

        {/* TAM SAM SOM Visualization */}
        <div className="max-w-4xl mx-auto mb-16 space-y-4">
          {markets.map((market, index) => (
            <div
              key={index}
              className={`p-6 rounded-xl ${market.bgColor} border-l-4 ${market.borderColor} transition-all duration-300 hover:shadow-md`}
              style={{ width: market.width, marginLeft: "auto", marginRight: "auto" }}
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold px-2 py-1 rounded bg-foreground/10 text-foreground">
                      {market.label}
                    </span>
                    <span className="text-sm font-medium text-muted-foreground">
                      {market.title}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 max-w-md">
                    {market.description}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl md:text-3xl font-bold text-foreground">
                    {market.value}
                  </div>
                  <div className="text-sm text-muted-foreground">{market.subValue}</div>
                  <div className="text-xs text-primary font-medium mt-1">
                    {market.customers}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Market Drivers */}
        <div className="grid md:grid-cols-3 gap-6">
          {drivers.map((driver, index) => (
            <div
              key={index}
              className="p-6 rounded-xl bg-background border border-border text-center"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <driver.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {driver.title}
              </h3>
              <p className="text-sm text-muted-foreground">{driver.description}</p>
            </div>
          ))}
        </div>

        {/* Bottom Insight */}
        <div className="mt-12 text-center">
          <p className="text-lg text-muted-foreground italic">
            The hiring funnel is digital, high-volume, and broken—
            <span className="text-primary font-medium"> AI makes it fixable now.</span>
          </p>
        </div>
      </div>
    </section>
  );
};

export default MarketOpportunity;
