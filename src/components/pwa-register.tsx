"use client";

import { useEffect } from "react";

/** Mendaftarkan service worker hanya di production agar tidak mengganggu HMR. */
export function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch(() => {
      // Gagal daftar SW tidak boleh menghalangi aplikasi.
    });
  }, []);
  return null;
}
