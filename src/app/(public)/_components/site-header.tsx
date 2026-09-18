"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LogIn, Menu, X } from "lucide-react";
import { ButtonLink, Container, Logo } from "@/components/ui";

const NAV = [
  { href: "/#beranda", label: "Beranda" },
  { href: "/#tentang", label: "Tentang" },
  { href: "/#cara-kerja", label: "Cara Kerja" },
  { href: "/#faq", label: "FAQ" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-surface/90 backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-4 sm:h-18">
        <Logo />

        <nav aria-label="Navigasi utama" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="rounded-lg px-3 py-2 font-medium text-charcoal hover:bg-charcoal/5 hover:text-brand"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <ButtonLink href="/masuk" size="sm" className="hidden sm:inline-flex">
            <LogIn className="size-4" aria-hidden />
            Masuk
          </ButtonLink>
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-lg text-charcoal hover:bg-charcoal/5 md:hidden"
            aria-expanded={open}
            aria-controls="menu-mobile"
            aria-label={open ? "Tutup menu" : "Buka menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-6" aria-hidden /> : <Menu className="size-6" aria-hidden />}
          </button>
        </div>
      </Container>

      <nav
        id="menu-mobile"
        aria-label="Navigasi utama"
        hidden={!open}
        className="border-t border-border bg-surface md:hidden"
      >
        <Container className="flex flex-col gap-1 py-3">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-3 font-medium hover:bg-charcoal/5"
            >
              {item.label}
            </Link>
          ))}
          <ButtonLink href="/masuk" fullWidth className="mt-2" onClick={() => setOpen(false)}>
            <LogIn className="size-4" aria-hidden />
            Masuk
          </ButtonLink>
        </Container>
      </nav>
    </header>
  );
}
