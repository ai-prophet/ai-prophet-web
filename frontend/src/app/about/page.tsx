import ArenaLayout from "@/components/arena/ArenaLayout";

const TEAM: { role: string; members: string[] }[] = [
  {
    role: "Advisors",
    members: ["Jibang Wu", "Haifeng Xu"],
  },
  {
    role: "Leads",
    members: ["Qingchuan Yang", "Simon Mahns", "Sida Li", "Anri Gu"],
  },
  {
    role: "Contributors",
    members: ["Arnav Gurudatt", "Alex Gu", "Chaplin Huang", "Lucien Liu"],
  },
];

const STATS = [
  { value: "500+", label: "Live Events Tracked" },
  { value: "20+", label: "AI Models Evaluated" },
  { value: "24/7", label: "Real-time Scoring" },
];

const PILLARS = [
  {
    title: "Predictive Intelligence",
    description:
      "We benchmark AI systems on their ability to forecast real-world events — a capability that demands reasoning under uncertainty, evidence synthesis, and calibrated probabilistic thinking.",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605"
        />
      </svg>
    ),
  },
  {
    title: "Contamination-Free",
    description:
      "Future events can never leak into training data. Prophet Arena is the only benchmark that is inherently immune to test set contamination — because tomorrow's news hasn't happened yet.",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
        />
      </svg>
    ),
  },
  {
    title: "Human-AI Collaboration",
    description:
      "Our platform enables seamless collaboration between human analysts and AI systems — humans supply curated evidence while AI processes, reasons, and generates calibrated forecasts.",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
        />
      </svg>
    ),
  },
];

export default function About() {
  return (
    <ArenaLayout>
      <div>
        {/* ── Hero ── */}
        <div className="relative overflow-hidden border-b border-edge">
          <div className="absolute inset-0 bg-gradient-to-b from-accent/[0.06] via-transparent to-transparent" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-accent/[0.03] blur-3xl pointer-events-none" />
          <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-28 text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-edge bg-surface/80 text-[11px] font-semibold text-muted uppercase tracking-wider mb-8">
              <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              About AI Prophet
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary tracking-tight mb-6 leading-[1.1]">
              Building the foundation of{" "}
              <span className="text-accent">AI-driven forecasting</span>
            </h1>
          </div>
        </div>

        {/* ── Stats ── */}
        {/* <div className="border-b border-edge">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-3 divide-x divide-edge">
              {STATS.map((stat) => (
                <div key={stat.label} className="py-8 sm:py-10 text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-accent tracking-tight">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm text-muted mt-1 font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div> */}

        {/* ── Mission ── */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div>
            <h2 className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-4">
              Our Mission
            </h2>
            <p className="text-lg sm:text-xl font-medium text-accent leading-snug mb-6">
              How can AI transform open-domain forecasting and help humans make
              better decisions?
            </p>
            <p className="text-base sm:text-lg text-secondary leading-relaxed">
              We aim to evaluate and advance the forecasting capabilities of AI
              systems. By aligning human insight with machine intelligence, we
              envision a platform where our society can harness collective
              foresight, make informed decisions, and illuminate how intelligent
              systems come to understand and anticipate the unfolding world.
            </p>
          </div>
        </div>

        {/* ── Team ── */}
        {/* <div className="border-t border-edge">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
            <h2 className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-3">
              Team
            </h2>

            <br />

            <div className="space-y-10">
              {TEAM.map((group) => {
                const isHighProfile =
                  group.role === "Leads" || group.role === "Advisors";
                return (
                  <div key={group.role}>
                    <h3 className="text-sm font-semibold text-primary mb-5 flex items-center gap-3">
                      {group.role}
                      <span className="flex-1 h-px bg-edge" />
                    </h3>
                    {isHighProfile ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {group.members.map((name) => (
                          <div
                            key={name}
                            className="rounded-xl border border-edge bg-surface hover:border-accent/30 transition-colors p-4"
                          >
                            <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center text-sm font-semibold text-accent mb-3">
                              {name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </div>
                            <div className="text-sm font-medium text-primary">
                              {name}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-x-6 gap-y-1.5">
                        {group.members.map((name) => (
                          <span key={name} className="text-sm text-secondary">
                            {name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div> */}

        {/* ── Contact ── */}
        <div className="border-t border-edge bg-surface">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-4">
              Get in Touch
            </h2>
            <p className="text-secondary mb-8">
              Interested in collaboration, submitting your model, or have
              questions about our methodology?
            </p>
            <a
              href="mailto:contact@prophetarena.co"
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-accent text-ground font-semibold text-sm hover:bg-accent-dim transition-colors shadow-lg shadow-accent/10"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                />
              </svg>
              contact@prophetarena.co
            </a>

            <div className="mt-14 pt-8 border-t border-edge">
              <p className="text-sm text-muted">
                AI Prophet is powered by{" "}
                <a
                  href="https://kalshi.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:text-accent-dim transition-colors font-medium"
                >
                  Kalshi
                </a>{" "}
                and supported by{" "}
                <a
                  href="https://www.haifeng-xu.com/sigma/index.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:text-accent-dim transition-colors font-medium"
                >
                  SIGMA Lab
                </a>{" "}
                at the University of Chicago
              </p>
            </div>
          </div>
        </div>
      </div>
    </ArenaLayout>
  );
}
