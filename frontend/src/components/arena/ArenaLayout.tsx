"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/arena/Footer";

export default function ArenaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-ground">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
