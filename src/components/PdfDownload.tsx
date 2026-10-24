import { useState } from "react";
export function PdfDownload({ path }: { path: string }) {
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  async function download() {
    setState("loading");
    try {
      const response = await fetch(path);
      if (!response.ok) throw Error();
      const bytes = await response.arrayBuffer();
      if (new TextDecoder().decode(bytes.slice(0, 5)) !== "%PDF-")
        throw Error();
      const url = URL.createObjectURL(
        new Blob([bytes], { type: "application/pdf" }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = path.split("/").at(-1)!;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setState("idle");
    } catch {
      setState("error");
    }
  }
  return (
    <div>
      <button
        className="button"
        onClick={download}
        disabled={state === "loading"}
      >
        {state === "loading"
          ? "Готовим PDF…"
          : state === "error"
            ? "Повторить скачивание PDF"
            : "Скачать PDF"}
      </button>
      {state === "error" && (
        <p role="status">
          Не удалось скачать PDF. Проверьте соединение и попробуйте снова.
        </p>
      )}
    </div>
  );
}
