import { MediationContent } from "../components/MediationContent";
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
      <p className="eyebrow">Узнать и понять</p>
      <h1>Учимся договариваться</h1>
      <p className="lead">
        Уроки для детей и взрослых: слушаем, понимаем желания и ищем общий план.
        Без таймера и оценок.
      </p>
      {modules.map((m) => (
        <section className="module-section" key={m.id}>
          <p className="eyebrow">Раздел обучения · 2 урока</p>
          <h2>{m.title}</h2>
          <div className="catalog-grid">
            {m.lessons.map((slug) => {
              const lesson = lessons.find((l) => l.slug === slug)!;
              const done = progress.lessons[slug] === lesson.version;
              return (
                <Link className="card" key={slug} to={`/learn/${slug}`}>
                  <ContentImage image={lesson.image} retry={false} />
                  <p className="eyebrow">Короткий урок</p>
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
            {progress.quizzes[quizProgressKey(m)] !== undefined && (
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
  return (
    <section>
      <p className="eyebrow">Попробовать на практике</p>
      <h1>А как поступишь ты?</h1>
      <p className="lead">
        Пять историй о знакомых разногласиях. Выбирай реплики и узнавай, что
        может произойти дальше.
      </p>
      <div className="catalog-grid">
        {scenarios.map((s) => (
          <Link className="card" key={s.id} to={`/practice/${s.slug}`}>
            <ContentImage image={s.image} retry={false} />
            <p className="eyebrow">Учебная ситуация · {s.duration}</p>
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
      <p className="eyebrow">Ты не один</p>
      <h1>Как получить помощь</h1>
      <p className="lead">
        Если возникла трудная или небезопасная ситуация, не оставайтесь с ней
        один на один. Обратитесь за поддержкой.
      </p>
      <ol>
        <li>
          Расскажите, что случилось, человеку, которому доверяете: близкому,
          педагогу, школьному психологу или ответственному специалисту.
        </li>
        <li>
          Скажите, какая помощь нужна сейчас: побыть рядом, остановить опасную
          ситуацию, найти ответственного взрослого.
        </li>
        <li>
          Если вас не услышали, обратитесь к другому человеку или ответственному
          специалисту.
        </li>
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
        Доступны четыре модуля обучения, восемь уроков, пять четырёхшаговых
        кейсов и восемь памяток. В проекте используются учебные иллюстрации, в
        том числе изображения из предоставленного документа. Фотографии реальных
        детей не используются. Полный план развития хранится в docs/plan.md.
      </p>
    </article>
  );
}
