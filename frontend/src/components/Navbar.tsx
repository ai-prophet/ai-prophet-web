"use client";

const SITE = "https://www.prophetarena.co";

const NAV_LINKS = [
  { label: "Events", href: `${SITE}/markets` },
  { label: "Leaderboard", href: `${SITE}/leaderboard` },
  { label: "Developer", href: null },
  { label: "Research", href: `${SITE}/research` },
  { label: "About", href: `${SITE}/about` },
];

export default function Navbar() {
  return (
    <nav className="flex-shrink-0 border-b border-edge bg-surface">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 flex items-center justify-between h-12">
        {/* Left: logo + brand + nav links */}
        <div className="flex items-center gap-6">
          <a
            href={SITE}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-accent transition-colors"
          >
            <div className="w-6 h-6 rounded-md bg-accent flex items-center justify-center">
              <span className="text-ground text-xs font-bold">P</span>
            </div>
            <span className="hidden sm:inline">Prophet Arena</span>
          </a>

          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) =>
              link.href ? (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 text-xs font-medium text-secondary hover:text-primary transition-colors rounded-md hover:bg-surface-hover"
                >
                  {link.label}
                </a>
              ) : (
                <span
                  key={link.label}
                  className="px-3 py-1.5 text-xs font-medium text-accent"
                >
                  {link.label}
                </span>
              )
            )}
          </div>
        </div>

        {/* Right: login */}
        <a
          href={`${SITE}/auth/login`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3.5 py-1.5 text-xs font-medium rounded-lg bg-accent text-ground hover:bg-accent-dim transition-colors"
        >
          Login
        </a>
      </div>
    </nav>
  );
}
