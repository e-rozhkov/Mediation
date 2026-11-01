import { Link, useLocation } from "react-router-dom";
import { lessons, modules, scenarios, resources } from "../lib/content";
export function Breadcrumbs() {
  const { pathname } = useLocation();
  if (pathname === "/") return null;
  const parts = pathname.split("/").filter(Boolean);
  const labels: Record<string, string> = {
    mediation: "О медиации",
    learn: "Обучение",
    practice: "Практика",
    resources: "Памятки",
    help: "Как получить помощь",
    about: "О проекте",
  };
  const material =
    parts[0] === "learn"
      ? parts[1] === "module"
        ? modules.find((x) => x.slug === parts[2])
        : lessons.find((x) => x.slug === parts[1])
      : parts[0] === "practice"
        ? scenarios.find((x) => x.slug === parts[1])
        : parts[0] === "resources"
          ? resources.find((x) => x.slug === parts[1])
          : undefined;
  const parent = labels[parts[0]];
  const current =
    parts.length === 1 && parent
      ? parent
      : (material?.title ?? "Страница не найдена");
  return (
    <nav className="breadcrumbs no-print" aria-label="Хлебные крошки">
      <ol>
        <li>
          <Link to="/">Главная</Link>
        </li>
        {parts.length > 1 && parent && (
          <li>
            <Link to={`/${parts[0]}`}>{parent}</Link>
          </li>
        )}
        <li aria-current="page">{current}</li>
      </ol>
    </nav>
  );
}
