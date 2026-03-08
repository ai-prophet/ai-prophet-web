"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
  { label: "Developer", href: "/" },
  { label: "Research", href: "/research" },
  { label: "About", href: "/about" },
];

const SITE = "https://www.prophetarena.co";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

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
              <div className="w-6 h-6 rounded-md bg-accent flex items-center justify-center">
                <span className="text-ground text-xs font-bold">P</span>
              </div>
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

          {/* Right: login + hamburger */}
          <div className="flex items-center gap-3">
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
