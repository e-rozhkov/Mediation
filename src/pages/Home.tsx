import { MediationContent } from "../components/MediationContent";
import { Link } from "react-router-dom";
import { ContentImage } from "../components/ContentImage";
export function Home() {
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
            <Link className="button" to="/practice">
              Попробовать игру →
            </Link>
          </div>
          <p className="small">В своём темпе, самостоятельно или вместе</p>
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
      <section
        className="home-mediation"
        aria-labelledby="home-mediation-title"
      >
        <p className="eyebrow">Понимаем друг друга</p>
        <h2 id="home-mediation-title">О медиации</h2>
        <MediationContent home />
      </section>
      <section className="learning-start">
        <p className="eyebrow">Вместе проще</p>
        <h2>С чего начнём?</h2>
        <p>
          Выберите урок, учебную ситуацию или памятку. Все материалы открыты
          каждому.
        </p>
      </section>
      <section className="cards">
        <Link className="card" to="/learn/kto-pomogaet">
          <span className="icon">☀</span>
          <p className="eyebrow">Обучение</p>
          <h3>Учимся договариваться</h3>
          <p>
            Урок 1. Замечаем конфликт: факты, чувства и то, что важно каждому.
          </p>
          <span>Открыть урок →</span>
        </Link>
        <Link className="card" to="/practice">
          <span className="icon green-icon">♧</span>
          <p className="eyebrow">Попробовать</p>
          <h3>А как поступишь ты?</h3>
          <p>Знакомая история, твои решения и время подумать.</p>
          <span>Выбрать ситуацию →</span>
        </Link>
        <Link className="card" to="/resources">
          <span className="icon peach-icon">▤</span>
          <p className="eyebrow">Взять с собой</p>
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
