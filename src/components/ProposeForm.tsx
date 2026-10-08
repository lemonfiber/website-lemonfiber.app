// Propose a change, or report a gap, as one island: the fields in, the file
// and GitHub's new-file address out. Nothing leaves the browser until the
// person opens GitHub, which receives the file in the address (D9).
import { useEffect, useState } from "preact/hooks";
import {
  faults,
  newFileUrl,
  proposalText,
  pullBody,
  pullTitle,
  statementsOf,
  type Asked,
  type Kind,
} from "../lib/propose";
import type { proposeCopy } from "../i18n/assist";

type Copy = typeof proposeCopy;

interface Props {
  t: Copy;
  areas: { id: string; name: string }[];
  features: string[];
}

function Field(props: {
  id: string;
  label: string;
  hint: string;
  value: string;
  rows?: number;
  set: (value: string) => void;
}) {
  const hint = `${props.id}-hint`;
  return (
    <div class="pf__field">
      <label for={props.id}>{props.label}</label>
      <p class="pf__hint" id={hint}>
        {props.hint}
      </p>
      {props.rows ? (
        <textarea
          id={props.id}
          rows={props.rows}
          aria-describedby={hint}
          value={props.value}
          onInput={(e) => {
            props.set(e.currentTarget.value);
          }}
        />
      ) : (
        <input
          id={props.id}
          type="text"
          aria-describedby={hint}
          value={props.value}
          onInput={(e) => {
            props.set(e.currentTarget.value);
          }}
        />
      )}
    </div>
  );
}

export default function ProposeForm({ t, areas, features }: Props) {
  const [kind, setKind] = useState<Kind>("proposal");
  // The address asks for a gap with `?kind=gap`. Read after hydration, so the
  // page the server built and the one the browser first draws agree.
  useEffect(() => {
    if (new URLSearchParams(location.search).get("kind") === "gap")
      setKind("gap");
  }, []);
  const [area, setArea] = useState("");
  const [title, setTitle] = useState("");
  const [amends, setAmends] = useState("");
  const [problem, setProblem] = useState("");
  const [statements, setStatements] = useState("");
  const [rationale, setRationale] = useState("");
  const [missing, setMissing] = useState("");

  const asked: Asked = {
    kind,
    area,
    title,
    amends,
    problem,
    statements: statementsOf(statements),
    rationale,
    missing,
  };
  const wrong = faults(
    asked,
    areas.map((a) => a.id),
    features,
  );

  return (
    <div class="pf">
      <form
        class="pf__form"
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <fieldset class="pf__kind">
          <legend>{t.kind}</legend>
          {(
            [
              ["proposal", t.kindProposal],
              ["gap", t.kindGap],
            ] as const
          ).map(([value, label]) => (
            <label key={value}>
              <input
                type="radio"
                name="kind"
                value={value}
                checked={kind === value}
                onChange={() => {
                  setKind(value);
                }}
              />{" "}
              {label}
            </label>
          ))}
        </fieldset>
        <div class="pf__field">
          <label for="pf-area">{t.area}</label>
          <select
            id="pf-area"
            value={area}
            onChange={(e) => {
              setArea(e.currentTarget.value);
            }}
          >
            <option value="">{t.areaChoose}</option>
            {areas.map((a) => (
              <option key={a.id} value={a.id}>
                {a.id} · {a.name}
              </option>
            ))}
          </select>
        </div>
        <Field
          id="pf-title"
          label={t.titleLabel}
          hint={t.titleHint}
          value={title}
          set={setTitle}
        />
        <Field
          id="pf-amends"
          label={t.amends}
          hint={t.amendsHint}
          value={amends}
          set={setAmends}
        />
        {kind === "proposal" ? (
          <>
            <Field
              id="pf-problem"
              label={t.problem}
              hint={t.problemHint}
              value={problem}
              rows={3}
              set={setProblem}
            />
            <Field
              id="pf-statements"
              label={t.statements}
              hint={t.statementsHint}
              value={statements}
              rows={4}
              set={setStatements}
            />
            <Field
              id="pf-rationale"
              label={t.rationale}
              hint={t.rationaleHint}
              value={rationale}
              rows={3}
              set={setRationale}
            />
          </>
        ) : (
          <Field
            id="pf-missing"
            label={t.missing}
            hint={t.missingHint}
            value={missing}
            rows={4}
            set={setMissing}
          />
        )}
      </form>
      <section class="pf__out" aria-live="polite">
        <h2 class="pf__h">{t.preview}</h2>
        <pre class="pf__preview">{proposalText(asked)}</pre>
        {wrong.length > 0 ? (
          <>
            <h2 class="pf__h">{t.faults}</h2>
            <ul class="pf__faults">
              {wrong.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </>
        ) : (
          <>
            <p class="pf__steps">{t.steps}</p>
            <a class="btn btn--primary" href={newFileUrl(asked)}>
              {t.open}
            </a>
            <h2 class="pf__h">{t.pullTitle}</h2>
            <pre class="pf__preview">{pullTitle(asked)}</pre>
            <h2 class="pf__h">{t.pullBody}</h2>
            <p class="pf__hint">{t.pullBodyHint}</p>
            <pre class="pf__preview">{pullBody(asked)}</pre>
          </>
        )}
      </section>
    </div>
  );
}
