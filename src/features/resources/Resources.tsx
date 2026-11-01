import { PdfDownload } from "../../components/PdfDownload";
import { useState, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { resources } from "../../lib/content";
import { NotFound } from "../../pages/Static";
import { ContentImage } from "../../components/ContentImage";
export function Resources() {
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const [topic, setTopic] = useState("all");
  const visible = resources.filter(
    (r) =>
      (r.title + " " + r.blocks.join(" ") + " " + r.topic)
        .toLowerCase()
        .includes(query.trim().toLowerCase()) &&
      (topic === "all" || topic === r.topic),
  );
  return (
    <section>
      <p className="eyebrow">Взять с собой</p>
      <h1>Памятки для разговора</h1>
      <p className="lead">
        Восемь коротких памяток. Читайте, скачивайте или печатайте на A4.
      </p>
      <section className="resource-tools" aria-label="Поиск и темы памяток">
        <div className="resource-search-group">
          <label htmlFor="resource-search">Поиск памяток</label>
          <div className="resource-search">
            <svg
              aria-hidden="true"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <circle cx="10.5" cy="10.5" r="6.5" />
              <path d="m16 16 4 4" />
            </svg>
            <input
              ref={searchRef}
              id="resource-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Введите слово"
            />
            {query && (
              <button
                className="search-clear"
                aria-label="Очистить поиск"
                onClick={() => {
                  setQuery("");
                  searchRef.current?.focus({ preventScroll: true });
                }}
              >
                Очистить
              </button>
            )}
          </div>
        </div>
        <fieldset className="resource-topics">
          <legend>Тема</legend>
          <div className="topic-options">
            <button
              aria-pressed={topic === "all"}
              onClick={() => setTopic("all")}
            >
              Все темы
            </button>
            {[...new Set(resources.map((r) => r.topic))].map((t) => (
              <button
                key={t}
                aria-pressed={topic === t}
                onClick={() => setTopic(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </fieldset>
      </section>
      <p className="resource-count" role="status">
        {visible.length
          ? `Найдено памяток: ${visible.length}`
          : "Ничего не найдено. Попробуйте другой запрос или тему."}
      </p>
      {visible.length ? (
        <div className="catalog-grid">
          {visible.map((r) => (
            <Link className="card" key={r.id} to={`/resources/${r.slug}`}>
              <ContentImage image={r.image} retry={false} />
              <p className="eyebrow">Памятка · A4</p>
              <h2>{r.title}</h2>
              <p>{r.intro}</p>
              <span>Читать и печатать →</span>
            </Link>
          ))}
        </div>
      ) : (
        <button
          className="button"
          onClick={() => {
            setQuery("");
            setTopic("all");
            searchRef.current?.focus({ preventScroll: true });
          }}
        >
          Сбросить поиск и тему
        </button>
      )}
    </section>
  );
}
export function Resource() {
  const { slug } = useParams();
  const resource = resources.find((r) => r.slug === slug);
  if (!resource) return <NotFound />;
  const child = resource.audience.includes("children");
  return (
    <article key={resource.id} className="reading printable">
      <div className="no-print">
        <Link to="/resources">← Памятки</Link>
      </div>
      <p className="eyebrow">Точка диалога · Памятка</p>
      <h1>{resource.title}</h1>
      <p className="lead">{resource.intro}</p>
      <div className="no-print">
        <ContentImage
          key={resource.image.src}
          image={resource.image}
          priority
        />
      </div>
      <ol className="resource-steps">
        {resource.blocks.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ol>
      <section className="example">
        <h2>Можно сказать так</h2>
        <p>«{resource.example}»</p>
      </section>
      <section className="checklist">
        <h2>Проверим себя</h2>
        {resource.checklist.map((item) => (
          <label key={item}>
            <input type="checkbox" />
            {item}
          </label>
        ))}
      </section>
      <aside className="note">
        {child
          ? "Если есть угрозы, насилие или травля, обратись к ответственному взрослому. Не нужно справляться одному."
          : "При угрозах, насилии и травле сначала обеспечьте защиту ребёнка. Медиация не заменяет меры безопасности."}
      </aside>
      <div className="actions no-print">
        <button className="button primary" onClick={() => window.print()}>
          Распечатать памятку
        </button>
        <PdfDownload key={resource.pdf} path={resource.pdf} />
      </div>
      <p className="small">
        Учебный материал для самостоятельного или совместного разбора.
      </p>
    </article>
  );
}
