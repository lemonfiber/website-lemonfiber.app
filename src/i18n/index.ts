// The site's copy, in one place. English only, served from the root: the site
// is prerendered onto a static host with no request-time layer to vary on.
//
// Split three ways because the front page carries more prose than all the
// chrome combined, and the data-driven content pages are a different shape
// again. This module is the entry point the components import from.

export { copy } from "./copy";
export { homeCopy } from "./home";
