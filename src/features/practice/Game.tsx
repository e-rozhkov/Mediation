import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { scenarios, type Scenario } from "../../lib/content";
import {
  load,
  save,
  validAttempt,
  storageWarning,
  type Attempt,
} from "../../lib/progress";
import { NotFound } from "../../pages/Static";
import { ContentImage } from "../../components/ContentImage";
export function Game() {
  const { slug } = useParams();
  const scenario = scenarios.find((x) => x.slug === slug);
  return scenario ? (
    <GameContent key={scenario.id} scenario={scenario} />
  ) : (
    <NotFound />
  );
}
function GameContent({ scenario }: { scenario: Scenario }) {
  const [initial] = useState(() => load().attempts[scenario.id]);
  const [attempt, setAttempt] = useState<Attempt>(() =>
    validAttempt(initial, scenario)
      ? initial!
      : {
          id: scenario.id,
          version: scenario.version,
          choices: [],
          pending: null,
        },
  );
  const { choices, pending } = attempt;
  const last = choices.at(-1);
  const lastOption = last
    ? scenario.steps
        .find((s) => s.id === last.step)
        ?.options.find((o) => o.id === last.option)
    : null;
  const next = lastOption ? lastOption.next_step_id : scenario.first_step_id;
  const step = scenario.steps.find((s) => s.id === next);
  const option = step?.options.find((o) => o.id === pending);
  function persist(value: Attempt) {
    setAttempt(value);
    const p = load();
    save({ ...p, attempts: { ...p.attempts, [scenario.id]: value } });
  }
  function restart() {
    persist({
      id: scenario.id,
      version: scenario.version,
      choices: [],
      pending: null,
    });
  }
  const isChild = scenario.audience.includes("children");
  return (
    <article className="reading">
      <Link to="/practice">← Все ситуации</Link>
      <p className="eyebrow">
        Практика · {scenario.duration} ·{" "}
        {isChild ? "7-10 лет" : "Для родителей и учителей"}
      </p>
      <h1>{scenario.title}</h1>
      {!isChild && (
        <p className="badge adult-badge">
          Материал для взрослых. Не входит в детский путь.
        </p>
      )}
      <p className="lead">{scenario.intro}</p>
      <p className="small">
        Участники: {scenario.participants.join(" и ")} · {scenario.skill}
      </p>
      <ContentImage image={scenario.image} priority />
      {initial && !validAttempt(initial, scenario) && (
        <p role="status">
          Предыдущая попытка устарела или повреждена. Начинаем новую.
        </p>
      )}
      {step ? (
        <section className="panel">
          <p className="eyebrow">
            Шаг {choices.length + 1} из {scenario.steps.length}
          </p>
          <progress
            value={choices.length}
            max={scenario.steps.length}
            aria-label="Прогресс кейса"
          />
          <p className="story">{step.story}</p>
          <h2>{step.question}</h2>
          <div className="options">
            {step.options.map((o) => (
              <button
                key={o.id}
                disabled={pending !== null}
                aria-pressed={pending === o.id}
                onClick={() => {
                  if (pending !== null) return;
                  persist({ ...attempt, pending: o.id });
                }}
              >
                {o.text}
              </button>
            ))}
          </div>
          {option && (
            <div role="status" className="feedback">
              <strong>{option.consequence}</strong>
              <p>{option.explanation}</p>
            </div>
          )}
          <button
            disabled={!option}
            className="button primary"
            onClick={() => {
              if (!option) return;
              persist({
                ...attempt,
                choices: [...choices, { step: step.id, option: option.id }],
                pending: null,
              });
            }}
          >
            {choices.length === scenario.steps.length - 1
              ? "Посмотреть итог"
              : "Далее →"}
          </button>
        </section>
      ) : (
        <section className="panel">
          <p className="eyebrow">Разговор завершён</p>
          <h2>Теперь есть с чего начать</h2>
          <p>{scenario.takeaway}</p>
          <details>
            <summary>Посмотреть свои решения</summary>
            <ol>
              {choices.map((c) => {
                const s = scenario.steps.find((x) => x.id === c.step)!;
                const o = s.options.find((x) => x.id === c.option)!;
                return (
                  <li key={c.step}>
                    <strong>{o.text}</strong>
                    <p>
                      {o.consequence} {o.explanation}
                    </p>
                  </li>
                );
              })}
            </ol>
          </details>
          <Link
            className="button primary"
            to={`/resources/${scenario.resource}`}
          >
            Взять памятку →
          </Link>
        </section>
      )}
      <details className="adult-note">
        <summary>Пояснение для взрослых</summary>
        <p>{scenario.adult_note}</p>
      </details>
      <div className="actions">
        <button className="button" onClick={restart}>
          Начать заново
        </button>
        <Link to="/practice">Выйти к ситуациям</Link>
      </div>
      <p className="small">
        Это вымышленная история. В жизни ответ другого человека может быть иным.
      </p>
      {storageWarning && <p role="status">{storageWarning}</p>}
    </article>
  );
}
