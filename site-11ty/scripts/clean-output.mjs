import { mkdirSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";

mkdirSync("_site", { recursive: true });

for (const entry of readdirSync("_site")) {
  rmSync(join("_site", entry), { recursive: true, force: true });
}
