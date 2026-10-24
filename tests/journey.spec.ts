import { test, expect } from "@playwright/test";
import { readdirSync, readFileSync } from "node:fs";
const read = (folder: string) =>
  readdirSync(`src/content/${folder}`)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(readFileSync(`src/content/${folder}/${f}`, "utf8")));
const scenarios = read("scenarios");
const lessons = read("lessons");
const modules = read("modules");
const resources = read("resources");
test("главная → урок → кейс → памятка, восстановление и PDF", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Начать учиться" }).click();
  for (let i = 0; i < 2; i++)
    await page.getByRole("button", { name: "Далее →", exact: true }).click();
  await page.getByRole("button", { name: "К вопросу →" }).click();
  await page
    .getByRole("button", { name: "Помогает каждому высказаться" })
    .click();
  await page.getByRole("button", { name: "Завершить урок" }).click();
  await page.reload();
  await expect(
    page.getByText("✓ Урок пройден.", { exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Перейти к практике" }).click();
  const answers = [
    "Я нарисую, а ты вырежешь буквы?",
    "Тебе хочется придумать название?",
    "Давай сравним наши идеи.",
    "Я рисую, ты клеишь. Через пять минут сверимся?",
  ];
  for (let i = 0; i < 4; i++) {
    await page.getByRole("button", { name: answers[i], exact: true }).click();
    await expect(page.getByRole("status")).toBeVisible();
    if (i === 0) {
      await page.reload();
      await expect(
        page.getByRole("button", { name: answers[i], exact: true }),
      ).toBeDisabled();
      await expect(page.getByRole("status")).toContainText("Саша предлагает");
    }
    await page
      .getByRole("button", {
        name: i === 3 ? "Посмотреть итог" : "Далее →",
        exact: true,
      })
      .click();
  }
  await expect(
    page.getByRole("heading", { name: "Теперь есть с чего начать" }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Теперь есть с чего начать" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Взять памятку" }).click();
  const pdf = await page.request.get("/pdf/kak-dogovoritsya.pdf");
  expect(pdf.ok()).toBe(true);
  expect((await pdf.body()).subarray(0, 4).toString()).toBe("%PDF");
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Как договориться", exact: true }),
  ).toBeVisible();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Скачать PDF" }).click();
  expect((await downloadPromise).suggestedFilename()).toBe(
    "kak-dogovoritsya.pdf",
  );
});
test("адаптивная вёрстка, увеличение текста, поиск и 404", async ({ page }) => {
  const paths = [
    "/",
    "/learn",
    "/practice",
    "/resources",
    "/help",
    "/learn/nash-obshchiy-plan",
    "/practice/raznye-ozhidaniya",
  ];
  for (const { width, scale } of [
    { width: 320, scale: 1 },
    { width: 375, scale: 1 },
    { width: 768, scale: 1 },
    { width: 1440, scale: 1 },
    { width: 375, scale: 2 },
    { width: 768, scale: 2 },
  ]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of paths) {
      await page.goto(path);
      if (scale === 2)
        await page.addStyleTag({
          content: ":root {font-size: 36px !important}",
        });
      const metrics = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > innerWidth + 1,
        clipped: [
          ...document.querySelectorAll<HTMLElement>(
            "h1,h2,h3,button,select,input,p",
          ),
        ]
          .filter(
            (el) =>
              el.getClientRects().length &&
              el.clientWidth > 0 &&
              el.scrollWidth > el.clientWidth + 2,
          )
          .map((el) => el.textContent?.trim()),
      }));
      expect(metrics, `${path}, ${width}px, text ${scale * 100}%`).toEqual({
        overflow: false,
        clipped: [],
      });
    }
  }
  await page.goto("/resources");
  await page.getByRole("searchbox").fill("несуществующая памятка");
  await expect(page.getByRole("status")).toContainText("Ничего не найдено");
  await page.goto("/unknown");
  await expect(
    page.getByRole("heading", { name: "Этой страницы нет" }),
  ).toBeVisible();
});
test("недоступное хранилище: кейс работает в памяти", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new Error("blocked");
      },
    });
  });
  await page.goto("/practice/obshee-zadanie");
  await page
    .getByRole("button", {
      name: "Я нарисую, а ты вырежешь буквы?",
      exact: true,
    })
    .click();
  await page.getByRole("button", { name: "Далее →", exact: true }).click();
  await expect(page.getByText("Шаг 2 из 4")).toBeVisible();
  await expect(
    page.getByText("Хранилище недоступно.", { exact: false }),
  ).toBeVisible();
});
test("старый формат переносится, устаревшая попытка сбрасывается, сброс требует подтверждения", async ({
  page,
}) => {
  await page.goto("/learn");
  await page.evaluate(() =>
    localStorage.setItem(
      "dialogue-progress-v1",
      JSON.stringify({
        schema: 1,
        lessonDone: true,
        attempt: { id: "poster", version: 0, choices: [] },
      }),
    ),
  );
  await page.goto("/practice/obshee-zadanie");
  await expect(page.getByRole("status")).toContainText("устарела");
  await page.goto("/learn");
  await page.getByRole("button", { name: "Сбросить мой прогресс" }).click();
  await page.getByRole("button", { name: "Отмена", exact: true }).click();
  await expect(page.getByText("✓ Пройден · Повторить →")).toBeVisible();
  await page.getByRole("button", { name: "Сбросить мой прогресс" }).click();
  await page.getByRole("button", { name: "Да, удалить прогресс" }).click();
  expect(
    await page.evaluate(() => localStorage.getItem("dialogue-progress-v1")),
  ).toBeNull();
  await expect(page.getByText("✓ Пройден · Повторить →")).toHaveCount(0);
});
for (const scenario of scenarios)
  test(`кейс ${scenario.slug}: четыре шага, итог, повтор`, async ({ page }) => {
    await page.goto(`/practice/${scenario.slug}`);
    await expect(
      page.getByRole("heading", { name: scenario.title, exact: true }),
    ).toBeVisible();
    for (let i = 0; i < 4; i++) {
      const option = scenario.steps[i].options[i % 3];
      await page
        .getByRole("button", { name: option.text, exact: true })
        .click();
      await expect(page.getByRole("status")).toContainText(option.consequence);
      await page
        .getByRole("button", {
          name: i === 3 ? "Посмотреть итог" : "Далее →",
          exact: true,
        })
        .click();
    }
    await expect(
      page.getByRole("heading", { name: "Теперь есть с чего начать" }),
    ).toBeVisible();
    await page.getByText("Посмотреть свои решения", { exact: true }).click();
    await expect(
      page.getByText(scenario.steps[0].options[0].text, { exact: true }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Начать заново" }).click();
    await expect(page.getByText("Шаг 1 из 4")).toBeVisible();
  });
for (const lesson of lessons)
  test(`урок ${lesson.slug}: все экраны и сохранение`, async ({ page }) => {
    await page.goto(`/learn/${lesson.slug}`);
    for (let i = 0; i < lesson.blocks.length; i++) {
      await expect(
        page.getByText(lesson.blocks[i], { exact: true }),
      ).toBeVisible();
      await page
        .getByRole("button", {
          name: i === lesson.blocks.length - 1 ? "К вопросу →" : "Далее →",
          exact: true,
        })
        .click();
    }
    const correct = lesson.choices.find((c: any) => c.correct);
    await page.getByRole("button", { name: correct.text, exact: true }).click();
    await expect(page.getByRole("status")).toContainText(correct.explanation);
    await page.getByRole("button", { name: "Завершить урок" }).click();
    await page.reload();
    await expect(
      page.getByText("✓ Урок пройден.", { exact: true }),
    ).toBeVisible();
  });
for (const module of modules)
  test(`модуль ${module.slug}: три вопроса с пояснениями`, async ({ page }) => {
    await page.goto(`/learn/module/${module.slug}`);
    for (let i = 0; i < 3; i++) {
      const q = module.questions[i];
      const c = q.choices[0];
      await page.getByRole("button", { name: c.text, exact: true }).click();
      await expect(page.getByRole("status")).toContainText(c.explanation);
      await page
        .getByRole("button", {
          name: i === 2 ? "Завершить проверку" : "Следующий вопрос →",
          exact: true,
        })
        .click();
    }
    await expect(
      page.getByRole("heading", { name: "Спасибо за размышления!" }),
    ).toBeVisible();
    await page.goto("/learn");
    await expect(
      page.getByText("Проверка пройдена", { exact: true }),
    ).toBeVisible();
  });
test("аудитории и фильтры: взрослый кейс не попадает детям", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Детям", exact: true }).click();
  await page.getByRole("link", { name: "Выбрать ситуацию" }).click();
  await expect(
    page.getByRole("heading", { name: "Разные ожидания", exact: true }),
  ).toHaveCount(0);
  await page.getByLabel("Для кого").selectOption("parents");
  await expect(
    page.getByRole("heading", { name: "Разные ожидания", exact: true }),
  ).toBeVisible();
  await page.goto("/resources?audience=children");
  await expect(page.locator(".catalog-grid .card")).toHaveCount(5);
  await page.getByLabel("Для кого").selectOption("teachers");
  await page
    .getByRole("combobox", { name: "Тема", exact: true })
    .selectOption("Поддержка");
  await expect(page.locator(".catalog-grid .card")).toHaveCount(1);
  await expect(
    page.getByRole("heading", {
      name: "Как начать обсуждение разногласия в классе",
    }),
  ).toBeVisible();
});
test("попытки двух кейсов независимы", async ({ page }) => {
  await page.goto("/practice/obshee-zadanie");
  await page
    .getByRole("button", {
      name: "Я нарисую, а ты вырежешь буквы?",
      exact: true,
    })
    .click();
  await page.getByRole("button", { name: "Далее →", exact: true }).click();
  await page.goto("/practice/igra-na-peremene");
  await expect(page.getByText("Шаг 1 из 4")).toBeVisible();
  await page
    .getByRole("button", { name: "Что тебе нравится в прятках?", exact: true })
    .click();
  await page.goto("/practice/obshee-zadanie");
  await expect(page.getByText("Шаг 2 из 4")).toBeVisible();
  await page.goto("/practice/igra-na-peremene");
  await expect(page.getByRole("status")).toContainText("Дима говорит");
});
test("ошибки изображения и PDF объяснены, повтор работает", async ({
  page,
}) => {
  await page.route("**/images/*.webp", (route) => route.abort());
  await page.route("**/pdf/*.pdf", (route) =>
    route.fulfill({ status: 404, body: "not found" }),
  );
  await page.goto("/resources/pauza");
  await expect(
    page.getByRole("button", { name: "Загрузить картинку снова" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Скачать PDF" }).click();
  await expect(
    page.getByText("Не удалось скачать PDF.", { exact: false }),
  ).toBeVisible();
  await page.unroute("**/images/*.webp");
  await page.getByRole("button", { name: "Загрузить картинку снова" }).click();
  await expect(page.getByRole("img")).toBeVisible();
  await page.unroute("**/pdf/*.pdf");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Повторить скачивание PDF" }).click();
  expect((await download).suggestedFilename()).toBe("pauza.pdf");
});
test("все памятки, изображения и PDF доступны", async ({ page }) => {
  for (const r of resources) {
    await page.goto(`/resources/${r.slug}`);
    await expect(
      page.getByRole("heading", { name: r.title, exact: true }),
    ).toBeVisible();
    await expect(page.getByRole("img")).toBeVisible();
    expect(
      await page
        .getByRole("img")
        .evaluate(
          (img: HTMLImageElement) => img.complete && img.naturalWidth > 0,
        ),
    ).toBe(true);
    const pdf = await page.request.get(r.pdf);
    expect(pdf.ok()).toBe(true);
    expect((await pdf.body()).subarray(0, 5).toString()).toBe("%PDF-");
  }
});
