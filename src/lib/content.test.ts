import { describe, it, expect, beforeEach } from "vitest";
import {
  validateGraph,
  scenarios,
  scenario,
  lessons,
  modules,
  resources,
} from "./content";
import { load, save, validAttempt, KEY, resetProgress } from "./progress";
describe("каталог и графы", () => {
  it("содержит 4 модуля, 8 уроков, 5 кейсов и 8 памяток", () => {
    expect([
      modules.length,
      lessons.length,
      scenarios.length,
      resources.length,
    ]).toEqual([4, 8, 5, 8]);
  });
  it.each(scenarios)("$slug: все 81 пути заканчиваются за 4 шага", (s) => {
    validateGraph(s);
    let count = 0;
    function walk(id: string | null, depth: number) {
      if (id === null) {
        expect(depth).toBe(4);
        count++;
        return;
      }
      for (const o of s.steps.find((step) => step.id === id)!.options)
        walk(o.next_step_id, depth + 1);
    }
    walk(s.first_step_id, 0);
    expect(count).toBe(81);
  });
  it("отклоняет цикл, потерянный переход и недостижимый шаг", () => {
    for (const target of ["s1", "missing"]) {
      const s = structuredClone(scenario);
      s.steps[0].options[0].next_step_id = target;
      expect(() => validateGraph(s)).toThrow();
    }
    const s = structuredClone(scenario);
    s.steps.push({ ...s.steps[3], id: "orphan" });
    expect(() => validateGraph(s)).toThrow();
  });
  it("в детской подборке нет кейса взрослых", () => {
    expect(
      scenarios
        .filter((s) => s.audience.includes("children"))
        .map((s) => s.slug),
    ).not.toContain("raznye-ozhidaniya");
  });
});
describe("прогресс", () => {
  beforeEach(() => resetProgress());
  it("сохраняет независимые попытки и версии", () => {
    const p = load();
    const a = {
      id: scenario.id,
      version: 1,
      choices: [{ step: "s1", option: "o3" }],
      pending: "o2",
    };
    save({
      ...p,
      lessons: { "kto-pomogaet": 1 },
      attempts: { [scenario.id]: a },
    });
    expect(load().lessons["kto-pomogaet"]).toBe(1);
    expect(validAttempt(load().attempts[scenario.id], scenario)).toBe(true);
    expect(validAttempt(a, { ...scenario, version: 2 })).toBe(false);
  });
  it("не принимает неверную последовательность и выбор из другого шага", () => {
    expect(
      validAttempt(
        {
          id: scenario.id,
          version: 1,
          choices: [{ step: "s3", option: "o1" }],
          pending: null,
        },
        scenario,
      ),
    ).toBe(false);
    expect(
      validAttempt(
        { id: scenario.id, version: 1, choices: [], pending: "missing" },
        scenario,
      ),
    ).toBe(false);
  });
  it("мигрирует старый прогресс без потери урока и попытки", () => {
    localStorage.setItem(
      KEY,
      JSON.stringify({
        schema: 1,
        lessonDone: true,
        attempt: {
          id: scenario.id,
          version: 1,
          choices: [{ step: "s1", option: "o3" }],
        },
      }),
    );
    expect(load().lessons["kto-pomogaet"]).toBe(1);
    expect(load().attempts[scenario.id].choices).toHaveLength(1);
  });
  it("очистка браузера и повреждённый JSON сбрасывают память", () => {
    save({ ...load(), lessons: { "kto-pomogaet": 1 } });
    localStorage.clear();
    expect(load().lessons).toEqual({});
    localStorage.setItem(KEY, "{bad");
    expect(load().attempts).toEqual({});
  });
});
