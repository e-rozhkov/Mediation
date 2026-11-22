import { test, expect } from "@playwright/test";
import { createServer, type Server } from "node:http";
import { readFile, stat, readdir } from "node:fs/promises";
import { resolve, extname } from "node:path";
import { lessonAliases, moduleAliases, resourceAliases } from "../src/lib/aliases";

let server: Server;
let origin: string;
const root = resolve("dist");

test.beforeAll(async () => {
  // Deliberately serve real files only: Vite's SPA fallback would hide this bug.
  server = createServer(async (req, res) => {
    try {
      const path = decodeURIComponent(new URL(req.url!, "http://localhost").pathname);
      let file = resolve(root, `.${path}`);
      if (!file.startsWith(`${root}/`) && file !== root) throw new Error("Invalid path");
      if ((await stat(file)).isDirectory()) file = resolve(file, "index.html");
      const body = await readFile(file);
      const types: Record<string, string> = {
        ".html": "text/html; charset=utf-8", ".js": "text/javascript",
        ".css": "text/css", ".webp": "image/webp", ".png": "image/png",
        ".woff2": "font/woff2", ".pdf": "application/pdf",
      };
      res.writeHead(200, { "Content-Type": types[extname(file)] || "application/octet-stream" });
      res.end(body);
    } catch {
      res.writeHead(404); res.end("File not found");
    }
  });
  await new Promise<void>((done) => server.listen(0, "127.0.0.1", done));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Server did not start");
  origin = `http://127.0.0.1:${address.port}`;
});
test.afterAll(async () => {
  await new Promise<void>((done, reject) => server.close((err) => err ? reject(err) : done()));
});

test("все адреса доступны на статическом хостинге без SPA fallback", async ({ request }) => {
  const routes = ["about", "help", "mediation", "learn", "practice", "resources"];
  for (const [folder, prefix] of [["lessons", "learn"], ["modules", "learn/module"], ["scenarios", "practice"], ["resources", "resources"]]) {
    for (const file of await readdir(`src/content/${folder}`)) {
      if (!file.endsWith(".json")) continue;
      const data = JSON.parse(await readFile(`src/content/${folder}/${file}`, "utf8"));
      routes.push(`${prefix}/${data.slug}`);
    }
  }
  for (const [aliases, prefix] of [[lessonAliases, "learn"], [moduleAliases, "learn/module"], [resourceAliases, "resources"]] as const)
    for (const slug of Object.keys(aliases)) routes.push(`${prefix}/${slug}`);
  const index = await readFile("dist/index.html", "utf8");
  for (const route of routes) {
    for (const suffix of ["", "/", ".html"]) {
      const response = await request.get(`${origin}/${route}${suffix}`);
      expect(response.status(), `${route}${suffix}`).toBe(200);
      expect(await response.text()).toBe(index);
    }
  }
  expect((await request.get(`${origin}/pdf/missing.pdf`)).status()).toBe(404);
  expect((await request.get(`${origin}/unknown-page`)).status()).toBe(404);
});

test("О проекте и вложенные страницы открываются и обновляются без серверных правил", async ({ page }) => {
  for (const path of ["/about", "/mediation", "/learn", "/learn/kto-pomogaet", "/learn/module/kto-pomogaet-module", "/practice/obshee-zadanie", "/resources/kak-dogovoritsya", "/resources/slushat"]) {
    const response = await page.goto(origin + path);
    expect(response?.status()).toBe(200);
    await expect(page.locator("main h1")).toBeVisible();
    const heading = await page.locator("main h1").textContent();
    expect(heading).not.toMatch(/не найден/i);
    await page.reload();
    await expect(page.locator("main h1")).toHaveText(heading!);
    expect(new URL(page.url()).pathname).toBe(path);
    if (path === "/about") {
      await expect(page.getByText(/Рожкова Валерия Сергеевна/)).toBeVisible();
      await expect(page.getByText(/Группа НМ-2531з/)).toBeVisible();
    }
  }
});
