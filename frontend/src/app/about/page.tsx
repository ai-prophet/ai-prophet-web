import ArenaLayout from "@/components/arena/ArenaLayout";

const TEAM = {
  Leads: ["Qingchuan Yang", "Simon Mahns", "Sida Li", "Anri Gu"],
  Contributors: ["Alex Gu", "Chaplin Huang", "Lucien Liu"],
  Advisors: ["Jibang Wu", "Haifeng Xu"],
};

const ROLE_ACCENT: Record<string, string> = {
  Leads: "bg-accent/10 text-accent border-accent/20",
  Contributors: "bg-accent/5 text-accent/80 border-accent/10",
  Advisors: "bg-accent/5 text-accent/80 border-accent/10",
};

export default function About() {
  return (
    <ArenaLayout>
      <div>
        {/* Hero */}
        <div className="relative overflow-hidden border-b border-edge">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/[0.04] via-transparent to-accent/[0.02]" />
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-28 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-edge bg-surface text-xs font-medium text-muted mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-accent" />
              About
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-primary tracking-tight mb-5">
              AI Prophet
            </h1>
            <p className="text-lg text-secondary max-w-xl mx-auto leading-relaxed">
              Building the foundation for AI-driven forecasting.
            </p>
          </div>
        </div>

        {/* Mission */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
          <div className="flex items-start gap-5">
            <div className="hidden sm:block w-1 flex-shrink-0 rounded-full bg-gradient-to-b from-accent to-accent/10 self-stretch" />
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-4">
                Our Mission
              </h2>
              <p className="text-lg font-medium text-accent mb-5">
                How can AI transform open-domain forecasting and help humans make
                better decisions?
              </p>
              <p className="text-base text-secondary leading-relaxed">
                We aim to evaluate and advance the forecasting capabilities of AI
                systems. By aligning human insight with machine intelligence, we
                envision a platform where our society can harness collective
                foresight, make informed decisions, and illuminate how intelligent
                systems come to understand and anticipate the unfolding world.
              </p>
            </div>
          </div>
        </div>

        {/* Team */}
        <div className="border-t border-edge bg-surface">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-10">
              Team
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {Object.entries(TEAM).map(([role, members]) => (
                <div
                  key={role}
                  className="rounded-xl border border-edge bg-ground p-5"
                >
                  <span
                    className={`inline-block text-[11px] font-semibold px-2.5 py-1 rounded-md border mb-4 ${ROLE_ACCENT[role]}`}
                  >
                    {role}
                  </span>
                  <ul className="space-y-2">
                    {members.map((name) => (
                      <li
                        key={name}
                        className="text-sm text-primary/90 font-medium"
                      >
                        {name}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="max-w-4xl mx-auto px-6 py-16 sm:py-20 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-4">
            Get in Touch
          </h2>
          <p className="text-secondary mb-8">
            Interested in collaboration or have questions?
          </p>
          <a
            href="mailto:contact@prophetarena.co"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent text-ground font-medium text-sm hover:bg-accent-dim transition-colors"
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

          <div className="mt-12 pt-8 border-t border-edge">
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
    </ArenaLayout>
  );
}
