"use client";

import Image from "next/image";
import Link from "next/link";
import ArenaLayout from "@/components/arena/ArenaLayout";

const POSTS = [
  {
    slug: "stability",
    title: "Defining and Measuring Stability in our Agent Leaderboard",
    excerpt:
      "A statistical analysis of leaderboard stability that motivates the adoption of a 10-day evaluation window for new model submissions.",
    date: "2025-12-14",
    type: "Analysis",
    heroImage: "/research/stability/hero.png",
  },
  {
    slug: "agent-leaderboard-rules",
    title: "Agent Leaderboard Rules & Submission Guidelines",
    excerpt:
      "Guidelines for submitting your forecasting agent to the Prophet Arena Agent Leaderboard, including input/output formats and evaluation criteria.",
    date: "2025-12-07",
    type: "Guide",
    heroImage: "/research/agent-leaderboard-rules/hero.png",
  },
  {
    slug: "welcome",
    title: "Prophet Arena: A Live Benchmark for Predictive Intelligence",
    excerpt:
      "Introducing Prophet Arena — a benchmark that evaluates the predictive intelligence of AI systems through live updated real-world forecasting tasks.",
    date: "2025-08-10",
    type: "Post",
    heroImage: "/research/welcome/hero.png",
  },
];

const TYPE_STYLES: Record<string, string> = {
  Post: "bg-accent-primary/15 text-accent-primary",
  Experiment: "bg-accent-primary/15 text-accent-primary",
  Guide: "bg-accent-primary/15 text-accent-primary",
  Analysis: "bg-accent-primary/15 text-accent-primary",
};

export default function ResearchPage() {
  return (
    <ArenaLayout>
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-primary mb-2">Research</h1>
      <p className="text-secondary mb-10">
        Papers, experiments, and analyses from the Prophet Arena team.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {POSTS.map((post) => (
          <Link
            key={post.slug}
            href={`/research/${post.slug}`}
            className="group rounded-xl border border-edge bg-surface overflow-hidden hover:border-accent-primary transition-colors"
          >
            <div className="relative h-48 bg-overlay/20">
              <Image
                src={post.heroImage}
                alt={post.title}
                fill
                className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
              />
            </div>
            <div className="p-5 space-y-2">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${TYPE_STYLES[post.type] ?? "bg-gray-800 text-gray-300"}`}
                >
                  {post.type}
                </span>
                <span className="text-xs text-secondary">
                  {new Date(post.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              <h2 className="text-lg font-semibold text-primary group-hover:text-accent-primary transition-colors">
                {post.title}
              </h2>
              <p className="text-sm text-secondary line-clamp-2">
                {post.excerpt}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
    </ArenaLayout>
  );
}
