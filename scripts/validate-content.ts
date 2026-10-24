import { readFileSync, readdirSync, existsSync } from "node:fs";
import { resolve, relative } from "node:path";
import {
  lessonSchema,
  scenarioSchema,
  resourceSchema,
  moduleSchema,
  unique,
  validateGraph,
} from "../src/lib/schemas";
const groups = [
  ["lessons", lessonSchema],
  ["scenarios", scenarioSchema],
  ["resources", resourceSchema],
  ["modules", moduleSchema],
] as const;
const records: Record<string, { file: string; data: any }[]> = {};
function fileExists(path: string) {
  const absolute = resolve("public", path.replace(/^\//, ""));
  if (
    relative(resolve("public"), absolute).startsWith("..") ||
    !path.startsWith("/") ||
    !existsSync(absolute)
  )
    throw Error(`Отсутствующий или недопустимый файл ${path}`);
}
for (const [folder, schema] of groups) {
  records[folder] = [];
  for (const file of readdirSync(`src/content/${folder}`).filter((f) =>
    f.endsWith(".json"),
  )) {
    const path = `src/content/${folder}/${file}`;
    try {
      const data = schema.parse(JSON.parse(readFileSync(path, "utf8")));
      if (file !== `${data.slug}.json`)
        throw Error("Имя файла не совпадает со slug");
      records[folder].push({ file: path, data });
      if (
        data.audience.includes("children") &&
        (data.age_min !== 7 || data.age_max !== 10)
      )
        throw Error("Нужен возраст 7–10");
      fileExists(data.image.src);
      if ("steps" in data) validateGraph(scenarioSchema.parse(data));
      const questions =
        "questions" in data ? data.questions : "choices" in data ? [data] : [];
      if ("questions" in data)
        unique(
          data.questions.map((q) => q.id),
          path,
        );
      for (const q of questions) {
        unique(
          q.choices.map((c) => c.id),
          path,
        );
        if (q.choices.filter((c) => c.correct).length !== 1)
          throw Error("Нужен один верный ответ");
      }
      if ("pdf" in data) {
        fileExists(data.pdf);
        if (
          !readFileSync(`public${data.pdf}`)
            .subarray(0, 5)
            .equals(Buffer.from("%PDF-"))
        )
          throw Error("Файл не PDF");
      }
      console.log(`OK ${path}`);
    } catch (e) {
      throw Error(`${path}: ${e}`);
    }
  }
}
const all = Object.values(records).flat();
unique(
  all.map((x) => x.data.id),
  "Материалы",
);
unique(
  all.map((x) => x.data.slug),
  "Адреса",
);
function link(group: string, slug: string, file: string) {
  const target = records[group].find((x) => x.data.slug === slug);
  if (!target) throw Error(`${file}: неизвестная ссылка ${group}/${slug}`);
  return target.data;
}
for (const { file, data } of records.lessons) {
  link("scenarios", data.scenario, file);
  const m = link("modules", data.module, file);
  if (!m.lessons.includes(data.slug))
    throw Error(`${file}: урок не включён в свой модуль`);
}
for (const { file, data } of records.scenarios) {
  link("resources", data.resource, file);
}
for (const { file, data } of records.modules) {
  unique(data.lessons, file);
  for (const slug of data.lessons) {
    const l = link("lessons", slug, file);
    if (l.module !== data.slug) throw Error(`${file}: неверный модуль урока`);
  }
}
console.log(`Проверено материалов: ${all.length}`);
