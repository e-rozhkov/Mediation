import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { lessonAliases, moduleAliases, resourceAliases } from "../src/lib/aliases";

// Some static hosts ignore Netlify's _redirects. Give every public route an
// actual entry file, keeping BrowserRouter URLs and the same application bundle.
const root = resolve(import.meta.dirname, "..");
const output = resolve(root, "dist");
const html = await readFile(resolve(output, "index.html"), "utf8");
const routes = new Set(["about", "help", "mediation", "learn", "practice", "resources"]);
for (const [folder, prefix] of [
  ["lessons", "learn"],
  ["modules", "learn/module"],
  ["scenarios", "practice"],
  ["resources", "resources"],
]) {
  const directory = resolve(root, "src/content", folder);
  for (const file of await readdir(directory)) {
    if (!file.endsWith(".json")) continue;
    const { slug } = JSON.parse(await readFile(resolve(directory, file), "utf8"));
    if (!/^[a-z0-9-]+$/.test(slug)) throw new Error(`Invalid route slug: ${slug}`);
    routes.add(`${prefix}/${slug}`);
  }
}
for (const [aliases, prefix] of [
  [lessonAliases, "learn"],
  [moduleAliases, "learn/module"],
  [resourceAliases, "resources"],
] as const) {
  for (const slug of Object.keys(aliases)) routes.add(`${prefix}/${slug}`);
}
for (const route of routes) {
  const directory = resolve(output, route);
  await mkdir(directory, { recursive: true });
  await writeFile(resolve(directory, "index.html"), html);
  // Support hosts which resolve clean URLs to a sibling .html file instead.
  await writeFile(resolve(output, `${route}.html`), html);
}
console.log(`Static entry pages generated for ${routes.size} routes.`);
