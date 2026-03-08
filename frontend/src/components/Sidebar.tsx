"use client";

import { cn } from "@/lib/utils";
import type { SearchGroup, BoardEntry } from "@/types";
import SourceBoardPanel from "./SourceBoardPanel";
import SearchesPanel from "./SearchesPanel";

interface SidebarProps {
  searchGroups: SearchGroup[];
  boardEntries: BoardEntry[];
  activeTab: "board" | "searches";
  onTabChange: (tab: "board" | "searches") => void;
  highlightStep: number | null;
  highlightBoardId: number | null;
}

export default function Sidebar({
  searchGroups,
  boardEntries,
  activeTab,
  onTabChange,
  highlightStep,
  highlightBoardId,
}: SidebarProps) {
  return (
    <div className="h-full flex flex-col bg-surface">
      <div className="flex border-b border-edge">
        <button
          onClick={() => onTabChange("board")}
          className={cn(
            "flex-1 py-3 text-sm font-medium transition-colors",
            activeTab === "board"
              ? "text-accent border-b-2 border-accent"
              : "text-muted hover:text-secondary"
          )}
        >
          Source Board
          {boardEntries.length > 0 && (
            <span className="ml-1.5 text-xs bg-accent/10 text-accent px-1.5 py-0.5 rounded-full">
              {boardEntries.length}
            </span>
          )}
        </button>
        <button
          onClick={() => onTabChange("searches")}
          className={cn(
            "flex-1 py-3 text-sm font-medium transition-colors",
            activeTab === "searches"
              ? "text-accent border-b-2 border-accent"
              : "text-muted hover:text-secondary"
          )}
        >
          Searches
          {searchGroups.length > 0 && (
            <span className="ml-1.5 text-xs bg-accent/10 text-accent px-1.5 py-0.5 rounded-full">
              {searchGroups.length}
            </span>
          )}
        </button>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {activeTab === "board" ? (
          <SourceBoardPanel entries={boardEntries} highlightBoardId={highlightBoardId} />
        ) : (
          <SearchesPanel groups={searchGroups} highlightStep={highlightStep} />
        )}
      </div>
    </div>
  );
}
