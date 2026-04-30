#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = run;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
const inquirer_1 = __importDefault(require("inquirer"));
// --- IMPORT YOUR NEW MODULES ---
const expresskit_router_v1_1 = require("../runtime/route_handling/expresskit_router_v1");
const expresskit_config_v1_1 = require("../runtime/config_handling/expresskit_config_v1");
const expresskit_core_v1_1 = require("../runtime/core_handling/expresskit_core_v1");
const expresskit_errorhandeler_v1_1 = require("../runtime/error_handling/expresskit_errorhandeler_v1");
const expresskit_example_v1_1 = require("../runtime/example_handling/expresskit_example_v1");
const readme_config_v1_1 = require("../docs/readme_config_v1");
/* ----------------------------------
   Minimal logger
----------------------------------- */
const log = {
    info: (msg) => console.log(`ℹ️  ${msg}`),
    success: (msg) => console.log(`✔ ${msg}`),
    error: (msg) => console.error(`❌ ${msg}`),
};
/* ----------------------------------
   TTY Detection & Helpers
----------------------------------- */
const isInteractive = process.stdout.isTTY && process.env.TERM !== "dumb";
function startLoader(text) {
    if (!isInteractive)
        return () => { };
    const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
    let i = 0;
    const timer = setInterval(() => {
        process.stdout.write(`\r${frames[i++ % frames.length]} ${text}`);
    }, 80);
    return () => {
        clearInterval(timer);
        process.stdout.write("\r\x1b[K");
    };
}
function runCommand(command, cwd) {
    return new Promise((resolve, reject) => {
        const child = (0, child_process_1.spawn)(command, { cwd, shell: true, stdio: "ignore" });
        child.on("close", (code) => {
            if (code === 0)
                resolve();
            else
                reject(new Error(`Command failed: ${command}`));
        });
        child.on("error", reject);
    });
}
/* ----------------------------------
   MAIN ENTRY
----------------------------------- */
async function run() {
    const args = process.argv.slice(2);
    const { projectName, language } = await inquirer_1.default.prompt([
        {
            type: "input",
            name: "projectName",
            message: "📦 Project name",
            default: "express-backend",
        },
        {
            type: "list",
            name: "language",
            message: "🧠 Choose language",
            choices: [
                { name: "TypeScript", value: "ts" },
                { name: "JavaScript", value: "js" },
            ],
            default: "ts",
        },
    ]);
    await createProject(projectName, language);
}
async function createProject(projectName, language) {
    const root = path_1.default.join(process.cwd(), projectName);
    const isTS = language === "ts";
    const ext = isTS ? "ts" : "js";
    if (fs_1.default.existsSync(root)) {
        log.error(`Folder "${projectName}" already exists`);
        return;
    }
    log.info("Creating ExpressKit project");
    /* ----------------------------------
       SCAFFOLDING
    ----------------------------------- */
    const userDirs = [
        "src/config",
        "src/controllers",
        "src/services",
        "src/middleware",
        "src/models",
        "src/utils",
        "src/routes/health",
    ];
    const frameworkDirs = [".expresskit"];
    fs_1.default.mkdirSync(root, { recursive: true });
    [...userDirs, ...frameworkDirs].forEach((dir) => fs_1.default.mkdirSync(path_1.default.join(root, dir), { recursive: true }));
    /* ----------------------------------
       MODULE GENERATION
    ----------------------------------- */
    log.info("Generating internal systems...");
    (0, expresskit_config_v1_1.generateConfigSystem)(root, ext);
    (0, expresskit_router_v1_1.generateRouteSystem)(root, ext);
    (0, expresskit_errorhandeler_v1_1.generateErrorSystem)(root, ext);
    (0, expresskit_core_v1_1.generateCoreSystem)(root, ext);
    (0, expresskit_example_v1_1.generateExampleSystem)(root, ext);
    (0, readme_config_v1_1.generateReadMe)(root);
    /* ----------------------------------
       DOTFILES & CONFIGS (FIXED)
    ----------------------------------- */
    fs_1.default.writeFileSync(path_1.default.join(root, ".env"), "PORT=5000\n");
    fs_1.default.writeFileSync(path_1.default.join(root, ".env.example"), "PORT=5000\n");
    const gitignorePath = path_1.default.join(root, ".gitignore");
    // FIX: Use an array joined by \n to prevent indentation bugs
    const ignoreRules = [
        "# Dependencies",
        "node_modules/",
        "",
        "# Build output",
        "dist/",
        "",
        "# Environment",
        ".env",
        ".env.*",
        "!.env.example",
        "",
        "# ExpressKit internals",
        ".expresskit/",
        "",
    ];
    const expressKitIgnore = ignoreRules.join("\n");
    if (fs_1.default.existsSync(gitignorePath)) {
        const existing = fs_1.default.readFileSync(gitignorePath, "utf8");
        if (!existing.includes(".expresskit")) {
            fs_1.default.appendFileSync(gitignorePath, "\n" + expressKitIgnore);
        }
    }
    else {
        fs_1.default.writeFileSync(gitignorePath, expressKitIgnore);
    }
    /* ----------------------------------
       PACKAGE INSTALLATION
    ----------------------------------- */
    log.info("Installing dependencies");
    const stopLoader = startLoader("Installing packages...");
    try {
        // 1. Initialize Git FIRST (Best Practice)
        // This ensures .gitignore is respected immediately
        await runCommand("git init", root);
        await runCommand("npm init -y", root);
        const pkgPath = path_1.default.join(root, "package.json");
        const pkg = JSON.parse(fs_1.default.readFileSync(pkgPath, "utf-8"));
        pkg.scripts = {
            dev: isTS ? "nodemon src/server.ts" : "nodemon src/server.js",
            start: isTS ? "node dist/server.js" : "node src/server.js",
            postinstall: "npx @pd241008/expresskit sync",
            ...(isTS ? { build: "tsc" } : {}),
        };
        fs_1.default.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
        await runCommand("npm install express cors dotenv morgan zod --no-fund --no-audit", root);
        await runCommand("npm install -D nodemon --no-fund --no-audit", root);
        if (isTS) {
            await runCommand("npm install -D typescript ts-node @types/node @types/express @types/cors @types/morgan --no-fund --no-audit", root);
            fs_1.default.writeFileSync(path_1.default.join(root, "tsconfig.json"), JSON.stringify({
                compilerOptions: {
                    target: "ES2020",
                    module: "CommonJS",
                    rootDir: ".", // Ensure this is '.' for your folder structure
                    outDir: "dist",
                    strict: true,
                    esModuleInterop: true,
                },
                include: ["src/**/*", ".expresskit/**/*"],
            }, null, 2));
        }
    }
    catch (err) {
        stopLoader();
        log.error("Installation failed (Check git or npm)");
        // Don't exit process hard, let the user see the error
    }
    stopLoader();
    log.success("Dependencies installed & Git initialized");
    console.log("\n✅ ExpressKit ready. Magic enabled ✨\n");
}
