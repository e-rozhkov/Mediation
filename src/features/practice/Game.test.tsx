import React from "react";
import { it, expect } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { Game } from "./Game";
it("показывает последствие и позволяет сменить выбор до следующего шага", () => {
  localStorage.clear();
  render(
    <MemoryRouter initialEntries={["/practice/obshee-zadanie"]}>
      <Routes>
        <Route path="/practice/:slug" element={<Game />} />
      </Routes>
    </MemoryRouter>,
  );
  const next = screen.getByRole("button", {
    name: "Далее →",
  }) as HTMLButtonElement;
  expect(next.disabled).toBe(true);
  fireEvent.click(
    screen.getByRole("button", { name: "Я нарисую, а ты вырежешь буквы?" }),
  );
  expect(screen.getByRole("status").textContent).toContain("Саша предлагает");
  const alternative = screen.getByRole("button", {
    name: "Ладно, я всё сделаю сама.",
  });
  expect((alternative as HTMLButtonElement).disabled).toBe(false);
  fireEvent.click(alternative);
  expect(alternative.getAttribute("aria-pressed")).toBe("true");
  expect(screen.getByRole("status").textContent).toContain("Маша продолжает одна и устаёт.");
  fireEvent.click(next);
  expect(screen.getByText("Шаг 2 из 4")).toBeTruthy();
  cleanup();
});
