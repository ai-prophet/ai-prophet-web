"use client";

import ArenaLayout from "@/components/arena/ArenaLayout";
import Image from "next/image";
import Link from "next/link";

const TYPE_LABELS: Record<string, string> = {
  analysis: "Analysis",
  post: "Post",
  guide: "Guide",
  experiment: "Experiment",
};

export default function ResearchPost({
  title,
  date,
  author,
  type,
  heroImage,
  contentHtml,
}: {
  title: string;
  date: string;
  author: string;
  type: string;
  heroImage: string | null;
  contentHtml: string;
}) {
  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const typeLabel = TYPE_LABELS[type.toLowerCase()] || type;

  return (
    <ArenaLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 mb-12">
        {/* Back link */}
        <Link
          href="/research"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-accent-primary hover:text-accent-highlight transition-colors mb-8"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Research
        </Link>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-bold text-text-primary leading-tight mb-5">
          {title}
        </h1>

        {/* Metadata row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 pb-6 mb-8 border-b border-edge">
          <div>
            <span className="block text-[11px] font-semibold text-muted uppercase tracking-wider mb-1">
              Published
            </span>
            <span className="text-sm font-medium text-primary">
              {formattedDate}
            </span>
          </div>
          <div>
            <span className="block text-[11px] font-semibold text-muted uppercase tracking-wider mb-1">
              Author
            </span>
            <span className="text-sm font-medium text-primary">
              {author}
            </span>
          </div>
          <div>
            <span className="block text-[11px] font-semibold text-muted uppercase tracking-wider mb-1">
              Type
            </span>
            <span className="inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-accent-primary/15 text-accent-primary">
              {typeLabel}
            </span>
          </div>
        </div>

        {/* Hero image */}
        {heroImage && (
          <div className="relative w-full aspect-[2/1] rounded-xl overflow-hidden border border-edge mb-10">
            <Image
              src={heroImage}
              alt={title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Article content */}
        <article
          className="prose prose-lg prose-invert max-w-none
            prose-headings:text-text-primary prose-headings:font-bold
            prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4 prose-h2:pb-2 prose-h2:border-b prose-h2:border-edge
            prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
            prose-p:text-text-primary prose-p:leading-relaxed
            prose-li:text-text-primary
            prose-a:text-accent-primary hover:prose-a:text-accent-highlight prose-a:no-underline hover:prose-a:underline
            prose-strong:text-text-primary prose-strong:font-semibold
            prose-code:text-accent-highlight prose-code:bg-code-bg prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-sm prose-code:font-normal prose-code:before:content-[''] prose-code:after:content-['']
            prose-pre:bg-code-bg prose-pre:border prose-pre:border-accent-quaternary prose-pre:rounded-xl
            prose-blockquote:border-l-2 prose-blockquote:border-accent-primary prose-blockquote:bg-accent-primary/5 prose-blockquote:rounded-r-lg prose-blockquote:py-1 prose-blockquote:px-5 prose-blockquote:text-text-primary prose-blockquote:not-italic
            prose-img:rounded-xl prose-img:border prose-img:border-edge prose-img:shadow-lg prose-img:shadow-black/20 prose-img:mx-auto
            prose-table:text-text-primary prose-th:text-text-primary prose-td:text-text-primary prose-td:border-edge prose-th:border-edge
            prose-hr:border-edge"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />
      </div>
    </ArenaLayout>
  );
}
