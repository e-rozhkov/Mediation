import type { ContentBlock } from "../lib/schemas";
export function ContentBlocks({
  blocks,
  headingLevel = 3,
}: {
  blocks: ContentBlock[];
  headingLevel?: 2 | 3 | 4;
}) {
  const Heading = `h${headingLevel}` as "h2" | "h3" | "h4";
  return (
    <div className="content-blocks">
      {blocks.map((b, i) => {
        if (b.type === "paragraph")
          return (
            <p className="document-paragraph" key={i}>
              {b.text}
            </p>
          );
        if (b.type === "note")
          return (
            <aside className="note" key={i}>
              {b.text}
            </aside>
          );
        if (b.type === "heading") return <Heading key={i}>{b.text}</Heading>;
        if (b.type === "steps")
          return (
            <ol className="document-flow" key={i}>
              {b.items.map((s, j) => (
                <li key={j}>
                  <strong>{s.title}</strong>
                  {s.text && <p>{s.text}</p>}
                </li>
              ))}
            </ol>
          );
        if (b.type === "branches")
          return (
            <section className="document-branches" key={i}>
              <Heading>{b.title}</Heading>
              <div>
                {b.items.map((s, j) => (
                  <section key={j}>
                    <strong>{s.title}</strong>
                    <p>{s.text}</p>
                    <p className="feedback">{s.result}</p>
                  </section>
                ))}
              </div>
            </section>
          );
        if (b.type === "writing")
          return (
            <section className="writing-prompt" key={i}>
              <Heading>{b.label}</Heading>
              {b.prompts.map((p, j) => (
                <div key={j}>
                  {p !== b.label && <span>{p}</span>}
                  <span
                    className="writing-line"
                    aria-label="Место для записи на распечатке"
                  />
                </div>
              ))}
            </section>
          );
        if (b.type === "faq")
          return (
            <div className="faq-list" key={i}>
              {b.items.map((s) => (
                <details className="content-disclosure" key={s.question}>
                  <summary>{s.question}</summary>
                  <p>{s.answer}</p>
                </details>
              ))}
            </div>
          );
        return (
          <div className="table-wrap document-table" key={i}>
            <table role="table" aria-label={b.headers.join(" / ")}>
              <thead role="rowgroup">
                <tr role="row">
                  {b.headers.map((h, j) => (
                    <th key={j} role="columnheader" scope="col">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody role="rowgroup">
                {b.rows.map((row, j) => (
                  <tr role="row" key={j}>
                    {row.map((v, k) =>
                      k === 0 ? (
                        <th key={k} scope="row" role="rowheader">
                          {v}
                        </th>
                      ) : (
                        <td key={k} role="cell" data-label={b.headers[k]}>
                          {/^_+$/.test(v) ? (
                            <span
                              className="writing-line"
                              aria-label="Мой план"
                            />
                          ) : (
                            v
                          )}
                        </td>
                      ),
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}
