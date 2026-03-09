"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import ForecastModal from "./ForecastModal";

interface ForecastPlanProps {
  title: string;
  outcomes: string[];
  onRun: (title: string, outcomes: string[]) => void;
  disabled?: boolean;
}

export default function ForecastPlan({
  title,
  outcomes,
  onRun,
  disabled,
}: ForecastPlanProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [editOutcomes, setEditOutcomes] = useState(outcomes);
  const displayCount = 3;
  const shown = editOutcomes.slice(0, displayCount);
  const remaining = editOutcomes.length - displayCount;

  const handleSave = (newTitle: string, newOutcomes: string[]) => {
    setEditTitle(newTitle);
    setEditOutcomes(newOutcomes);
    setEditOpen(false);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-start"
      >
        <div className="max-w-full sm:max-w-[85%] flex items-start gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-accent/10 flex-shrink-0 flex items-center justify-center">
            <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          </div>
          <div className="bg-surface border border-edge rounded-2xl rounded-tl-sm px-3 sm:px-5 py-3 sm:py-4 min-w-0">
            <p className="text-xs text-accent font-medium mb-1">
              Forecasting Plan
            </p>
            <p className="text-primary text-[15px] font-medium mb-3">
              {editTitle}
            </p>
            <div className="flex items-center gap-2 flex-wrap mb-4">
              <span className="text-xs text-muted">Outcomes:</span>
              {shown.map((o) => (
                <span
                  key={o}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-overlay text-secondary"
                >
                  {o}
                </span>
              ))}
              {remaining > 0 && (
                <span className="text-xs text-muted">
                  ({remaining} more)
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setEditOpen(true)}
                disabled={disabled}
                data-forecast-edit="true"
                className="px-4 py-1.5 text-sm font-medium rounded-lg border border-edge text-secondary hover:text-primary hover:bg-surface-hover transition-colors disabled:opacity-40"
              >
                Edit
              </button>
              <button
                onClick={() => onRun(editTitle, editOutcomes)}
                disabled={disabled}
                className="px-4 py-1.5 text-sm font-medium rounded-lg bg-accent text-ground hover:bg-accent-dim transition-colors disabled:opacity-40"
              >
                Run
              </button>
            </div>
          </div>
        </div>
      </motion.div>
      {editOpen && (
        <ForecastModal
          mode="edit"
          title={editTitle}
          outcomes={editOutcomes}
          onSave={handleSave}
          onClose={() => setEditOpen(false)}
        />
      )}
    </>
  );
}
