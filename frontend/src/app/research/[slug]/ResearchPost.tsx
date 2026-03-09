"use client";

import ArenaLayout from "@/components/arena/ArenaLayout";
import Link from "next/link";

export default function ResearchPost({
  title,
  date,
  author,
  contentHtml,
}: {
  title: string;
  date: string;
  author: string;
  contentHtml: string;
}) {
  return (
    <ArenaLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/research"
          className="text-xs text-accent-primary hover:underline mb-6 inline-block"
        >
          &larr; Back to Research
        </Link>
        <h1 className="text-3xl font-bold text-text-primary mb-3">{title}</h1>
        <div className="flex items-center gap-3 text-sm text-text-secondary mb-8">
          <span>{author}</span>
          <span className="text-text-secondary">&middot;</span>
          <span>
            {new Date(date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
        <article
          className="prose prose-invert max-w-none
            prose-headings:text-text-primary
            prose-p:text-text-primary prose-li:text-text-primary
            prose-a:text-accent-primary prose-strong:text-text-primary
            prose-code:text-accent-highlight prose-code:bg-code-bg prose-code:px-1 prose-code:py-0.5 prose-code:rounded
            prose-pre:bg-code-bg prose-pre:border prose-pre:border-accent-quaternary
            prose-blockquote:border-accent-primary prose-blockquote:text-text-primary
            prose-img:rounded-lg prose-img:border prose-img:border-accent-quaternary
            prose-table:text-text-primary prose-th:text-text-primary prose-td:text-text-primary prose-td:border-accent-quaternary prose-th:border-accent-quaternary"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />
      </div>
    </ArenaLayout>
  );
}
