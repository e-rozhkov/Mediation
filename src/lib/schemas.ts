import { z } from "zod";
const text = z.string().min(1);
const base = z.object({
  id: text,
  slug: text,
  title: text,
  audience: z.array(z.enum(["children", "parents", "teachers"])).min(1),
  age_min: z.literal(7).optional(),
  age_max: z.literal(10).optional(),
  intro: text,
  image: z.object({ src: text, alt: text }),
});
export const lessonSchema = base.extend({
  version: z.number().int().positive(),
  module: text,
  order: z.number().int().positive(),
  adult_note: text,
  blocks: z.array(text).min(1),
  question: text,
  scenario: text,
  choices: z
    .array(
      z.object({ id: text, text, correct: z.boolean(), explanation: text }),
    )
    .length(3),
});
export const scenarioSchema = base.extend({
  version: z.number().int().positive(),
  takeaway: text,
  adult_note: text,
  participants: z.array(text).min(2),
  skill: text,
  duration: text,
  first_step_id: text,
  resource: text,
  steps: z
    .array(
      z.object({
        id: text,
        story: text,
        question: text,
        options: z
          .array(
            z.object({
              id: text,
              text,
              consequence: text,
              explanation: text,
              next_step_id: text.nullable(),
            }),
          )
          .length(3),
      }),
    )
    .min(1),
});
export const resourceSchema = base.extend({
  topic: text,
  blocks: z.array(text).min(4).max(6),
  example: text,
  checklist: z.array(text).min(1),
  pdf: text,
});
export type Scenario = z.infer<typeof scenarioSchema>;
export function unique(ids: string[], label: string) {
  if (new Set(ids).size !== ids.length)
    throw Error(`${label}: повторяющийся идентификатор`);
}
export function validateGraph(s: Scenario) {
  unique(
    s.steps.map((x) => x.id),
    s.slug,
  );
  const seen = new Set<string>();
  const active = new Set<string>();
  function visit(id: string) {
    if (active.has(id)) throw Error(`${s.slug}: цикл ${id}`);
    if (seen.has(id)) return;
    const step = s.steps.find((x) => x.id === id);
    if (!step) throw Error(`${s.slug}: неизвестный шаг ${id}`);
    active.add(id);
    unique(
      step.options.map((x) => x.id),
      id,
    );
    for (const o of step.options)
      if (o.next_step_id !== null) visit(o.next_step_id);
    active.delete(id);
    seen.add(id);
  }
  visit(s.first_step_id);
  if (seen.size !== s.steps.length) throw Error(`${s.slug}: недостижимый шаг`);
}

export const moduleSchema = base.extend({
  order: z.number().int().positive(),
  lessons: z.array(text).length(2),
  questions: z
    .array(
      z.object({
        id: text,
        question: text,
        choices: lessonSchema.shape.choices,
      }),
    )
    .length(3),
});
