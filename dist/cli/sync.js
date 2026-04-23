"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = run;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const expresskit_router_v1_1 = require("../runtime/route_handling/expresskit_router_v1");
const expresskit_config_v1_1 = require("../runtime/config_handling/expresskit_config_v1");
const expresskit_core_v1_1 = require("../runtime/core_handling/expresskit_core_v1");
const expresskit_errorhandeler_v1_1 = require("../runtime/error_handling/expresskit_errorhandeler_v1");
const expresskit_example_v1_1 = require("../runtime/example_handling/expresskit_example_v1");
const log = {
    info: (msg) => console.log(`ℹ️  ${msg}`),
    success: (msg) => console.log(`✔ ${msg}`),
    error: (msg) => console.error(`❌ ${msg}`),
};
async function run() {
    const root = process.cwd();
    log.info("Checking for ExpressKit project...");
    // Minimal check to ensure we are in a valid project (package.json exists)
    if (!fs_1.default.existsSync(path_1.default.join(root, "package.json"))) {
        log.error("No package.json found. Are you in the root of an ExpressKit project?");
        process.exit(1);
    }
    // Determine if project is TypeScript or JavaScript
    const isTS = fs_1.default.existsSync(path_1.default.join(root, "tsconfig.json"));
    const ext = isTS ? "ts" : "js";
    log.info(`Detected ${isTS ? "TypeScript" : "JavaScript"} environment.`);
    log.info("Regenerating internal bridge systems...");
    try {
        (0, expresskit_config_v1_1.generateConfigSystem)(root, ext);
        (0, expresskit_router_v1_1.generateRouteSystem)(root, ext);
        (0, expresskit_errorhandeler_v1_1.generateErrorSystem)(root, ext);
        (0, expresskit_core_v1_1.generateCoreSystem)(root, ext);
        (0, expresskit_example_v1_1.generateExampleSystem)(root, ext);
        log.success("Successfully rebuilt .expresskit bridge files ✨");
    }
    catch (error) {
        log.error(`Failed to sync ExpressKit bridge files: ${error.message}`);
        process.exit(1);
    }
}
