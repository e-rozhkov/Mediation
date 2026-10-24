import { useState } from "react";
import { Link } from "react-router-dom";
import { lessons, modules, scenarios, audienceLabels } from "../lib/content";
import { load, resetProgress, storageWarning } from "../lib/progress";
import { ContentImage } from "../components/ContentImage";
import { AudienceFilter, useAudience } from "../components/AudienceFilter";
export function NotFound() {
  return (
    <section className="reading">
      <p className="eyebrow">404</p>
      <h1>Этой страницы нет</h1>
      <p>Возможно, адрес изменился. Вернёмся к началу?</p>
      <Link className="button primary" to="/">
        На главную
      </Link>
    </section>
  );
}
export function Learn() {
  const [confirm, setConfirm] = useState(false);
  const [progress, setProgress] = useState(load);
  const { audience, setAudience } = useAudience();
  return (
    <section>
      <p className="eyebrow">Узнать и понять</p>
      <h1>Маленькие шаги к диалогу</h1>
      <p className="lead">
        Четыре модуля: слушаем, понимаем желания и ищем общий план. Без таймера
        и оценок.
      </p>
      <div className="filters">
        <AudienceFilter value={audience} onChange={setAudience} />
      </div>
      {audience === "parents" && (
        <aside className="note">
          Читайте вместе с ребёнком. Дайте время на размышление, обсуждайте
          чувства героев без оценок и принуждения к «правильной» реплике.
        </aside>
      )}
      {audience === "teachers" && (
        <aside className="note">
          Используйте вымышленные истории для обсуждения, без публичного разбора
          реальных ссор. Участие добровольное; пояснения для взрослых есть в
          каждом уроке.
        </aside>
      )}
      {modules
        .filter((m) => audience === "all" || m.audience.includes(audience))
        .map((m) => (
          <section className="module-section" key={m.id}>
            <p className="eyebrow">Модуль {m.order} · 2 урока</p>
            <h2>{m.title}</h2>
            <div className="catalog-grid">
              {m.lessons.map((slug) => {
                const lesson = lessons.find((l) => l.slug === slug)!;
                const done = progress.lessons[slug] === lesson.version;
                return (
                  <Link className="card" key={slug} to={`/learn/${slug}`}>
                    <ContentImage image={lesson.image} retry={false} />
                    <p className="eyebrow">Урок {lesson.order} · 7-10 лет</p>
                    <h3>{lesson.title}</h3>
                    <p>{lesson.intro}</p>
                    <span>
                      {done ? "✓ Пройден · Повторить →" : "Начать урок →"}
                    </span>
                  </Link>
                );
              })}
            </div>
            <p>
              <Link className="button" to={`/learn/module/${m.slug}`}>
                Три вопроса по модулю →
              </Link>
              {progress.quizzes[m.slug] !== undefined && (
                <span className="badge">Проверка пройдена</span>
              )}
            </p>
          </section>
        ))}
      <aside className="note">
        <p>
          Прогресс хранится только в этом браузере. На общем компьютере его
          могут увидеть другие. Очистка данных сайта удалит результаты.
        </p>
        {confirm ? (
          <>
            <p>Удалить все результаты уроков, вопросов и кейсов?</p>
            <button
              className="button"
              onClick={() => {
                setProgress(resetProgress());
                setConfirm(false);
              }}
            >
              Да, удалить прогресс
            </button>
            <button className="button" onClick={() => setConfirm(false)}>
              Отмена
            </button>
          </>
        ) : (
          <button className="button" onClick={() => setConfirm(true)}>
            Сбросить мой прогресс
          </button>
        )}
      </aside>
      {storageWarning && <p role="status">{storageWarning}</p>}
    </section>
  );
}
export function Practice() {
  const { audience, setAudience } = useAudience();
  const visible = scenarios.filter(
    (s) => audience === "all" || s.audience.includes(audience),
  );
  return (
    <section>
      <p className="eyebrow">Попробовать на практике</p>
      <h1>А как поступишь ты?</h1>
      <p className="lead">
        Пять историй о знакомых разногласиях. Выбирай реплики и узнавай, что
        может произойти дальше.
      </p>
      <div className="filters">
        <AudienceFilter value={audience} onChange={setAudience} />
      </div>
      <div className="catalog-grid">
        {visible.map((s) => (
          <Link className="card" key={s.id} to={`/practice/${s.slug}`}>
            <ContentImage image={s.image} retry={false} />
            <p className="eyebrow">
              {s.audience.includes("children")
                ? "Детям 7-10 лет"
                : "Только для взрослых"}{" "}
              · {s.duration}
            </p>
            <h2>{s.title}</h2>
            <p>{s.intro}</p>
            <p>{s.skill}</p>
            <span>Начать историю →</span>
          </Link>
        ))}
      </div>
      <p className="small">
        Детские истории можно пройти вместе со взрослым. Кейс «Разные ожидания»
        предназначен только для родителей и учителей.
      </p>
    </section>
  );
}
export function Mediation() {
  return (
    <article className="reading">
      <p className="eyebrow">О медиации</p>
      <h1>Когда рядом есть тот, кто слушает</h1>
      <p className="lead">
        Медиация помогает людям услышать друг друга через разговор с помощником.
      </p>
      <ContentImage
        image={{
          src: "/images/classroom.webp",
          alt: "Учитель спокойно помогает ученице разобраться с заданием.",
        }}
        priority
      />
      <div className="panel">
        <h2>Посредник помогает разговору</h2>
        <p>
          Он даёт каждому время высказаться, задаёт вопросы и помогает обсудить
          варианты. Он не назначает виноватого. Решение выбирают участники.
        </p>
        <p>Разговор добровольный. Можно попросить паузу или отказаться.</p>
      </div>
      <aside className="note">
        <h2>Безопасность прежде всего</h2>
        <p>
          Угрозы, насилие и травля требуют помощи ответственного взрослого и мер
          защиты. Ребёнку не нужно самостоятельно примирять участников опасной
          ситуации.
        </p>
      </aside>
      <Link className="button primary" to="/learn/kto-pomogaet">
        Перейти к уроку →
      </Link>
    </article>
  );
}
export function Help() {
  return (
    <article className="reading">
      <p className="eyebrow">Ты не один</p>
      <h1>Как получить помощь</h1>
      <p className="lead">
        Если тебе страшно, больно или угрожают, обратись к взрослому, которому
        доверяешь.
      </p>
      <ol>
        <li>
          Расскажи родителю, учителю или школьному психологу, что случилось.
        </li>
        <li>
          Скажи, какая помощь нужна сейчас: побыть рядом, остановить опасную
          ситуацию, найти ответственного взрослого.
        </li>
        <li>Если тебя не услышали, обратись к другому взрослому.</li>
      </ol>
      <aside className="note">
        <strong>Это демонстрационный учебный сайт.</strong>
        <p>
          Он не принимает обращения. Контакты конкретной школьной службы пока не
          согласованы. Для реального использования их необходимо добавить после
          проверки школой.
        </p>
      </aside>
    </article>
  );
}
export function About() {
  return (
    <article className="reading">
      <p className="eyebrow">О проекте</p>
      <h1>Точка диалога</h1>
      <p className="lead">
        Учебный демонстрационный проект о школьной медиации для детей 7-10 лет,
        родителей и учителей.
      </p>
      <p>
        В проекте используются оригинальные учебные тексты и сценарии. Они
        требуют проверки педагогом перед использованием в реальном обучении.
        Поведение персонажей не гарантирует такую же реакцию в жизни.
      </p>
      <p>
        Мы не собираем имена, даты рождения или обращения. Регистрации и
        переписки нет. Прогресс остаётся в браузере; аналитика и ИИ API не
        подключены.
      </p>
      <h2>Ориентиры проекта</h2>
      <p>
        Публичные материалы <a href="https://remedyproject.eu/">REMEDY</a> и
        описание формата учебных ситуаций{" "}
        <a href="https://questly.academy/quests/online-conflict">Questly</a>{" "}
        использованы как ориентиры. Их тексты, изображения и логотипы не
        копируются.
      </p>
      <p>
        Доступны четыре модуля обучения, восемь уроков, пять четырёхшаговых
        кейсов и восемь памяток. Иллюстрации созданы для проекта с помощью
        генерации изображений; фотографии реальных детей не используются. Полный
        план развития хранится в docs/plan.md.
      </p>
    </article>
  );
}
