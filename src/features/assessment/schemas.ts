import { z } from "zod";

// z.guid(): format UUID 8-4-4-4-12 tanpa mengecek versi/varian RFC.
const id = z.guid();

export const submitResponseSchema = z
  .object({
    client_event_id: id,
    scenario_version_id: id,
    choice_id: id.nullable(),
    timed_out: z.boolean(),
    shown_at: z.iso.datetime({ offset: true }),
    first_interaction_at: z.iso.datetime({ offset: true }).nullable(),
    answered_at: z.iso.datetime({ offset: true }).nullable(),
    response_ms: z.int().min(0).max(600_000),
    visibility_hidden_count: z.int().min(0).max(1000).default(0),
  })
  .refine((v) => (v.timed_out ? v.choice_id === null : v.choice_id !== null), {
    message: "Timeout tidak boleh punya pilihan; jawaban wajib punya pilihan.",
    path: ["choice_id"],
  });

export type SubmitResponseInput = z.infer<typeof submitResponseSchema>;
