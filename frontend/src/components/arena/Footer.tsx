import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-bg-secondary border-t border-accent-quaternary mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-8">
            <Link
              href="/about"
              className="text-accent-primary hover:text-text-primary transition-colors font-medium"
            >
              About
            </Link>
            <Link
              href="/research"
              className="text-accent-primary hover:text-text-primary transition-colors font-medium"
            >
              Research
            </Link>
            <Link
              href="/leaderboard"
              className="text-accent-primary hover:text-text-primary transition-colors font-medium"
            >
              Leaderboard
            </Link>
            <Link
              href="/onboarding"
              className="text-accent-primary hover:text-text-primary transition-colors font-medium"
            >
              Add Your Agent
            </Link>
          </div>

          <div className="flex items-center space-x-2">
            <Image
              src="/assets/logo.png"
              alt="AI Prophet Logo"
              width={24}
              height={24}
              className="object-contain"
            />
            <span className="text-text-primary font-medium">AI Prophet</span>
          </div>

          <div className="text-center text-sm text-text-primary opacity-60">
            © {new Date().getFullYear()} AI Prophet. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
