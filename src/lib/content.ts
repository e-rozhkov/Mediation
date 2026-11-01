import mediationData from "../content/pages/mediation.json";
import {
  lessonSchema,
  scenarioSchema,
  resourceSchema,
  moduleSchema,
  mediationPageSchema,
} from "./schemas";
export * from "./schemas";
function parseAll<T>(
  files: Record<string, unknown>,
  schema: { parse: (x: unknown) => T },
): T[] {
  return Object.values(files).map((data) => schema.parse(data));
}
export const lessons = parseAll(
  import.meta.glob("../content/lessons/*.json", {
    eager: true,
    import: "default",
  }),
  lessonSchema,
);
export const scenarios = parseAll(
  import.meta.glob("../content/scenarios/*.json", {
    eager: true,
    import: "default",
  }),
  scenarioSchema,
);
export const resources = parseAll(
  import.meta.glob("../content/resources/*.json", {
    eager: true,
    import: "default",
  }),
  resourceSchema,
);
export const modules = parseAll(
  import.meta.glob("../content/modules/*.json", {
    eager: true,
    import: "default",
  }),
  moduleSchema,
).sort((a, b) => a.order - b.order);
// Stable examples retained for regression tests of the first journey.
export const lesson = lessons.find((x) => x.slug === "kto-pomogaet")!;
export const scenario = scenarios.find((x) => x.slug === "obshee-zadanie")!;
export const resource = resources.find((x) => x.slug === "kak-dogovoritsya")!;
export const mediationPage = mediationPageSchema.parse(mediationData);

export function quizProgressKey(module: { slug: string; version: number }) {
  return module.version === 1
    ? module.slug
    : `${module.slug}@${module.version}`;
}
