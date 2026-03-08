"use client";

import Image from "next/image";
import Link from "next/link";
import ArenaLayout from "@/components/arena/ArenaLayout";

const POSTS = [
  {
    slug: "welcome",
    title: "Welcome to Prophet Arena",
    excerpt:
      "Introducing Prophet Arena: a live benchmark for AI prediction models using real prediction markets.",
    date: "2025-02-15",
    type: "Post",
    heroImage: "/research/welcome/hero.png",
  },
  {
    slug: "stability",
    title: "Forecast Stability Under Repeated Querying",
    excerpt:
      "How stable are LLM forecasts when asked the same question multiple times? We investigate.",
    date: "2025-03-20",
    type: "Experiment",
    heroImage: "/research/stability/hero.png",
  },
  {
    slug: "agent-leaderboard-rules",
    title: "Agent Leaderboard Rules & Methodology",
    excerpt:
      "How we score and rank autonomous forecasting agents on Prophet Arena.",
    date: "2025-04-10",
    type: "Guide",
    heroImage: "/research/agent-leaderboard-rules/hero.png",
  },
  {
    slug: "live-trading",
    title: "Live Trading with AI Forecasts",
    excerpt:
      "Can AI prediction models generate profitable trading strategies on Kalshi?",
    date: "2025-05-01",
    type: "Analysis",
    heroImage: "/research/live-trading/hero.png",
  },
];

const TYPE_STYLES: Record<string, string> = {
  Post: "bg-blue-900/30 text-blue-400",
  Experiment: "bg-purple-900/30 text-purple-400",
  Guide: "bg-green-900/30 text-green-400",
  Analysis: "bg-amber-900/30 text-amber-400",
};

export default function ResearchPage() {
  return (
    <ArenaLayout>
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-text-primary mb-2">Research</h1>
      <p className="text-text-primary opacity-60 mb-10">
        Papers, experiments, and analyses from the Prophet Arena team.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {POSTS.map((post) => (
          <Link
            key={post.slug}
            href={`https://www.prophetarena.co/research/${post.slug}`}
            target="_blank"
            className="group rounded-xl border border-accent-quaternary bg-bg-primary overflow-hidden hover:border-accent-primary transition-colors"
          >
            <div className="relative h-48 bg-accent-quaternary/20">
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
                <span className="text-xs text-text-primary opacity-40">
                  {new Date(post.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              <h2 className="text-lg font-semibold text-text-primary group-hover:text-accent-primary transition-colors">
                {post.title}
              </h2>
              <p className="text-sm text-text-primary opacity-60 line-clamp-2">
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
