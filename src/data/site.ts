// Static, editorial content — the parts of the site that are prose, not motor
// data. The service/profile/form model follows lemonfiber-media-stack's
// manifest: profiles and forms in `stack.toml`, each service in the
// `services/<id>.toml` its `include` names. It draws every service the stack
// runs, lemonfiber's own decline and request-gate among them.

export const site = {
  name: "Lemonfiber",
  tagline: "Self-host your media — without becoming a sysadmin",
  description:
    "A fully open-source, self-hosted media automation stack that sets itself up, runs in the exact slice you need, and proves it's working instead of hoping.",
  org: "lemonfiber",
  githubOrg: "https://github.com/lemonfiber",
  repo: "https://github.com/lemonfiber/website-lemonfiber.app",
  discord: "https://discord.nightworks.io",
  specUrl: "https://github.com/lemonfiber/spec",
  docsUrl: "https://docs.lemonfiber.app",
  contributeUrl: "https://contribute.lemonfiber.app",
  license: "Hippocratic License 3.0",
  licenseUrl: "https://firstdonoharm.dev",
  by: { name: "NightWorks.io", url: "https://nightworks.io" },

  // The 1200×630 share card. Regenerate with `npm run og` after changing the
  // design or the wording; scripts/og.mjs renders it from the site's own
  // tokens and font.
  ogImage: "/og.png",
};

// Sibling projects from the same workshop. Listed in the footer so the three
// find each other; each is an independent product with its own org and site.
// The blurbs are prose, so they live in i18n/copy.ts under `footer[key]`
// rather than here.
export const siblings = [
  { key: "beatrax", label: "Beatrax", url: "https://beatrax.app" },
  { key: "happklaar", label: "Happklaar", url: "https://happklaar.nl" },
];

export const promises = [
  {
    icon: "lemon",
    title: "Genuinely open",
    body: "No closed-source media server, no paid tier, no phone-home. Every service is open-source and runs on your hardware. Jellyfin, the *arr apps, Seerr — the good stuff, all of it yours.",
  },
  {
    icon: "slice",
    title: "Runs in slices",
    body: "“Just search.” “Just download.” “Everything.” One config, one data folder, no separate installs — boot the shape that fits the moment.",
  },
  {
    icon: "shield",
    title: "Correct by construction",
    body: "It tests hardlinks instead of assuming them. It compares public IPs to prove your VPN isn't leaking. Silence means healthy — and it means it.",
  },
] as const;

// profile key → the services it starts, as each service file's `profile` says.
export const profiles: Record<string, { label: string; services: string[] }> = {
  search: {
    label: "Indexers",
    services: ["Prowlarr", "FlareSolverr", "NZBHydra2"],
  },
  usenet: { label: "Usenet", services: ["SABnzbd"] },
  torrent: { label: "Torrents", services: ["Gluetun", "qBittorrent"] },
  tv: { label: "Television", services: ["Sonarr"] },
  movies: { label: "Movies", services: ["Radarr"] },
  music: { label: "Music", services: ["Lidarr"] },
  books: { label: "Books", services: ["Bindery"] },
  subs: { label: "Subtitles", services: ["Bazarr"] },
  media: {
    label: "Library",
    services: [
      "Jellyfin",
      "Seerr",
      "Calibre-Web-Automated",
      "Audiobookshelf",
      "Navidrome",
      "Request gate",
      "Decline service",
    ],
  },
  tuning: { label: "Tuning", services: ["Recyclarr", "Unpackerr"] },
  dash: { label: "Dashboard", services: ["Homepage"] },
  proxy: { label: "Proxy", services: ["Caddy"] },
};

// The profiles every automating form starts from, in manifest order.
const automated = [
  "search",
  "usenet",
  "torrent",
  "tv",
  "movies",
  "music",
  "books",
  "subs",
];

// Named forms — the slices you actually type. `lemonfiber up tv`, etc. Every
// form in stack.toml but `proxy`, which layers onto another form and is named
// in the switcher's footnote instead.
export const forms: {
  key: string;
  label: string;
  blurb: string;
  profiles: string[];
  featured?: boolean;
}[] = [
  {
    key: "search",
    label: "search",
    blurb: "Just find things.",
    profiles: ["search"],
  },
  {
    key: "dl",
    label: "dl",
    blurb: "Just download a link you have.",
    profiles: ["usenet", "torrent"],
  },
  {
    key: "hunt",
    label: "hunt",
    blurb: "Find and grab, no library.",
    profiles: ["search", "usenet", "torrent"],
  },
  {
    key: "tv",
    label: "tv",
    blurb: "Search → download → organise → subtitle.",
    profiles: ["search", "usenet", "torrent", "tv", "subs"],
    featured: true,
  },
  {
    key: "movies",
    label: "movies",
    blurb: "The movie pipeline, end to end.",
    profiles: ["search", "usenet", "torrent", "movies", "subs"],
  },
  {
    key: "music",
    label: "music",
    blurb: "Track down and file your music.",
    profiles: ["search", "usenet", "torrent", "music"],
  },
  {
    key: "books",
    label: "books",
    blurb: "Ebooks, fetched and shelved.",
    profiles: ["search", "usenet", "torrent", "books"],
  },
  {
    key: "auto",
    label: "auto",
    blurb: "Everything automated, nothing served.",
    profiles: [...automated, "tuning"],
  },
  {
    key: "library",
    label: "library",
    blurb: "Just serve what you already have.",
    profiles: ["media"],
  },
  {
    key: "full",
    label: "full",
    blurb: "The lot — everything but the optional proxy.",
    profiles: [...automated, "media", "tuning", "dash"],
    featured: true,
  },
];

export interface Service {
  /** The service's id in the stack, as `services/<id>.toml` names it. */
  id: string;
  name: string;
  role: string;
  profile: string;
  group: string;
  vpn?: boolean;
  household?: boolean;
}

// One service: its stack id, the name and role shown, its profile and the
// pipeline stage it sits in. `vpn` is a service that reaches out only through
// Gluetun's tunnel; `household` one the household reaches, on the LAN.
const service = (
  id: string,
  name: string,
  role: string,
  profile: string,
  group: string,
  reach: { vpn?: boolean; household?: boolean } = {},
): Service => ({ id, name, role, profile, group, ...reach });

// What the household reaches: a service of the `media` profile on the LAN.
const library = (id: string, name: string, role: string): Service =>
  service(id, name, role, "media", "Enjoy", { household: true });

const tunnelled = { vpn: true };

// Every service the stack runs, in the order the pipeline flows. The build
// refuses a list that differs from the stack manifest's `include`.
export const services: Service[] = [
  service("prowlarr", "Prowlarr", "Indexer manager", "search", "Find"),
  service(
    "flaresolverr",
    "FlareSolverr",
    "Cloudflare solver",
    "search",
    "Find",
  ),
  service("nzbhydra2", "NZBHydra2", "Meta-indexer", "search", "Find"),
  service("sabnzbd", "SABnzbd", "Usenet downloader", "usenet", "Download"),
  service(
    "gluetun",
    "Gluetun",
    "VPN gateway",
    "torrent",
    "Download",
    tunnelled,
  ),
  service(
    "qbittorrent",
    "qBittorrent",
    "Torrent client",
    "torrent",
    "Download",
    tunnelled,
  ),
  service("sonarr", "Sonarr", "TV automation", "tv", "Organise"),
  service("radarr", "Radarr", "Movie automation", "movies", "Organise"),
  service("lidarr", "Lidarr", "Music automation", "music", "Organise"),
  service("bindery", "Bindery", "Book automation", "books", "Organise"),
  service("bazarr", "Bazarr", "Subtitles", "subs", "Organise"),
  library("jellyfin", "Jellyfin", "Media server"),
  // Caddy in front of Jellyfin: the household reaches Jellyfin through it, and
  // an item's stream or picture goes only to someone allowed to see it.
  library("door", "Door", "Jellyfin's front door"),
  library("seerr", "Seerr", "Request portal"),
  library("calibre-web-automated", "Calibre-Web-Automated", "Ebook library"),
  library("audiobookshelf", "Audiobookshelf", "Audiobooks & podcasts"),
  library("navidrome", "Navidrome", "Music streaming"),
  // lemonfiber's own two. The request gate holds Sonarr's, Radarr's and
  // Jellyfin's keys so Seerr holds none, and answers only inside the stack; the
  // decline service is on the LAN, where somebody invited can turn it down.
  service(
    "request-gate",
    "Request gate",
    "Holds Seerr's keys",
    "media",
    "Enjoy",
  ),
  library("decline", "Decline service", "Turning an invitation down"),
  service("recyclarr", "Recyclarr", "Quality profiles", "tuning", "Tune"),
  service("unpackerr", "Unpackerr", "Archive extraction", "tuning", "Tune"),
  service("homepage", "Homepage", "Dashboard", "dash", "Access"),
  service("caddy", "Caddy", "Reverse proxy", "proxy", "Access"),
];

// Compute the container set a form boots, from its profiles. Pure — used by
// the switcher so the UI can never disagree with the manifest.
export function servicesForForm(profileKeys: string[]): Service[] {
  const wanted = new Set(profileKeys);
  return services.filter((s) => wanted.has(s.profile));
}

export const helpWays = [
  {
    emoji: "🧪",
    title: "Try it and tell us what broke",
    body: "Install it, run it against your own stack, and file what breaks — bug reports and rough edges are gold.",
  },
  {
    emoji: "📝",
    title: "Improve the docs",
    body: "Something unclear? Fix it — every repo's docs are open, and a docs PR is a real contribution.",
  },
  {
    emoji: "🎨",
    title: "Design & UX",
    body: "The web UI and the brand welcome a good eye.",
  },
  {
    emoji: "💬",
    title: "Hang out on Discord",
    body: "Answer a question, share your setup, help shape the roadmap.",
  },
  {
    emoji: "⭐",
    title: "Spread the word",
    body: "A star or a mention genuinely helps a young project find people.",
  },
];
