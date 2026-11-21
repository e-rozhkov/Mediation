import { MediationContent, HelpContent } from "../components/MediationContent";
import { useState } from "react";
import { Link } from "react-router-dom";
import { lessons, modules, scenarios, quizProgressKey } from "../lib/content";
import { load, resetProgress, storageWarning } from "../lib/progress";
import { ContentImage } from "../components/ContentImage";
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
  return (
    <section>
      <h1>Учимся договариваться</h1>
      <p className="lead">
        Уроки для детей и взрослых: слушаем, понимаем желания и ищем общий план.
        Без таймера и оценок.
      </p>
      <div className="catalog-grid">
        {[...lessons]
          .sort((a, b) => a.order - b.order)
          .map((lesson) => (
            <Link className="card" key={lesson.id} to={`/learn/${lesson.slug}`}>
              <ContentImage image={lesson.image} retry={false} />
              <h2>{lesson.title}</h2>
              <p>{lesson.intro}</p>
              <span>
                {progress.lessons[lesson.slug] === lesson.version
                  ? "✓ Пройден · Повторить →"
                  : "Начать урок →"}
              </span>
            </Link>
          ))}
      </div>
      {modules.map((m) => (
        <section className="module-section" key={m.id}>
          <h2>{m.title}</h2>
          <p>{m.intro}</p>
          <Link className="button primary" to={`/learn/module/${m.slug}`}>
            Начать самопроверку →
          </Link>
          {progress.quizzes[quizProgressKey(m)] !== undefined && (
            <p className="badge">Проверка пройдена</p>
          )}
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
  return (
    <section>
      <h1>А как поступишь ты?</h1>
      <p className="lead">
        Пять историй о знакомых разногласиях. Выбирай реплики и узнавай, что
        может произойти дальше.
      </p>
      <div className="catalog-grid">
        {scenarios.map((s) => (
          <Link className="card" key={s.id} to={`/practice/${s.slug}`}>
            <ContentImage image={s.image} retry={false} />
            <h2>{s.title}</h2>
            <p>{s.intro}</p>
            <p>{s.skill}</p>
            <span>Начать историю →</span>
          </Link>
        ))}
      </div>
      <p className="small">
        Все истории доступны каждому. Можно пройти их самостоятельно или
        обсудить вместе.
      </p>
    </section>
  );
}
export function Mediation() {
  return (
    <article className="reading mediation-page">
      <h1>О медиации</h1>
      <MediationContent />
      <Link className="button primary" to="/learn/kto-pomogaet">
        Перейти к уроку →
      </Link>
    </article>
  );
}
export function Help() {
  return (
    <article className="reading">
      <h1>Как получить помощь</h1>
      <p className="lead">
        Если возникла трудная или небезопасная ситуация, не оставайтесь с ней
        один на один. Обратитесь за поддержкой.
      </p>
      <HelpContent />
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
      <h1>Точка диалога</h1>
      <p className="lead">
        Учебный демонстрационный проект о школьной медиации для всех, кто хочет
        учиться слушать, понимать и договариваться.
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
        Доступны шесть уроков с общей самопроверкой, пять четырёхшаговых кейсов
        и шесть памяток. В проекте используются учебные иллюстрации, в том числе
        изображения из предоставленного документа. Фотографии реальных детей не
        используются. Полный план развития хранится в docs/plan.md.
      </p>
    </article>
  );
}
