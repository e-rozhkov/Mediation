import { Breadcrumbs } from "./Breadcrumbs";
import { useLayoutEffect, useRef } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
export function Layout() {
  const location = useLocation();
  const headerRef = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const measure = () =>
      document.documentElement.style.setProperty(
        "--site-header-height",
        `${header.getBoundingClientRect().height}px`,
      );
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(header);
    return () => observer.disconnect();
  }, []);
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.querySelector<HTMLElement>("main")?.focus({ preventScroll: true });
  }, [location.pathname]);
  return (
    <>
      <a className="skip" href="#main">
        К содержимому
      </a>
      <header ref={headerRef}>
        <Link className="brand" to="/">
          <span className="brand-mark">тд</span>Точка диалога
        </Link>
        <nav aria-label="Основная навигация">
          <NavLink to="/" end>
            Главная
          </NavLink>
          <NavLink to="/mediation">О медиации</NavLink>
          <NavLink to="/learn">Обучение</NavLink>
          <NavLink to="/practice">Практика</NavLink>
          <NavLink to="/resources">Памятки</NavLink>
        </nav>
        <Link className="help-link" to="/help">
          Нужна помощь?
        </Link>
      </header>
      <main id="main" tabIndex={-1}>
        <Breadcrumbs />
        <Outlet />
      </main>
      <footer>
        <Link className="brand" to="/">
          Точка диалога
        </Link>
        <p>Учимся слышать друг друга. Для детей и взрослых.</p>
        <Link to="/about">О проекте</Link>
        <span>Учебная демонстрация · 2026</span>
      </footer>
    </>
  );
}
