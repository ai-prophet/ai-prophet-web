"use client";

import ArenaLayout from "@/components/arena/ArenaLayout";

export default function About() {
  return (
    <ArenaLayout>
    <div className="space-y-0">
      {/* Hero Section */}
      <div className="text-center py-16 bg-bg-primary border-b border-accent-quaternary">
        <div className="max-w-5xl mx-auto px-4">
          <h1 className="text-5xl font-bold text-text-primary mb-4">
            About Prophet Arena
          </h1>
          <p className="text-lg text-text-primary/80 max-w-2xl mx-auto">
            A Live Benchmark for Predictive Intelligence
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-text-primary mb-6">
             Our Mission
            </h2>
            <p className="text-xl font-medium text-accent-primary mb-6">
              How can AI transform open-domain forecasting and help humans make
              better decisions?
            </p>
            <p className="text-lg text-text-primary/90 leading-relaxed">
              <strong className="text-text-primary">Prophet Arena</strong> is
              designed to evaluate and advance the forecasting capabilities of AI
              systems. By aligning human insight with machine intelligence, we
              envision a platform where our society can harness collective
              foresight, make informed decisions, and illuminate how intelligent
              systems come to understand and anticipate the unfolding world. This platform is powered by{" "}
              <a
                href="https://kalshi.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-primary hover:text-accent-secondary transition-colors font-medium"
              >
                Kalshi
              </a>.
            </p>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="mb-16 bg-bg-secondary">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-text-primary mb-6">
            Team Members
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-text-primary mb-3">Leads</h3>
              <p className="text-text-primary/80 leading-relaxed">
                Qingchuan Yang<br />
                Simon Mahns<br />
                Sida Li<br />
                Anri Gu
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-text-primary mb-3">Contributors</h3>
              <p className="text-text-primary/80 leading-relaxed">
                Alex Gu<br />
                Chaplin Huang<br />
                Lucien Liu
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-text-primary mb-3">Advisors</h3>
              <p className="text-text-primary/80 leading-relaxed">
                Jibang Wu<br />
                Haifeng Xu
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-text-primary mb-6">
            Contact Us
          </h2>
          <p className="text-lg text-text-primary/70 mb-8">
            Interested in collaboration or have questions?
          </p>
          <div className="mb-8">
            <a
              href="mailto:contact@prophetarena.co"
              className="inline-flex items-center text-accent-primary hover:text-accent-secondary text-xl font-medium transition-colors"
            >
              contact@prophetarena.co
            </a>
          </div>
          <p className="text-text-primary/60 max-w-2xl mx-auto">
            Prophet Arena is powered by{" "}
            <a
              href="https://kalshi.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-primary hover:text-accent-secondary transition-colors font-medium"
            >
              Kalshi
            </a>{" "}
            and supported by{" "}
            <a
              href="https://www.haifeng-xu.com/sigma/index.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-primary hover:text-accent-secondary transition-colors font-medium"
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
