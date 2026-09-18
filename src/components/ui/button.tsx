import Link from "next/link";
import type { ComponentProps } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "safety";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex shrink-0 select-none items-center whitespace-nowrap justify-center gap-2 rounded-pill font-semibold transition-colors " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-info " +
  "disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "bg-brand text-white hover:bg-brand-800 active:bg-brand-900",
  secondary:
    "border-2 border-brand bg-surface text-brand hover:bg-brand-50 active:bg-brand-100",
  ghost: "text-charcoal hover:bg-charcoal/5 active:bg-charcoal/10",
  // Kuning selalu dengan teks charcoal (kontras 8.9:1).
  safety: "bg-safety text-charcoal hover:bg-safety-600 active:bg-safety-600",
};

const sizes: Record<Size, string> = {
  sm: "min-h-9 px-4 text-sm",
  md: "min-h-11 px-5 text-body", // target sentuh ≥44px
  lg: "min-h-13 px-7 text-body-lg",
};

export type ButtonStyleProps = {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  /** State error: ring merah + ikon, dipakai setelah aksi gagal. */
  error?: boolean;
};

export function buttonStyles({
  variant = "primary",
  size = "md",
  fullWidth,
  error,
}: ButtonStyleProps = {}) {
  return cn(
    base,
    variants[variant],
    sizes[size],
    fullWidth && "w-full",
    error && "ring-2 ring-brand ring-offset-2",
  );
}

type ButtonProps = ComponentProps<"button"> &
  ButtonStyleProps & {
    loading?: boolean;
    loadingText?: string;
  };

export function Button({
  variant,
  size,
  fullWidth,
  error,
  loading,
  loadingText,
  disabled,
  className,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(buttonStyles({ variant, size, fullWidth, error }), className)}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="size-4 animate-spin" aria-hidden />
          {loadingText ?? children}
        </>
      ) : (
        <>
          {error && <AlertCircle className="size-4" aria-hidden />}
          {children}
        </>
      )}
    </button>
  );
}

type ButtonLinkProps = ComponentProps<typeof Link> & ButtonStyleProps;

/** Link yang tampil seperti tombol (untuk navigasi, bukan aksi). */
export function ButtonLink({
  variant,
  size,
  fullWidth,
  className,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={cn(buttonStyles({ variant, size, fullWidth }), className)}
      {...props}
    />
  );
}
