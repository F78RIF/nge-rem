import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/** Lebar konten maks 1240px, padding samping 16–20px di mobile (Bab 34.3). */
export function Container({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("mx-auto w-full max-w-content px-4 sm:px-5 lg:px-8", className)} {...props} />;
}
