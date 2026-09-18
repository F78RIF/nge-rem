import type { ComponentProps, ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info, XCircle, Inbox, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "info" | "success" | "warning" | "danger" | "neutral";

/** Warna selalu dipasangkan dengan ikon + teks, tidak berdiri sendiri (Bab 35). */
const toneStyles: Record<Tone, string> = {
  info: "bg-info-50 text-info border-info/30",
  success: "bg-success-50 text-success border-success/30",
  warning: "bg-safety-50 text-charcoal border-safety",
  danger: "bg-brand-50 text-brand-800 border-brand/30",
  neutral: "bg-background text-charcoal border-border",
};

const toneIcons: Record<Tone, typeof Info> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: XCircle,
  neutral: Info,
};

export function Tag({
  tone = "neutral",
  icon = false,
  className,
  children,
  ...props
}: { tone?: Tone; icon?: boolean } & ComponentProps<"span">) {
  const Icon = toneIcons[tone];
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1 rounded-pill border px-2.5 py-0.5 text-caption font-semibold",
        toneStyles[tone],
        className,
      )}
      {...props}
    >
      {icon && <Icon className="size-3.5" aria-hidden />}
      {children}
    </span>
  );
}

export function Alert({
  tone = "info",
  title,
  children,
  className,
}: {
  tone?: Tone;
  title?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  const Icon = toneIcons[tone];
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={cn("flex gap-3 rounded-xl border p-4", toneStyles[tone], className)}
    >
      <Icon className="mt-0.5 size-5 shrink-0" aria-hidden />
      <div className="flex flex-col gap-0.5 text-charcoal">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className="text-sm">{children}</div>}
      </div>
    </div>
  );
}

export function Skeleton({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      aria-hidden
      className={cn("animate-pulse rounded-lg bg-charcoal/10", className)}
      {...props}
    />
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon: Icon = Inbox,
}: {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  icon?: typeof Inbox;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-border bg-surface px-6 py-10 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-background text-charcoal-muted">
        <Icon className="size-6" aria-hidden />
      </span>
      <p className="font-semibold">{title}</p>
      {description && <p className="max-w-sm text-sm text-charcoal-muted">{description}</p>}
      {action}
    </div>
  );
}

export function ErrorState({
  title = "Terjadi kendala",
  description = "Coba muat ulang. Jika masih gagal, hubungi fasilitator.",
  onRetry,
}: {
  title?: string;
  description?: ReactNode;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-card border border-brand/30 bg-brand-50 px-6 py-10 text-center"
    >
      <XCircle className="size-8 text-brand" aria-hidden />
      <p className="font-semibold">{title}</p>
      <p className="max-w-sm text-sm text-charcoal-muted">{description}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex min-h-11 items-center gap-2 rounded-pill px-4 font-semibold text-brand hover:bg-brand-100"
        >
          <RefreshCw className="size-4" aria-hidden />
          Coba lagi
        </button>
      )}
    </div>
  );
}
