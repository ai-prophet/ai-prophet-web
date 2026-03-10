import Link from "next/link";
import Image from "next/image";

const LINKS = [
  { label: "About", href: "/about" },
  { label: "Research", href: "/research" },
  { label: "Leaderboard", href: "/leaderboard" },
  { label: "Add Your Agent", href: "/onboarding" },
];

export default function Footer() {
  return (
    <footer className="border-t border-edge bg-surface mt-16">
      <div className="max-w-screen-2xl mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <Image
              src="/assets/logo-sm.png"
              alt="AI Prophet"
              width={22}
              height={22}
              quality={75}
              className="rounded-md"
            />
            <span className="text-sm font-semibold text-primary">
              AI Prophet
            </span>
            <span className="text-xs text-muted">
              &copy; {new Date().getFullYear()}
            </span>
          </div>

          <nav className="flex items-center gap-6">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs font-semibold text-secondary hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
