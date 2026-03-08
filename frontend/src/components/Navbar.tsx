"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTheme } from "@/components/ThemeProvider";

const NAV_LINKS = [
  { label: "Events", href: "/markets" },
  {
    label: "Leaderboard",
    href: "/leaderboard",
    children: [
      { label: "Model Leaderboard", href: "/leaderboard" },
      { label: "Agent Leaderboard", href: "/agent-leaderboard" },
    ],
  },
  { label: "Developer", href: "/developer" },
  { label: "Research", href: "/research" },
  { label: "About", href: "/about" },
];

const SITE = "https://www.prophetarena.co";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { theme, toggle: toggleTheme } = useTheme();

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dropdownOpen]);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      <nav className="flex-shrink-0 border-b border-edge bg-surface relative z-50">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 flex items-center justify-between h-12">
          {/* Left: logo + brand + nav links */}
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-accent transition-colors"
            >
              <Image
                src="/assets/logo.png"
                alt="AI Prophet"
                width={24}
                height={24}
                className="rounded-md"
              />
              <span className="hidden sm:inline">AI Prophet</span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) =>
                link.children ? (
                  /* Dropdown item */
                  <div key={link.label} className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setDropdownOpen((v) => !v)}
                      className={`px-3 py-1.5 text-xs font-medium transition-colors rounded-md flex items-center gap-1 ${
                        isActive(link.href) || link.children.some(c => isActive(c.href))
                          ? "text-accent"
                          : "text-secondary hover:text-primary hover:bg-surface-hover"
                      }`}
                    >
                      {link.label}
                      <svg className={`w-3 h-3 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </button>
                    {dropdownOpen && (
                      <div className="absolute top-full left-0 mt-1 w-48 bg-surface rounded-lg shadow-lg shadow-black/30 border border-edge py-1 z-50">
                        {link.children.map((child) => (
                          <Link
                            key={child.label}
                            href={child.href}
                            onClick={() => setDropdownOpen(false)}
                            className={`block px-4 py-2 text-xs font-medium transition-colors ${
                              isActive(child.href)
                                ? "text-accent bg-surface-hover"
                                : "text-secondary hover:text-primary hover:bg-surface-hover"
                            }`}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      isActive(link.href)
                        ? "text-accent"
                        : "text-secondary hover:text-primary hover:bg-surface-hover"
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              )}
            </div>
          </div>

          {/* Right: theme toggle + login + hamburger */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg text-secondary hover:text-primary hover:bg-surface-hover transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                </svg>
              )}
            </button>
            <a
              href={`${SITE}/auth/login`}
              className="hidden sm:block px-3.5 py-1.5 text-xs font-medium rounded-lg bg-accent text-ground hover:bg-accent-dim transition-colors"
            >
              Login
            </a>
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden p-1.5 rounded-lg text-secondary hover:text-primary hover:bg-surface-hover transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed top-12 right-0 w-64 h-[calc(100vh-3rem)] bg-surface border-l border-edge z-50 md:hidden overflow-y-auto">
            <div className="p-4 space-y-1">
              {NAV_LINKS.map((link) =>
                link.children ? (
                  <div key={link.label} className="space-y-1">
                    <span className="block px-3 py-2 text-xs font-medium text-muted uppercase tracking-wider">
                      {link.label}
                    </span>
                    {link.children.map((child) => (
                      <Link
                        key={child.label}
                        href={child.href}
                        className={`block px-3 py-2 pl-6 text-sm rounded-lg transition-colors ${
                          isActive(child.href)
                            ? "text-accent font-medium"
                            : "text-secondary hover:text-primary hover:bg-surface-hover"
                        }`}
                        onClick={() => setMobileOpen(false)}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                      isActive(link.href)
                        ? "text-accent font-medium"
                        : "text-secondary hover:text-primary hover:bg-surface-hover"
                    }`}
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                )
              )}
              <div className="pt-3 border-t border-edge mt-3">
                <a
                  href={`${SITE}/auth/login`}
                  className="block px-3 py-2 text-sm text-secondary hover:text-primary hover:bg-surface-hover rounded-lg transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  Login
                </a>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
