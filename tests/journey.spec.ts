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
const firstLesson = lessons.find((l) => l.slug === "kto-pomogaet");
test("главная → урок → кейс → памятка, восстановление и PDF", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Начать учиться" }).click();
  for (let i = 0; i < firstLesson.blocks.length - 1; i++)
    await page.getByRole("button", { name: "Далее →", exact: true }).click();
  await page.getByRole("button", { name: "К вопросу →" }).click();
  await page
    .getByRole("button", {
      name: firstLesson.choices.find((c: any) => c.correct).text,
    })
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
  // The rewritten lesson has a new version; an old completion must not mark it done.
  await expect(page.getByText("✓ Пройден · Повторить →")).toHaveCount(0);
  await page.evaluate(
    (version) =>
      localStorage.setItem(
        "dialogue-progress-v1",
        JSON.stringify({
          schema: 2,
          lessons: { "kto-pomogaet": version },
          quizzes: {},
          attempts: {},
        }),
      ),
    firstLesson.version,
  );
  await page.reload();
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
    if (module.version > 1) {
      await page.goto("/learn");
      await page.evaluate(
        (slug) =>
          localStorage.setItem(
            "dialogue-progress-v1",
            JSON.stringify({
              schema: 2,
              lessons: {},
              quizzes: { [slug]: 3 },
              attempts: {},
            }),
          ),
        module.slug,
      );
      await page.reload();
      await expect(
        page.getByText("Проверка пройдена", { exact: true }),
      ).toHaveCount(0);
    }
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
test("общие каталоги без выбора аудитории, поиск и тема", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Детям", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("link", { name: "Выбрать ситуацию" }).click();
  await expect(page.locator(".catalog-grid .card")).toHaveCount(5);
  await expect(
    page.getByRole("heading", { name: "Разные ожидания", exact: true }),
  ).toBeVisible();
  await page.goto("/practice?audience=children");
  await expect(page.locator(".catalog-grid .card")).toHaveCount(5);
  await page.goto("/resources?audience=teachers");
  await expect(page.locator(".catalog-grid .card")).toHaveCount(8);
  await expect(page.getByRole("radio")).toHaveCount(0);
  await page.getByRole("button", { name: "Поддержка", exact: true }).click();
  await expect(page.locator(".catalog-grid .card")).toHaveCount(2);
  await page.getByRole("searchbox").fill("в классе");
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

test("хлебные крошки содержат отдельную ссылку на главную", async ({
  page,
}) => {
  for (const path of [
    "/mediation",
    "/learn",
    "/practice",
    "/resources",
    "/help",
    "/about",
    "/learn/kto-pomogaet",
    "/learn/module/kto-pomogaet-module",
    "/practice/igra-na-peremene",
    "/resources/pauza",
    "/missing",
  ]) {
    await page.goto(path);
    const crumbs = page.getByRole("navigation", { name: "Хлебные крошки" });
    await expect(
      crumbs.getByRole("link", { name: "Главная", exact: true }),
    ).toHaveAttribute("href", "/");
  }
  await page
    .getByRole("navigation", { name: "Хлебные крошки" })
    .getByRole("link", { name: "Главная", exact: true })
    .click();
  await expect(page).toHaveURL("/");
});
test("материалы документа доступны на главной и в новом уроке", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "О медиации", exact: true }),
  ).toBeVisible();
  await page.getByText("Принципы и границы медиации", { exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "О чём нельзя обещать молчать" }),
  ).toBeVisible();
  await page.getByText("Восстановительная медиация", { exact: true }).click();
  await expect(
    page.getByText("В некоторых конфликтах проблема не в том", {
      exact: false,
    }),
  ).toBeVisible();
  await page.getByText("Как проходит встреча", { exact: true }).click();
  await expect(page.locator(".meeting-steps>li")).toHaveCount(6);
  await expect(page.locator(".meeting-flow>li")).toHaveCount(4);
  expect(await page.locator("body").innerText()).not.toContain("—");
  await page.goto("/learn/kto-pomogaet");
  await expect(
    page.getByRole("heading", { name: "Замечаем конфликт", exact: true }),
  ).toBeVisible();
  await page.getByText("Содержание урока", { exact: true }).click();
  await page
    .getByRole("button", {
      name: "Перейти к теме: Что сообщают эмоции",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("heading", { name: "Что сообщают эмоции", exact: true }),
  ).toBeVisible();
  await page.getByText("Разобраться подробнее", { exact: true }).click();
  await expect(
    page.getByText("Эмоции помогают заметить, что ситуация имеет значение.", {
      exact: false,
    }),
  ).toBeVisible();
});
test("локальный Manrope загружен, включая кириллицу", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  expect(
    await page.evaluate(() =>
      document.fonts.check("400 18px Manrope", "Медиация"),
    ),
  ).toBe(true);
  expect(
    await page
      .getByRole("heading", { level: 1 })
      .evaluate((e) => getComputedStyle(e).fontFamily),
  ).toContain("Manrope");
  const response = await page.request.get("/fonts/Manrope-variable.ttf");
  expect(response.ok()).toBe(true);
  expect((await response.body()).length).toBeGreaterThan(100000);
});

test("Главная в меню и общие разделы без возрастных подписей", async ({
  page,
}) => {
  for (const path of [
    "/",
    "/learn",
    "/learn/kto-pomogaet",
    "/learn/module/kto-pomogaet-module",
    "/practice",
    "/practice/raznye-ozhidaniya",
    "/resources",
    "/resources/pauza",
    "/about",
  ]) {
    await page.goto(path);
    await expect(page.locator("body")).not.toContainText("7–10");
    await expect(
      page.getByRole("group", { name: "Для кого материалы" }),
    ).toHaveCount(0);
    await expect(page.getByRole("radio")).toHaveCount(0);
  }
  const nav = page.getByRole("navigation", { name: "Основная навигация" });
  await expect(
    nav.getByRole("link", { name: "Главная", exact: true }),
  ).toHaveAttribute("href", "/");
  await page.goto("/learn/kto-pomogaet");
  await expect(page.locator("main")).not.toContainText("Урок 1");
  await nav.getByRole("link", { name: "Главная", exact: true }).click();
  await expect(page).toHaveURL("/");
  await expect(
    nav.getByRole("link", { name: "Главная", exact: true }),
  ).toHaveAttribute("aria-current", "page");
});

test("содержание урока прокручивает к теме с учётом закреплённого меню", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/learn/kto-pomogaet");
  await page.evaluate(() => document.fonts.ready);
  await page.getByText("Содержание урока", { exact: true }).click();
  const topic = page.getByRole("button", {
    name: "Перейти к теме: Что сообщают эмоции",
    exact: true,
  });
  await topic.click();
  await expect(
    page.getByRole("heading", { name: "Что сообщают эмоции", exact: true }),
  ).toBeVisible();
  const panel = page.getByRole("region", { name: "Урок", exact: true });
  await expect(panel).toBeFocused();
  await expect
    .poll(async () =>
      page.evaluate(() => {
        const header = document
          .querySelector("header")!
          .getBoundingClientRect();
        const heading = document
          .querySelector(".lesson-page .panel h2")!
          .getBoundingClientRect();
        const panelTop = document
          .querySelector(".lesson-page .panel")!
          .getBoundingClientRect().top;
        const scrollEnd =
          Math.ceil(scrollY + innerHeight) >=
          document.documentElement.scrollHeight;
        const aligned =
          Math.abs(panelTop - header.bottom - 16) < 3 || scrollEnd;
        return (
          aligned &&
          header.top >= -1 &&
          Math.abs(header.top) < 1 &&
          heading.top >= header.bottom &&
          heading.bottom <= innerHeight
        );
      }),
    )
    .toBe(true);
  // Re-selecting the current theme must scroll too, even though the theme index is unchanged.
  await topic.click();
  await expect(panel).toBeFocused();
  await expect
    .poll(async () =>
      page.evaluate(
        () =>
          document
            .querySelector(".lesson-page .panel h2")!
            .getBoundingClientRect().bottom < innerHeight,
      ),
    )
    .toBe(true);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page
    .getByRole("button", {
      name: "Перейти к теме: Факты и оценки",
      exact: true,
    })
    .click();
  await expect(panel).toBeFocused();
  await expect(
    page.getByRole("heading", { name: "Факты и оценки", exact: true }),
  ).toBeInViewport();
});
test("верхнее меню остаётся на месте при прокрутке и смене разделов", async ({
  page,
}) => {
  for (const width of [375, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/learn");
    await page.evaluate(() => document.fonts.ready);
    const header = page.locator("header");
    const before = await header.boundingBox();
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect
      .poll(async () => Math.abs((await header.boundingBox())!.y))
      .toBeLessThan(1);
    const nav = page.getByRole("navigation", { name: "Основная навигация" });
    for (const name of ["О медиации", "Памятки", "Главная", "Обучение"]) {
      await nav.getByRole("link", { name, exact: true }).click();
      await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
      const after = await header.boundingBox();
      expect(after!.x).toBeCloseTo(before!.x, 1);
      expect(after!.y).toBeCloseTo(0, 1);
      expect(after!.width).toBeCloseTo(before!.width, 1);
      expect(after!.height).toBeCloseTo(before!.height, 1);
      await expect(
        nav.getByRole("link", { name, exact: true }),
      ).toHaveAttribute("aria-current", "page");
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    }
  }
});

test("поиск памяток, видимые темы и очистка запроса работают вместе", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/resources");
  await expect(page.getByRole("combobox")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Все темы", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("status")).toContainText("8");
  await page.getByRole("button", { name: "Поддержка", exact: true }).click();
  await expect(page.locator(".catalog-grid .card")).toHaveCount(2);
  await page.getByRole("searchbox", { name: "Поиск памяток" }).fill("в классе");
  await expect(page.locator(".catalog-grid .card")).toHaveCount(1);
  await page
    .getByRole("button", { name: "Очистить поиск", exact: true })
    .click();
  await expect(page.getByRole("searchbox")).toBeFocused();
  await expect(page.locator(".catalog-grid .card")).toHaveCount(2);
  await page.getByRole("searchbox").fill("несуществующее слово");
  await expect(page.getByRole("status")).toContainText("Ничего не найдено");
  await page.getByRole("button", { name: "Сбросить поиск и тему" }).click();
  await expect(page.getByRole("searchbox")).toHaveValue("");
  await expect(
    page.getByRole("button", { name: "Все темы", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".catalog-grid .card")).toHaveCount(8);
  await page.getByRole("button", { name: "Чувства", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("button", { name: "Чувства", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".catalog-grid .card")).toHaveCount(1);
});
