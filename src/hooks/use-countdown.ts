"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Countdown berbasis performance.now() — tidak melenceng walau render
 * terlambat. Mulai otomatis saat komponen dipasang; `onExpire` dipanggil
 * tepat sekali. Hentikan dengan `running = false` (mis. setelah menjawab).
 */
export function useCountdown(totalMs: number, running: boolean, onExpire: () => void) {
  const [remainingMs, setRemainingMs] = useState(totalMs);
  const startRef = useRef<number | null>(null);
  const expireRef = useRef(onExpire);
  const firedRef = useRef(false);

  useEffect(() => {
    expireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    if (!running) return;
    startRef.current ??= performance.now();
    let frame = 0;

    /** Mengembalikan true selama waktu masih tersisa. */
    const update = () => {
      const left = Math.max(0, totalMs - (performance.now() - startRef.current!));
      setRemainingMs(left);
      if (left > 0) return true;
      if (!firedRef.current) {
        firedRef.current = true;
        expireRef.current();
      }
      return false;
    };
    const loop = () => {
      if (update()) frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);

    // rAF berhenti saat tab tersembunyi; interval memastikan timeout tetap terdeteksi.
    const fallback = window.setInterval(update, 250);
    return () => {
      cancelAnimationFrame(frame);
      window.clearInterval(fallback);
    };
  }, [running, totalMs]);

  return {
    remainingMs,
    /** Detik yang ditampilkan: dibulatkan ke atas agar "1" tampil sampai benar-benar habis. */
    remainingSec: Math.ceil(remainingMs / 1000),
    ratio: totalMs > 0 ? remainingMs / totalMs : 0,
  };
}
