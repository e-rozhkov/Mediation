import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { modules } from "../../lib/content";
import { load, save, storageWarning } from "../../lib/progress";
import { NotFound } from "../../pages/Static";
export function ModuleQuiz() {
  const { slug } = useParams();
  const module = modules.find((m) => m.slug === slug);
  return module ? <Quiz key={module.slug} module={module} /> : <NotFound />;
}
function Quiz({ module }: { module: (typeof modules)[number] }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [finished, setFinished] = useState(false);
  const q = module.questions[step];
  const answer = q.choices.find((c) => c.id === answers[q.id]);
  function finish() {
    const correct = module.questions.filter((q) =>
      q.choices.some((c) => c.id === answers[q.id] && c.correct),
    ).length;
    const p = load();
    save({
      ...p,
      quizzes: {
        ...p.quizzes,
        [module.slug]: Math.max(p.quizzes[module.slug] ?? 0, correct),
      },
    });
    setFinished(true);
  }
  return (
    <article className="reading">
      <Link to="/learn">← Все модули</Link>
      <p className="eyebrow">Проверим себя · Без оценок и таймера</p>
      <h1>{module.title}</h1>
      {finished ? (
        <section className="panel">
          <h2>Спасибо за размышления!</h2>
          <p>Вот что мы обсудили. Можно попробовать ещё раз в любое время.</p>
          <ol>
            {module.questions.map((q) => {
              const a = q.choices.find((c) => c.id === answers[q.id])!;
              return (
                <li key={q.id}>
                  <strong>{q.question}</strong>
                  <p>Твой ответ: {a.text}</p>
                  <p>{a.explanation}</p>
                </li>
              );
            })}
          </ol>
          <button
            className="button"
            onClick={() => {
              setFinished(false);
              setStep(0);
              setAnswers({});
            }}
          >
            Попробовать ещё раз
          </button>
          <p>
            <Link to="/practice?audience=children">Перейти к практике →</Link>
          </p>
        </section>
      ) : (
        <section className="panel">
          <p className="eyebrow">Вопрос {step + 1} из 3</p>
          <h2>{q.question}</h2>
          <div className="options">
            {q.choices.map((c) => (
              <button
                key={c.id}
                aria-pressed={answers[q.id] === c.id}
                onClick={() => setAnswers((a) => ({ ...a, [q.id]: c.id }))}
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
          <button
            className="button primary"
            disabled={!answer}
            onClick={() => (step === 2 ? finish() : setStep((x) => x + 1))}
          >
            {step === 2 ? "Завершить проверку" : "Следующий вопрос →"}
          </button>
        </section>
      )}
      {storageWarning && <p role="status">{storageWarning}</p>}
    </article>
  );
}
