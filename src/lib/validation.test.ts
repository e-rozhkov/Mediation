import { it, expect } from "vitest";
import {
  cpSync,
  mkdtempSync,
  readFileSync,
  writeFileSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
function validate(change: (root: string) => void) {
  const root = mkdtempSync(join(tmpdir(), "dialogue-content-"));
  try {
    cpSync("src/content", join(root, "src/content"), { recursive: true });
    cpSync("public", join(root, "public"), { recursive: true });
    change(root);
    return spawnSync(
      process.execPath,
      [
        resolve("node_modules/tsx/dist/cli.mjs"),
        resolve("scripts/validate-content.ts"),
      ],
      { cwd: root, encoding: "utf8" },
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}
function edit(root: string, file: string, change: (value: any) => void) {
  const path = join(root, "src/content", file);
  const data = JSON.parse(readFileSync(path, "utf8"));
  change(data);
  writeFileSync(path, JSON.stringify(data));
}
it("валидация отклоняет отсутствующую иллюстрацию с именем файла", () => {
  const r = validate((root) =>
    edit(
      root,
      "lessons/kto-pomogaet.json",
      (d) => (d.image.src = "/images/missing.webp"),
    ),
  );
  expect(r.status).not.toBe(0);
  expect(r.stderr).toContain("kto-pomogaet.json");
  expect(r.stderr).toContain("missing.webp");
});
it("валидация отклоняет дублирующийся id материала", () => {
  const r = validate((root) =>
    edit(root, "lessons/pravila-razgovora.json", (d) => (d.id = "lesson-help")),
  );
  expect(r.status).not.toBe(0);
  expect(r.stderr).toContain("повторяющийся идентификатор");
});
it("валидация отклоняет ошибочную связь урока и модуля", () => {
  const r = validate((root) =>
    edit(
      root,
      "lessons/kto-pomogaet.json",
      (d) => (d.module = "slushat-i-govorit"),
    ),
  );
  expect(r.status).not.toBe(0);
  expect(r.stderr).toContain("урок не включён");
});
it("валидация отклоняет отсутствующий PDF", () => {
  const r = validate((root) =>
    edit(root, "resources/pauza.json", (d) => (d.pdf = "/pdf/missing.pdf")),
  );
  expect(r.status).not.toBe(0);
  expect(r.stderr).toContain("pauza.json");
  expect(r.stderr).toContain("missing.pdf");
});
