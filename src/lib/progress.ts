import { z } from "zod";
import type { Scenario } from "./schemas";
export const KEY = "dialogue-progress-v1";
const attempt = z.object({
  id: z.string(),
  version: z.number(),
  choices: z.array(z.object({ step: z.string(), option: z.string() })),
  pending: z.string().nullable().default(null),
});
const schema = z.object({
  schema: z.literal(2),
  lessons: z.record(z.string(), z.number()),
  quizzes: z.record(z.string(), z.number()),
  attempts: z.record(z.string(), attempt),
});
export type Progress = z.infer<typeof schema>;
export type Attempt = z.infer<typeof attempt>;
const empty = (): Progress => ({
  schema: 2,
  lessons: {},
  quizzes: {},
  attempts: {},
});
let memory = empty();
export let storageWarning = "";
function decode(raw: string): Progress {
  const data = JSON.parse(raw);
  if (data.schema === 1) {
    const old = z
      .object({
        schema: z.literal(1),
        lessonDone: z.boolean(),
        attempt: attempt.nullable(),
      })
      .parse(data);
    return {
      schema: 2,
      lessons: old.lessonDone ? { "kto-pomogaet": 1 } : {},
      quizzes: {},
      attempts: old.attempt ? { [old.attempt.id]: old.attempt } : {},
    };
  }
  return schema.parse(data);
}
export function load(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    storageWarning = "";
    if (!raw) return (memory = empty());
    try {
      return (memory = decode(raw));
    } catch {
      storageWarning =
        "Сохранённые данные повреждены. Начинаем заново; другие возможности сайта доступны.";
      return (memory = empty());
    }
  } catch {
    storageWarning =
      "Хранилище недоступно. После закрытия страницы прогресс может потеряться.";
    return memory;
  }
}
export function save(p: Progress) {
  memory = p;
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
    storageWarning = "";
  } catch {
    storageWarning =
      "Хранилище недоступно. После закрытия страницы прогресс может потеряться.";
  }
}
export function resetProgress() {
  memory = empty();
  try {
    localStorage.removeItem(KEY);
    storageWarning = "";
  } catch {}
  return memory;
}
export function validAttempt(a: Attempt | undefined, s: Scenario) {
  if (!a || a.id !== s.id || a.version !== s.version) return false;
  let next: string | null = s.first_step_id;
  for (const c of a.choices) {
    if (c.step !== next) return false;
    const o = s.steps
      .find((x) => x.id === next)
      ?.options.find((x) => x.id === c.option);
    if (!o) return false;
    next = o.next_step_id;
  }
  return (
    !a.pending ||
    !!s.steps
      .find((x) => x.id === next)
      ?.options.some((x) => x.id === a.pending)
  );
}
