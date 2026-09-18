import type { ResponsePayload } from "./types";

/**
 * Antrian jawaban di browser — Blueprint Bab 16.3 & 33.1. Setiap jawaban
 * masuk antrian dulu lalu dikirim; bila koneksi putus, antrian dikirim ulang
 * saat online. Server men-dedupe berdasarkan client_event_id sehingga
 * pengiriman ganda aman. Hanya berisi ID & timing, tanpa data pribadi.
 */

type QueuedResponse = { attemptId: string; payload: ResponsePayload };

const KEY = "ngerem:response-queue:v1";
let memoryFallback: QueuedResponse[] = [];
let flushing: Promise<FlushResult> | null = null;

/** `rejectedIds`: client_event_id yang ditolak permanen (4xx) dan dibuang dari antrian. */
export type FlushResult = { pendingIds: string[]; rejectedIds: string[] };

function read(): QueuedResponse[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as QueuedResponse[]) : [];
  } catch {
    return memoryFallback;
  }
}

function write(items: QueuedResponse[]) {
  memoryFallback = items;
  try {
    if (items.length) localStorage.setItem(KEY, JSON.stringify(items));
    else localStorage.removeItem(KEY);
  } catch {
    // Mode privat / storage penuh: tetap jalan dengan antrian di memori.
  }
}

export function enqueueResponse(attemptId: string, payload: ResponsePayload) {
  const items = read().filter((i) => i.payload.client_event_id !== payload.client_event_id);
  write([...items, { attemptId, payload }]);
}

export function pendingFor(attemptId: string): ResponsePayload[] {
  return read()
    .filter((i) => i.attemptId === attemptId)
    .map((i) => i.payload);
}

async function send(item: QueuedResponse): Promise<"done" | "retry" | "rejected"> {
  try {
    const res = await fetch(`/api/v1/attempts/${item.attemptId}/responses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item.payload),
      keepalive: true,
    });
    if (res.ok) return "done";
    // 4xx = data tidak akan pernah diterima (attempt selesai/tidak valid) → buang.
    if (res.status >= 400 && res.status < 500 && res.status !== 408 && res.status !== 429) {
      console.warn("[assessment] respons ditolak server", res.status, await res.text().catch(() => ""));
      return "rejected";
    }
    return "retry";
  } catch {
    return "retry"; // offline / jaringan putus
  }
}

async function doFlush(): Promise<FlushResult> {
  const rejectedIds: string[] = [];
  for (const item of read()) {
    const outcome = await send(item);
    if (outcome === "retry") break; // pertahankan urutan; coba lagi nanti
    if (outcome === "rejected") rejectedIds.push(item.payload.client_event_id);
    write(read().filter((i) => i.payload.client_event_id !== item.payload.client_event_id));
  }
  return { pendingIds: read().map((i) => i.payload.client_event_id), rejectedIds };
}

/** Kirim semua antrian secara berurutan. Pemanggilan bersamaan berbagi satu proses. */
export function flushResponses(): Promise<FlushResult> {
  flushing ??= doFlush().finally(() => {
    flushing = null;
  });
  return flushing;
}
