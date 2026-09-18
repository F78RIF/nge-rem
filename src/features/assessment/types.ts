/** Tipe bersama assessment engine (aman untuk client). Blueprint Bab 16. */

export type SafetyLabel = "safe" | "mixed" | "risky";

export type ScenarioChoice = {
  id: string;
  text: string;
  safetyLabel: SafetyLabel;
  feedbackShort: string;
  feedbackLong: string | null;
  legalReference: string | null;
};

export type ScenarioItem = {
  /** scenario_version_id — attempt selalu menunjuk snapshot versi (Bab 33.2). */
  versionId: string;
  position: number;
  title: string;
  context: string;
  mediaUrl: string | null;
  mediaAlt: string | null;
  dimensions: string[];
  timeLimitSec: number;
  randomizeChoices: boolean;
  microNudge: string | null;
  choices: ScenarioChoice[];
};

export type AssessmentSet = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  items: ScenarioItem[];
};

export type StartAttemptResult = {
  attemptId: string;
  totalItems: number;
  /** Jawaban yang sudah tersimpan — untuk melanjutkan attempt (Bab 5.1). */
  answered: ScenarioOutcome[];
  resumed: boolean;
};

/** Payload POST /api/v1/attempts/:id/responses (Bab 29.2). */
export type ResponsePayload = {
  client_event_id: string;
  scenario_version_id: string;
  choice_id: string | null;
  timed_out: boolean;
  shown_at: string;
  first_interaction_at: string | null;
  answered_at: string | null;
  response_ms: number;
  visibility_hidden_count: number;
};

/** Hasil satu scenario yang dipakai layar feedback & ringkasan. */
export type ScenarioOutcome = {
  versionId: string;
  choiceId: string | null;
  timedOut: boolean;
  responseMs: number;
};
