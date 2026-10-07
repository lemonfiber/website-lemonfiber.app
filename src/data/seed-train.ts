// The committed version-train snapshot: the offline fallback, and nothing else.
//
// Used only when the specification's feature board is unreachable at build
// time, so a build (and local dev without network) never fails.
// When the board is reachable it is the only source and nothing here is read.
//
// Copied from the `versions` list of spec's
// 10-functional/features/index.json at c26ed83. Regenerate it from that file;
// do not edit a row by hand.

import type { TrainVersion } from "../lib/train";

export const seedTrain: TrainVersion[] = [
  { version: "0.1.0", status: "released", milestone: "M2", goals: 9 },
  { version: "0.2.0", status: "released", milestone: "M3", goals: 38 },
  { version: "0.3.0", status: "released", milestone: "M4", goals: 13 },
  { version: "0.4.0", status: "released", milestone: "M4", goals: 68 },
  { version: "0.5.0", status: "released", milestone: "M5", goals: 50 },
  { version: "0.6.0", status: "released", milestone: "M5", goals: 46 },
  { version: "0.7.0", status: "released", milestone: "M5", goals: 44 },
  { version: "0.8.0", status: "released", milestone: "M6", goals: 47 },
  { version: "0.9.0", status: "released", milestone: "M7", goals: 46 },
  { version: "0.10.0", status: "released", milestone: "M7", goals: 61 },
  { version: "0.11.0", status: "released", milestone: "M8", goals: 44 },
  { version: "0.12.0", status: "released", milestone: "M8", goals: 58 },
  { version: "0.13.0", status: "released", milestone: "M9", goals: 60 },
  { version: "0.14.0", status: "released", milestone: "M9", goals: 58 },
  { version: "0.15.0", status: "released", milestone: "M9", goals: 71 },
  { version: "0.16.0", status: "released", milestone: "M14", goals: 111 },
  { version: "0.17.0", status: "releasable", milestone: "M14", goals: 76 },
  { version: "0.18.0", status: "planned", milestone: "M14", goals: 323 },
  { version: "0.19.0", status: "planned", milestone: "M16", goals: 14 },
  { version: "0.20.0", status: "planned", milestone: "M11", goals: 60 },
  { version: "0.21.0", status: "planned", milestone: "M11", goals: 59 },
  { version: "0.22.0", status: "planned", milestone: "M12", goals: 29 },
  { version: "0.23.0", status: "planned", milestone: "M13", goals: 40 },
  { version: "0.24.0", status: "planned", milestone: "M15", goals: 42 },
  { version: "1.0.0", status: "planned", milestone: "M6", goals: 19 },
];
