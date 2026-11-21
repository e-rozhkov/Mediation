import { mediationPage as content } from "../lib/content";
import { ContentImage } from "./ContentImage";
import { ContentBlocks } from "./ContentBlocks";
export function MediationContent({ home = false }: { home?: boolean }) {
  return (
    <div className="mediation-content">
      <p className="lead">{content.intro}</p>
      {content.intro_more.map((p) => (
        <p key={p}>{p}</p>
      ))}
      <ContentImage image={content.image} />
      {content.sections.map((s, i) => (
        <details
          key={s.id}
          id={`mediation-${s.id}`}
          className="content-disclosure"
          open={i === 0 || (!home && s.id === "principles")}
        >
          <summary>{s.title}</summary>
          <ContentBlocks blocks={s.blocks} headingLevel={home ? 3 : 2} />
        </details>
      ))}
    </div>
  );
}
export function HelpContent() {
  return (
    <>
      {content.sections
        .filter((s) => ["help", "faq", "bullying"].includes(s.id))
        .map((s) => (
          <section className="help-section" key={s.id}>
            <h2>{s.title}</h2>
            <ContentBlocks blocks={s.blocks} />
          </section>
        ))}
    </>
  );
}
