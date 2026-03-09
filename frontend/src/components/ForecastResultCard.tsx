"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import ForecastModal from "./ForecastModal";

interface ForecastResultCardProps {
  submission: Record<string, number>;
  exitStatus: string;
}

export default function ForecastResultCard({ submission, exitStatus }: ForecastResultCardProps) {
  const [viewOpen, setViewOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(3);
  const rowRef = useRef<HTMLDivElement>(null);
  const measureRefs = useRef<(HTMLDivElement | null)[]>([]);
  const entries = useMemo(() => Object.entries(submission).sort(([, a], [, b]) => b - a), [submission]);

  const recomputeVisibleCount = useCallback(() => {
    const row = rowRef.current;
    if (!row || entries.length === 0) return;
    const widths = entries.map((_, index) => measureRefs.current[index]?.offsetWidth ?? 0);
    if (widths.some((w) => w === 0)) return;

    const GAP = 12;
    const VIEW_BUTTON_WIDTH = 88;
    const MORE_LABEL_WIDTH = 64;
    const available = Math.max(0, row.clientWidth - VIEW_BUTTON_WIDTH - GAP);

    let used = 0;
    let count = 0;
    for (const width of widths) {
      const nextUsed = used + (count > 0 ? GAP : 0) + width;
      if (nextUsed > available) break;
      used = nextUsed;
      count += 1;
    }

    count = Math.max(1, count);
    let remaining = entries.length - count;
    while (remaining > 0 && count > 1 && used + GAP + MORE_LABEL_WIDTH > available) {
      used -= widths[count - 1];
      if (count > 1) used -= GAP;
      count -= 1;
      remaining = entries.length - count;
    }

    setVisibleCount((prev) => (prev === count ? prev : count));
  }, [entries]);

  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    const raf = window.requestAnimationFrame(() => recomputeVisibleCount());
    const observer = new ResizeObserver(() => recomputeVisibleCount());
    observer.observe(row);
    return () => { window.cancelAnimationFrame(raf); observer.disconnect(); };
  }, [recomputeVisibleCount]);

  useEffect(() => { measureRefs.current = measureRefs.current.slice(0, entries.length); }, [entries.length]);

  const preview = entries.slice(0, visibleCount);

  if (!submission || Object.keys(submission).length === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pl-4 sm:pl-12">
        <div className="bg-warning/10 border border-warning/20 rounded-lg px-5 py-4">
          <p className="text-sm text-warning">
            Agent exited without submitting a forecast.
            <span className="text-xs text-warning/70 ml-2">({exitStatus})</span>
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pl-4 sm:pl-12">
        <div className="absolute pointer-events-none opacity-0 -z-10" aria-hidden="true">
          {entries.map(([name, prob], index) => (
            <div
              key={`${name}-measure`}
              ref={(el) => { measureRefs.current[index] = el; }}
              className="inline-flex items-center gap-1.5 bg-overlay border border-edge rounded-lg px-3 py-1.5 mr-3"
            >
              <span className="text-sm font-medium text-primary">{name}</span>
              <span className="text-sm text-accent font-mono">{(prob * 100).toFixed(1)}%</span>
            </div>
          ))}
        </div>
        <div className="bg-surface border border-accent/30 rounded-lg px-5 py-4">
          <p className="text-xs text-accent font-medium mb-2">Final Forecast</p>
          <div ref={rowRef} className="flex items-center gap-3 flex-wrap">
            {preview.map(([name, prob]) => (
              <div key={name} className="flex items-center gap-1.5 bg-overlay border border-edge rounded-lg px-3 py-1.5">
                <span className="text-sm font-medium text-primary">{name}</span>
                <span className="text-sm text-accent font-mono">{(prob * 100).toFixed(1)}%</span>
              </div>
            ))}
            {entries.length > visibleCount && (
              <span className="text-xs text-muted">+{entries.length - visibleCount} more</span>
            )}
            <button
              onClick={() => setViewOpen(true)}
              className="ml-auto px-4 py-1.5 text-sm font-medium rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
            >
              View
            </button>
          </div>
        </div>
      </motion.div>
      {viewOpen && <ForecastModal mode="view" submission={submission} onClose={() => setViewOpen(false)} />}
    </>
  );
}
