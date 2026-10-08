// Fix a doc, as one island: an address in, the file the page is rendered from
// out. It reads the site's provenance and the forge's comparison only when the
// person asks, from their own browser.
import { useState } from "preact/hooks";
import {
  compareUrl,
  driftOf,
  editUrl,
  locate,
  provenanceUrl,
  renderedUrl,
  sourceOf,
  type Drift,
  type Source,
} from "../lib/fix-a-doc";
import type { fixADocCopy } from "../i18n/assist";

type Copy = typeof fixADocCopy;

type Answer =
  | { kind: "idle" }
  | { kind: "finding" }
  | { kind: "refused"; message: string }
  | { kind: "found"; source: Source; drift: Drift | null };

async function json(url: string): Promise<unknown> {
  const answer = await fetch(url, { headers: { Accept: "application/json" } });
  if (!answer.ok) throw new Error(String(answer.status));
  return answer.json();
}

async function find(address: string, t: Copy): Promise<Answer> {
  const page = locate(address);
  if (!page) return { kind: "refused", message: t.notASite };
  let table: unknown;
  try {
    table = await json(provenanceUrl(page.site));
  } catch {
    return { kind: "refused", message: t.unreadable };
  }
  const source = sourceOf(table, page.route);
  if (!source) return { kind: "refused", message: t.notAPage };
  let drift: Drift | null;
  try {
    drift = driftOf(await json(compareUrl(source)), source);
  } catch {
    drift = null;
  }
  return { kind: "found", source, drift };
}

function said(drift: Drift | null, t: Copy): string {
  if (!drift) return t.notCompared;
  if (drift.behind === 0) return t.current;
  const behind =
    drift.behind === 1
      ? t.behindOne
      : t.behindMany.replace("{n}", String(drift.behind));
  return `${behind}; ${drift.changed ? t.changed : t.unchanged}`;
}

export default function FixADoc({ t }: { t: Copy }) {
  const [address, setAddress] = useState("");
  const [answer, setAnswer] = useState<Answer>({ kind: "idle" });

  return (
    <div class="fad">
      <form
        class="fad__form"
        onSubmit={(e) => {
          e.preventDefault();
          setAnswer({ kind: "finding" });
          void find(address, t).then(setAnswer);
        }}
      >
        <label class="fad__field" for="fad-address">
          <span>{t.label}</span>
          <input
            id="fad-address"
            name="address"
            type="text"
            inputMode="url"
            autoComplete="url"
            spellcheck={false}
            placeholder={t.placeholder}
            required
            value={address}
            onInput={(e) => {
              setAddress(e.currentTarget.value);
            }}
          />
        </label>
        <button class="btn btn--primary" type="submit">
          {t.find}
        </button>
      </form>
      <div class="fad__answer" aria-live="polite">
        {answer.kind === "finding" && <p>{t.finding}</p>}
        {answer.kind === "refused" && (
          <p class="fad__refused">{answer.message}</p>
        )}
        {answer.kind === "found" && (
          <>
            <dl class="fad__source">
              <dt>{t.repository}</dt>
              <dd>
                <a href={answer.source.repository}>
                  {answer.source.owner}/{answer.source.name}
                </a>
              </dd>
              <dt>{t.path}</dt>
              <dd class="mono">{answer.source.path}</dd>
              <dt>{t.revision}</dt>
              <dd>
                <a class="mono" href={renderedUrl(answer.source)}>
                  {answer.source.revision.slice(0, 7)}
                </a>
                , {said(answer.drift, t)}
              </dd>
            </dl>
            <a class="btn btn--primary" href={editUrl(answer.source)}>
              {t.edit}
            </a>
          </>
        )}
      </div>
    </div>
  );
}
