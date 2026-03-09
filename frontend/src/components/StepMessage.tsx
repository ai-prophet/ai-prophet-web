"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { ChatMessage } from "@/types";

interface StepMessageProps {
  message: ChatMessage;
  onStepClick?: (stepNumber: number) => void;
  onAddSourceClick?: (boardId: number) => void;
}

function ExpandIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      className={`w-4 h-4 text-muted transition-transform ${expanded ? "rotate-45" : ""}`}
      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  );
}

function SearchStep({ message, onStepClick }: StepMessageProps) {
  const [expanded, setExpanded] = useState(false);
  const data = message.searchData;
  if (!data) return null;

  return (
    <div className="bg-surface border border-edge rounded-lg px-4 py-3">
      <div className="flex items-center justify-between">
        <div
          className="flex-1 cursor-pointer"
          onClick={() => onStepClick?.(message.stepNumber ?? 0)}
        >
          <p className="text-sm text-primary">
            <span className="text-muted font-mono text-xs mr-2">search</span>
            &ldquo;{data.query}&rdquo;
          </p>
          <p className="text-xs text-muted mt-0.5">Found {data.count} source(s)</p>
        </div>
        <button onClick={() => setExpanded(!expanded)} className="p-1 hover:bg-overlay rounded-lg transition-colors">
          <ExpandIcon expanded={expanded} />
        </button>
      </div>
      {expanded && data.results.length > 0 && (
        <div className="mt-3 space-y-2 border-t border-edge-subtle pt-3">
          {data.results.map((r) => (
            <div key={r.id} className="text-xs">
              <span className="text-accent font-medium">[{r.id}]</span>{" "}
              <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">{r.title}</a>
              <p className="text-secondary mt-0.5 line-clamp-2">{r.snippet}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AddSourceStep({ message, onAddSourceClick }: { message: ChatMessage; onAddSourceClick?: (boardId: number) => void }) {
  const data = message.addSourceData;
  const parsedIdMatch = (data?.sourceId || "").match(/\d+/);
  const parsedId = parsedIdMatch ? Number.parseInt(parsedIdMatch[0], 10) : Number.NaN;
  const targetBoardId = data?.boardId && data.boardId > 0 ? data.boardId : Number.isFinite(parsedId) && parsedId > 0 ? parsedId : null;

  return (
    <div
      className={`bg-surface border border-edge rounded-lg px-4 py-3 ${targetBoardId ? "cursor-pointer hover:border-secondary/30 transition-colors" : ""}`}
      onClick={() => { if (targetBoardId) onAddSourceClick?.(targetBoardId); }}
    >
      <p className="text-sm text-primary">
        <span className="text-muted font-mono text-xs mr-2">add_source</span>
        Add source {data?.sourceId} to the source board
      </p>
      <p className="text-xs text-muted mt-0.5">{targetBoardId ? `Click to open source board entry #${targetBoardId}` : "Source added to board"}</p>
    </div>
  );
}

function EditNoteStep({ message }: { message: ChatMessage }) {
  const data = message.editNoteData;
  return (
    <div className="bg-surface border border-edge rounded-lg px-4 py-3">
      <p className="text-sm text-primary">
        <span className="text-muted font-mono text-xs mr-2">edit_note</span>
        Edit note for #{data?.boardId}
      </p>
      <p className="text-xs text-muted mt-0.5">Note updated</p>
    </div>
  );
}

function ThinkStep({ message }: { message: ChatMessage }) {
  const [expanded, setExpanded] = useState(false);
  const content = message.content || "";
  const preview = content.length > 120 ? content.slice(0, 120) + "..." : content;

  return (
    <div className="bg-surface border border-edge rounded-lg px-4 py-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-secondary italic flex-1">{expanded ? content : preview}</p>
        {content.length > 120 && (
          <button onClick={() => setExpanded(!expanded)} className="p-1 hover:bg-overlay rounded-lg transition-colors ml-2">
            <ExpandIcon expanded={expanded} />
          </button>
        )}
      </div>
    </div>
  );
}

export default function StepMessage({ message, onStepClick, onAddSourceClick }: StepMessageProps) {
  const inner = (() => {
    switch (message.toolName) {
      case "search": return <SearchStep message={message} onStepClick={onStepClick} />;
      case "add_source": return <AddSourceStep message={message} onAddSourceClick={onAddSourceClick} />;
      case "edit_note": return <EditNoteStep message={message} />;
      default: return <ThinkStep message={message} />;
    }
  })();

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="pl-4 sm:pl-12">
      {inner}
    </motion.div>
  );
}
