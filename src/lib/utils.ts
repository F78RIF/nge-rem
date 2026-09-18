import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Daftarkan ukuran font kustom (tailwind.config.ts) agar tailwind-merge tidak
// mengira `text-body` dkk. adalah warna lalu membuang `text-white`.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: ["caption", "body", "body-lg", "h2", "h1", "hero"] }],
    },
  },
});

/** Gabungkan className Tailwind dan selesaikan konflik utilitas. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
