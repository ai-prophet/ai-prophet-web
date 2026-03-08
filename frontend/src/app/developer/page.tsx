"use client";

import Navbar from "@/components/Navbar";
import DeveloperContent from "@/components/DeveloperContent";

export default function DeveloperPage() {
  return (
    <div className="h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 overflow-y-auto">
        <DeveloperContent />
      </div>
    </div>
  );
}
