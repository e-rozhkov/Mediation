import { useSearchParams } from "react-router-dom";
import { audienceLabels, type Audience } from "../lib/content";
export function useAudience() {
  const [params, setParams] = useSearchParams();
  const raw = params.get("audience");
  const audience: Audience | "all" =
    raw && Object.hasOwn(audienceLabels, raw) ? (raw as Audience) : "all";
  return {
    audience,
    setAudience: (a: string) => {
      const next = new URLSearchParams(params);
      if (a === "all") next.delete("audience");
      else next.set("audience", a);
      setParams(next, { replace: true });
    },
  };
}
export function AudienceFilter({
  value,
  onChange,
}: {
  value: string;
  onChange: (a: string) => void;
}) {
  return (
    <label>
      Для кого
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="all">Для всех</option>
        {Object.entries(audienceLabels).map(([id, label]) => (
          <option key={id} value={id}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}
