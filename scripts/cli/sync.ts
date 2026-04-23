import fs from "fs";
import path from "path";

import { generateRouteSystem } from "../runtime/route_handling/expresskit_router_v1";
import { generateConfigSystem } from "../runtime/config_handling/expresskit_config_v1";
import { generateCoreSystem } from "../runtime/core_handling/expresskit_core_v1";
import { generateErrorSystem } from "../runtime/error_handling/expresskit_errorhandeler_v1";
import { generateExampleSystem } from "../runtime/example_handling/expresskit_example_v1";

const log = {
  info: (msg: string) => console.log(`ℹ️  ${msg}`),
  success: (msg: string) => console.log(`✔ ${msg}`),
  error: (msg: string) => console.error(`❌ ${msg}`),
};

export async function run() {
  const root = process.cwd();

  log.info("Checking for ExpressKit project...");

  // Minimal check to ensure we are in a valid project (package.json exists)
  if (!fs.existsSync(path.join(root, "package.json"))) {
    log.error("No package.json found. Are you in the root of an ExpressKit project?");
    process.exit(1);
  }

  // Determine if project is TypeScript or JavaScript
  const isTS = fs.existsSync(path.join(root, "tsconfig.json"));
  const ext = isTS ? "ts" : "js";

  log.info(`Detected ${isTS ? "TypeScript" : "JavaScript"} environment.`);
  log.info("Regenerating internal bridge systems...");

  try {
    generateConfigSystem(root, ext);
    generateRouteSystem(root, ext);
    generateErrorSystem(root, ext);
    generateCoreSystem(root, ext);
    generateExampleSystem(root, ext);

    log.success("Successfully rebuilt .expresskit bridge files ✨");
  } catch (error: any) {
    log.error(`Failed to sync ExpressKit bridge files: ${error.message}`);
    process.exit(1);
  }
}
