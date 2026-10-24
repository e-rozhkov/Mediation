import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { lessons, modules } from "../../lib/content";
import { load, save, storageWarning } from "../../lib/progress";
import { NotFound } from "../../pages/Static";
import { ContentImage } from "../../components/ContentImage";
export function Lesson() {
  const { slug } = useParams();
  const lesson = lessons.find((l) => l.slug === slug);
  return lesson ? (
    <LessonContent key={lesson.slug} lesson={lesson} />
  ) : (
    <NotFound />
  );
}
function LessonContent({ lesson }: { lesson: (typeof lessons)[number] }) {
  const [screen, setScreen] = useState(0);
  const [choice, setChoice] = useState("");
  const [done, setDone] = useState(
    () => load().lessons[lesson.slug] === lesson.version,
  );
  const answer = lesson.choices.find((c) => c.id === choice);
  const module = modules.find((m) => m.slug === lesson.module)!;
  const next = module.lessons[module.lessons.indexOf(lesson.slug) + 1];
  const isQuestion = screen === lesson.blocks.length;
  return (
    <article className="reading">
      <Link to="/learn">← Обучение</Link>
      <p className="eyebrow">
        Модуль {module.order} · Урок {lesson.order} · 7-10 лет
      </p>
      <h1>{lesson.title}</h1>
      <p className="lead">{lesson.intro}</p>
      <p className="badge">Можно пройти вместе со взрослым</p>
      <ContentImage image={lesson.image} priority />
      <section className="panel" aria-label="Урок">
        <p className="eyebrow">
          {isQuestion
            ? "Проверим себя"
            : `Мысль ${screen + 1} из ${lesson.blocks.length}`}
        </p>
        {!isQuestion ? (
          <>
            <p className="story">{lesson.blocks[screen]}</p>
            <div className="actions">
              <button
                disabled={screen === 0}
                className="button"
                onClick={() => setScreen((x) => x - 1)}
              >
                Назад
              </button>
              <button
                className="button primary"
                onClick={() => setScreen((x) => x + 1)}
              >
                {screen === lesson.blocks.length - 1
                  ? "К вопросу →"
                  : "Далее →"}
              </button>
            </div>
          </>
        ) : (
          <>
            <h2>{lesson.question}</h2>
            <div className="options">
              {lesson.choices.map((c) => (
                <button
                  aria-pressed={choice === c.id}
                  key={c.id}
                  onClick={() => setChoice(c.id)}
                >
                  {c.text}
                </button>
              ))}
            </div>
            {answer && (
              <p role="status" className="feedback">
                {answer.explanation}
              </p>
            )}
            {answer?.correct && (
              <button
                className="button primary"
                onClick={() => {
                  const p = load();
                  save({
                    ...p,
                    lessons: { ...p.lessons, [lesson.slug]: lesson.version },
                  });
                  setDone(true);
                }}
              >
                Завершить урок
              </button>
            )}
            <p>
              <button className="text-button" onClick={() => setScreen(0)}>
                Прочитать ещё раз
              </button>
            </p>
          </>
        )}
        {done && (
          <div className="feedback">
            <p>✓ Урок пройден.</p>
            <div className="actions">
              {next ? (
                <Link className="button primary" to={`/learn/${next}`}>
                  Следующий урок →
                </Link>
              ) : (
                <Link
                  className="button primary"
                  to={`/learn/module/${module.slug}`}
                >
                  Три вопроса по модулю →
                </Link>
              )}
              <Link to={`/practice/${lesson.scenario}`}>
                Перейти к практике →
              </Link>
            </div>
          </div>
        )}
      </section>
      <details className="adult-note">
        <summary>Для родителей и учителей</summary>
        <p>{lesson.adult_note}</p>
      </details>
      {storageWarning && <p role="status">{storageWarning}</p>}
    </article>
  );
}
