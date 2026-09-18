import Link from "next/link";
import { cn } from "@/lib/utils";

/** Wordmark sementara sampai logo final (SVG) diserahkan — Blueprint Bab 52. */
export function Logo({
  href = "/",
  tagline = true,
  className,
}: {
  href?: string;
  tagline?: boolean;
  className?: string;
}) {
  return (
    <Link href={href} className={cn("inline-flex flex-col leading-none", className)} aria-label="NGE-REM, beranda">
      <span className="font-display text-2xl font-black italic tracking-tight text-brand sm:text-[1.75rem]">
        NGE-REM
      </span>
      {tagline && (
        <span className="mt-0.5 text-[10px] font-medium tracking-[0.18em] text-charcoal-muted sm:text-[11px]">
          Nudge Generasi Remaja
        </span>
      )}
    </Link>
  );
}
