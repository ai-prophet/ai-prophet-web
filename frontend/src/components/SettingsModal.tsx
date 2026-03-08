"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { UserSettings } from "@/types";
import { MODEL_OPTIONS, SEARCH_OPTIONS } from "@/types";

interface SettingsModalProps {
  settings: UserSettings;
  onSave: (settings: UserSettings) => void;
  onClose: () => void;
}

const SELECT_CLS =
  "w-full px-2 py-2 pr-9 border border-edge rounded-lg text-sm text-primary bg-overlay focus:ring-1 focus:ring-accent focus:border-accent outline-none appearance-none";

function SelectChevron() {
  return (
    <svg
      className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

export default function SettingsModal({ settings: initial, onSave, onClose }: SettingsModalProps) {
  const [draft, setDraft] = useState<UserSettings>({ ...initial });

  const handleSave = () => {
    onSave(draft);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-surface rounded-2xl border border-edge p-6 w-full max-w-sm mx-4"
      >
        <h3 className="text-lg font-semibold text-primary mb-5">Settings</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Model</label>
            <div className="relative">
              <select
                value={draft.model_name}
                onChange={(e) => {
                  const opt = MODEL_OPTIONS.find((o) => o.value === e.target.value);
                  setDraft((prev) => ({
                    ...prev,
                    model_name: e.target.value,
                    model_class: opt?.provider ?? "litellm",
                  }));
                }}
                className={SELECT_CLS}
              >
                {MODEL_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <SelectChevron />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Search</label>
            <div className="relative">
              <select
                value={draft.search_backend}
                onChange={(e) => setDraft((prev) => ({ ...prev, search_backend: e.target.value }))}
                className={SELECT_CLS}
              >
                {SEARCH_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <SelectChevron />
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2 text-sm font-medium rounded-lg border border-edge text-secondary hover:text-primary hover:bg-surface-hover transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2 text-sm font-medium rounded-lg bg-accent text-ground hover:bg-accent-dim transition-colors"
          >
            Save
          </button>
        </div>
      </motion.div>
    </div>
  );
}
