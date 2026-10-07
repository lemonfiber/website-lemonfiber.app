// The board's filters, as one island. It reads the filters from the address,
// writes them back as they change, and hides the cards the page already
// rendered that do not match, so the board without script and with it show
// the same cards for the same address.
import { useEffect, useState } from "preact/hooks";
import {
  FILTER_KEYS,
  filterQuery,
  matches,
  parseFilters,
  type FeatureCard,
  type Filters,
} from "../lib/features";

interface Props {
  cards: FeatureCard[];
  facets: Record<string, string[]>;
  labels: Record<string, string>;
  any: string;
  yes: string;
  no: string;
  clear: string;
  heading: string;
  shown: string;
}

function apply(cards: FeatureCard[], filters: Filters): number {
  let visible = 0;
  const counts = new Map<string, number>();
  for (const card of cards) {
    const match = matches(card, filters);
    const element = document.querySelector<HTMLElement>(
      `[data-feature="${card.id}"]`,
    );
    if (element) element.hidden = !match;
    if (match) {
      visible += 1;
      counts.set(card.maturity, (counts.get(card.maturity) ?? 0) + 1);
    }
  }
  for (const element of document.querySelectorAll<HTMLElement>(
    "[data-count]",
  )) {
    element.textContent = String(counts.get(element.dataset.count ?? "") ?? 0);
  }
  return visible;
}

export default function BoardFilters(props: Props) {
  const [filters, setFilters] = useState<Filters>({});
  const [visible, setVisible] = useState(props.cards.length);

  useEffect(() => {
    setFilters(parseFilters(new URLSearchParams(window.location.search)));
  }, []);

  useEffect(() => {
    setVisible(apply(props.cards, filters));
    const url = `${window.location.pathname}${filterQuery(filters)}`;
    window.history.replaceState(null, "", url);
  }, [filters, props.cards]);

  const optionLabel = (key: keyof Filters, value: string): string => {
    if (key !== "claimed") return value;
    return value === "yes" ? props.yes : props.no;
  };

  const set = (key: keyof Filters, value: string) => {
    setFilters((current) =>
      parseFilters(
        new URLSearchParams(filterQuery({ ...current, [key]: value })),
      ),
    );
  };

  return (
    <form
      class="bf"
      method="get"
      onSubmit={(e) => {
        e.preventDefault();
      }}
      aria-label={props.heading}
    >
      {FILTER_KEYS.map((key) => {
        const id = `bf-${key}`;
        const label = props.labels[key] ?? key;
        if (key === "q") {
          return (
            <label class="bf__field" for={id} key={key}>
              <span>{label}</span>
              <input
                id={id}
                name={key}
                type="search"
                value={filters.q ?? ""}
                onInput={(e) => {
                  set(key, e.currentTarget.value);
                }}
              />
            </label>
          );
        }
        const options =
          key === "claimed" ? ["yes", "no"] : (props.facets[key] ?? []);
        return (
          <label class="bf__field" for={id} key={key}>
            <span>{label}</span>
            <select
              id={id}
              name={key}
              value={filters[key] ?? ""}
              onChange={(e) => {
                set(key, e.currentTarget.value);
              }}
            >
              <option value="">{props.any}</option>
              {options.map((value) => (
                <option value={value} key={value}>
                  {optionLabel(key, value)}
                </option>
              ))}
            </select>
          </label>
        );
      })}
      <a
        class="bf__clear"
        href={typeof window === "undefined" ? "?" : window.location.pathname}
        onClick={(e) => {
          e.preventDefault();
          setFilters({});
        }}
      >
        {props.clear}
      </a>
      <p class="bf__shown" aria-live="polite">
        {props.shown
          .replace("{n}", String(visible))
          .replace("{of}", String(props.cards.length))}
      </p>
    </form>
  );
}
