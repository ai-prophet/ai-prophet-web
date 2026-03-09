"use client";

import ArenaLayout from "@/components/arena/ArenaLayout";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useCallback } from "react";
import {
  KATEX_CSS_URL,
  KATEX_JS_URL,
  KATEX_AUTO_RENDER_URL,
} from "@/lib/constants";

const TYPE_LABELS: Record<string, string> = {
  analysis: "Analysis",
  post: "Post",
  guide: "Guide",
  experiment: "Experiment",
};

function TableOfContents({
  toc,
}: {
  toc: { id: string; text: string; level: number }[];
}) {
  const [activeId, setActiveId] = useState<string>("");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const headings = toc
      .map((t) => document.getElementById(t.id))
      .filter(Boolean) as HTMLElement[];
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the first visible heading
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
    );

    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [toc]);

  const handleClick = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.preventDefault();
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        setActiveId(id);
        setMobileOpen(false);
      }
    },
    []
  );

  if (toc.length === 0) return null;

  const levelBase = Math.min(...toc.map((t) => t.level));

  return (
    <>
      {/* Desktop TOC — fixed left sidebar */}
      <nav className="fixed top-28 left-6 w-56 max-h-[calc(100vh-160px)] overflow-y-auto z-30 hidden xl:block custom-scrollbar">
        <div className="rounded-lg p-3">
          <h3 className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-3 opacity-70">
            Contents
          </h3>
          <ul className="space-y-0.5">
            {toc.map((item) => {
              const indent = (item.level - levelBase) * 10 + 6;
              return (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    onClick={(e) => handleClick(e, item.id)}
                    className={`block w-full text-left py-1 px-1.5 rounded text-[13px] font-medium transition-colors duration-200 no-underline truncate ${
                      activeId === item.id
                        ? "text-accent-primary font-semibold bg-accent-primary/10"
                        : "text-muted hover:bg-surface-hover hover:text-primary"
                    }`}
                    style={{ paddingLeft: `${indent}px` }}
                    title={item.text}
                  >
                    {item.text}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* Mobile TOC — floating button + dropdown */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed bottom-6 right-6 z-40 xl:hidden bg-accent-primary hover:bg-accent-dim text-white p-3 rounded-full shadow-lg transition-colors duration-200"
        title="Table of Contents"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 xl:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <nav className="fixed bottom-20 right-6 z-50 xl:hidden w-72 max-h-[60vh] overflow-y-auto bg-surface border border-edge rounded-xl shadow-xl p-4 custom-scrollbar">
            <h3 className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-3">
              Contents
            </h3>
            <ul className="space-y-0.5">
              {toc.map((item) => {
                const indent = (item.level - levelBase) * 10 + 6;
                return (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      onClick={(e) => handleClick(e, item.id)}
                      className={`block w-full text-left py-1.5 px-1.5 rounded text-sm font-medium transition-colors duration-200 no-underline ${
                        activeId === item.id
                          ? "text-accent-primary font-semibold bg-accent-primary/10"
                          : "text-muted hover:bg-surface-hover hover:text-primary"
                      }`}
                      style={{ paddingLeft: `${indent}px` }}
                    >
                      {item.text}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        </>
      )}
    </>
  );
}

export default function ResearchPost({
  title,
  date,
  author,
  type,
  heroImage,
  contentHtml,
  toc,
  slug,
}: {
  title: string;
  date: string;
  author: string;
  type: string;
  heroImage: string | null;
  contentHtml: string;
  toc: { id: string; text: string; level: number }[];
  slug: string;
}) {
  const articleRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Load KaTeX auto-render to process LaTeX in the article
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = KATEX_CSS_URL;
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = KATEX_JS_URL;
    script.onload = () => {
      const renderScript = document.createElement("script");
      renderScript.src = KATEX_AUTO_RENDER_URL;
      renderScript.onload = () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const win = window as any;
        if (articleRef.current && win.renderMathInElement) {
          win.renderMathInElement(articleRef.current, {
            delimiters: [
              { left: "$$", right: "$$", display: true },
              { left: "$", right: "$", display: false },
            ],
            throwOnError: false,
          });
        }
      };
      document.head.appendChild(renderScript);
    };
    document.head.appendChild(script);
  }, [contentHtml]);

  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const typeLabel = TYPE_LABELS[type.toLowerCase()] || type;

  return (
    <ArenaLayout>
      <TableOfContents toc={toc} />
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
        <h1 className="text-3xl sm:text-4xl font-bold text-primary leading-tight mb-5">
          {title}
        </h1>

        {/* Metadata row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 pb-6 mb-8 border-b border-edge">
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
              Share
            </span>
            <div className="flex items-center gap-2">
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(`https://prophetarena.co/research/${slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium bg-overlay hover:bg-surface-hover px-3.5 py-1.5 rounded-lg transition-colors text-accent-primary"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                X/Twitter
              </a>
              <a
                href={`https://linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://prophetarena.co/research/${slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium bg-overlay hover:bg-surface-hover px-3.5 py-1.5 rounded-lg transition-colors text-accent-primary"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                LinkedIn
              </a>
            </div>
          </div>
        </div>

        {/* Hero image */}
        {heroImage && (
          <div className="relative aspect-[2/1] rounded-xl overflow-hidden border border-edge mb-10 -mx-8 sm:-mx-12 lg:-mx-20">
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
          ref={articleRef}
          className="prose prose-lg max-w-none text-primary
            prose-headings:text-primary prose-headings:font-semibold
            prose-h2:text-base prose-h2:pb-0
            prose-h3:text-sm
            prose-p:text-primary
            prose-li:text-primary
            prose-a:text-accent-primary hover:prose-a:text-accent-highlight prose-a:no-underline hover:prose-a:underline
            prose-strong:text-primary prose-strong:font-semibold
            prose-code:text-accent-highlight prose-code:bg-code-bg prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-sm prose-code:font-normal prose-code:before:content-[''] prose-code:after:content-['']
            prose-pre:bg-code-bg prose-pre:border prose-pre:border-edge prose-pre:rounded-xl
            prose-blockquote:not-italic
            prose-img:rounded-xl prose-img:mx-auto
            prose-hr:border-edge"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />
      </div>
    </ArenaLayout>
  );
}
