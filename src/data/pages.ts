// The pages this site builds from the board snapshot, each named and described
// by the copy its own page renders, so an index of the site cannot describe a
// page differently from the page itself.

import {
  boardCopy,
  inFlightCopy,
  pickCopy,
  proposalsCopy,
  releasesCopy,
  reposCopy,
  roadmapCopy,
} from "../i18n";

export interface SitePage {
  path: string;
  title: string;
  description: string;
}

const page = (
  path: string,
  copy: { title: string; description: string },
): SitePage => ({ path, title: copy.title, description: copy.description });

export const projectPages: readonly SitePage[] = [
  page("/roadmap/", roadmapCopy),
  page("/board/", boardCopy),
  page("/repos/", reposCopy),
  page("/in-flight/", inFlightCopy),
  page("/pick/", pickCopy),
  page("/releases/", releasesCopy),
  page("/proposals/", proposalsCopy),
];
