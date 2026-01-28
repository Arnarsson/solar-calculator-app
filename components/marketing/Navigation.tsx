'use client';

import Link from 'next/link';
import { Sun } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

export function Navigation() {
  return (
    <header className="glass sticky top-0 z-50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Sun className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold text-foreground">
              SolBeregner
            </span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="#hvordan"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Hvordan det virker
            </Link>
            <Link
              href="#fordele"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Fordele
            </Link>
            <Link
              href="#faq"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              FAQ
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/calculator"
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Start beregning
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
