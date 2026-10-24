import { Link } from "react-router-dom";
import { useState } from "react";
import { ContentImage } from "../components/ContentImage";
export function Home() {
  const [audience, setAudience] = useState("children");
  return (
    <>
      <section className="hero">
        <div>
          <p className="eyebrow">Слушать. Понимать. Договариваться.</p>
          <h1>
            У каждого есть
            <br />
            своя <em>точка зрения.</em>
            <br />
            Найдём общую?
          </h1>
          <p className="lead">
            Учимся говорить о важном, слышать друг друга и вместе находить выход
            из разногласий.
          </p>
          <div className="actions">
            <Link className="button primary" to="/learn/kto-pomogaet">
              Начать учиться <span>→</span>
            </Link>
            <Link className="button" to="/practice?audience=children">
              Попробовать игру →
            </Link>
          </div>
          <p className="small">Для детей 7-10 лет · Можно вместе со взрослым</p>
        </div>
        <div className="hero-illustration">
          <ContentImage
            image={{
              src: "/images/dialogue.webp",
              alt: "Маша и Саша слушают друг друга и вместе делают плакат для класса.",
            }}
            priority
          />
        </div>
      </section>
      <section className="audience">
        <div>
          <p className="eyebrow">Вместе проще</p>
          <h2>С чего начнём?</h2>
        </div>
        <div role="group" aria-label="Для кого материалы" className="tabs">
          {[
            ["children", "Детям"],
            ["parents", "Родителям"],
            ["teachers", "Учителям"],
          ].map(([id, label]) => (
            <button
              key={id}
              aria-pressed={audience === id}
              onClick={() => setAudience(id)}
            >
              {label}
            </button>
          ))}
        </div>
        <p>
          {audience === "children"
            ? "Не всегда легко договориться. Давай попробуем на знакомой школьной истории."
            : audience === "parents"
              ? "Пройдите историю вместе с ребёнком. Спросите, что чувствуют герои, и дайте время на ответ."
              : "Обсудите историю с классом без оценок личности. Каждый может предложить свой вариант и сделать паузу."}
        </p>
      </section>
      <section className="cards">
        <Link className="card" to={`/learn?audience=${audience}`}>
          <span className="icon">☀</span>
          <p className="eyebrow">01 / Узнать</p>
          <h3>Как устроен диалог</h3>
          <p>Кто помогает договориться и почему важно слушать.</p>
          <span>Открыть урок →</span>
        </Link>
        <Link className="card" to={`/practice?audience=${audience}`}>
          <span className="icon green-icon">♧</span>
          <p className="eyebrow">02 / Попробовать</p>
          <h3>А как поступишь ты?</h3>
          <p>Знакомая история, твои решения и время подумать.</p>
          <span>Выбрать ситуацию →</span>
        </Link>
        <Link className="card" to={`/resources?audience=${audience}`}>
          <span className="icon peach-icon">▤</span>
          <p className="eyebrow">03 / Взять с собой</p>
          <h3>Подсказка под рукой</h3>
          <p>Короткая памятка для разговора. Можно распечатать.</p>
          <span>Найти памятку →</span>
        </Link>
      </section>
      <aside className="note">
        <strong>Договариваться можно научиться.</strong>
        <p>
          Ему можно учиться маленькими шагами. Здесь нет таймера, оценок и
          неправильных чувств.
        </p>
        <Link to="/mediation">Что такое медиация →</Link>
      </aside>
    </>
  );
}
