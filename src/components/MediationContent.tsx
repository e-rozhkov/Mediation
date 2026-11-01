import { mediationPage as content } from "../lib/content";
import { ContentImage } from "./ContentImage";
export function MediationContent({ home = false }: { home?: boolean }) {
  const Heading = home ? "h3" : "h2";
  return (
    <div className="mediation-content">
      <p className="lead">{content.intro}</p>
      <ContentImage image={content.image} />
      <section>
        <Heading>Зачем она нужна в школе</Heading>
        <p>{content.school}</p>
        <div className="table-wrap">
          <table
            role="table"
            aria-label="Что можно обсудить в школьной медиации"
          >
            <thead role="rowgroup">
              <tr role="row">
                <th scope="col" role="columnheader">
                  Кому
                </th>
                <th scope="col" role="columnheader">
                  Что можно обсудить
                </th>
              </tr>
            </thead>
            <tbody role="rowgroup">
              {content.audiences.map((row) => (
                <tr role="row" key={row.name}>
                  <th scope="row" role="rowheader">
                    {row.name}
                  </th>
                  <td role="cell">{row.text}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <details className="content-disclosure" open={!home}>
        <summary>Кто за что отвечает</summary>
        <div className="role-grid">
          {content.roles.map((role) => (
            <section className="panel" key={role.name}>
              <Heading>{role.name}</Heading>
              <p>{role.text}</p>
            </section>
          ))}
        </div>
      </details>
      <details className="content-disclosure" open={!home}>
        <summary>Принципы и границы медиации</summary>
        <p>{content.principles_intro}</p>
        <dl className="principles">
          {content.principles.map((p) => (
            <div key={p.name}>
              <dt>{p.name}</dt>
              <dd>{p.text}</dd>
            </div>
          ))}
        </dl>
        <aside className="note">
          <Heading>О чём нельзя обещать молчать</Heading>
          <p>{content.boundaries}</p>
        </aside>
      </details>
      <details className="content-disclosure">
        <summary>Восстановительная медиация</summary>
        {content.restorative.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </details>
      <details className="content-disclosure" open={!home}>
        <summary>Как проходит встреча</summary>
        <ol className="meeting-flow" aria-label="Общий ход встречи">
          {content.flow.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
        <ol className="meeting-steps">
          {content.steps.map((s) => (
            <li key={s.title}>
              <Heading>{s.title}</Heading>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
        <p className="note">{content.ending}</p>
      </details>
    </div>
  );
}
