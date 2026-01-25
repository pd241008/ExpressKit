#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import inquirer from "inquirer";

// --- IMPORT YOUR NEW MODULES ---
import { generateRouteSystem } from "../runtime/route_handling/expresskit_router_v1";
import { generateConfigSystem } from "../runtime/config_handling/expresskit_config_v1";
import { generateCoreSystem } from "../runtime/core_handling/expresskit_core_v1";
import { generateErrorSystem } from "../runtime/error_handling/expresskit_errorhandeler_v1";
import { generateExampleSystem } from "../runtime/example_handling/expresskit_example_v1";

/* ----------------------------------
   Minimal logger
----------------------------------- */
const log = {
  info: (msg: string) => console.log(`ℹ️  ${msg}`),
  success: (msg: string) => console.log(`✔ ${msg}`),
  error: (msg: string) => console.error(`❌ ${msg}`),
};

/* ----------------------------------
   TTY Detection & Helpers
----------------------------------- */
const isInteractive = process.stdout.isTTY && process.env.TERM !== "dumb";

function startLoader(text: string) {
  if (!isInteractive) return () => {};
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

function runCommand(command: string, cwd: string) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(command, { cwd, shell: true, stdio: "ignore" });
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Command failed: ${command}`));
    });
    child.on("error", reject);
  });
}

/* ----------------------------------
   MAIN ENTRY
----------------------------------- */
export async function run() {
  const args = process.argv.slice(2);

  if (args[0] !== "init") {
    console.log(`
ExpressKit – Opinionated Backend Starter

Usage:
  expresskit init
`);
    return;
  }

  const { projectName, language } = await inquirer.prompt([
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

async function createProject(projectName: string, language: "ts" | "js") {
  const root = path.join(process.cwd(), projectName);
  const isTS = language === "ts";
  const ext = isTS ? "ts" : "js";

  if (fs.existsSync(root)) {
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

  fs.mkdirSync(root, { recursive: true });
  [...userDirs, ...frameworkDirs].forEach((dir) =>
    fs.mkdirSync(path.join(root, dir), { recursive: true }),
  );

  /* ----------------------------------
     MODULE GENERATION
  ----------------------------------- */
  log.info("Generating internal systems...");

  generateConfigSystem(root, ext);
  generateRouteSystem(root, ext);
  generateErrorSystem(root, ext);
  generateCoreSystem(root, ext);
  generateExampleSystem(root, ext);

  /* ----------------------------------
     DOTFILES & CONFIGS (FIXED)
  ----------------------------------- */
  fs.writeFileSync(path.join(root, ".env"), "PORT=5000\n");
  fs.writeFileSync(path.join(root, ".env.example"), "PORT=5000\n");
  const gitignorePath = path.join(root, ".gitignore");

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

  if (fs.existsSync(gitignorePath)) {
    const existing = fs.readFileSync(gitignorePath, "utf8");
    if (!existing.includes(".expresskit")) {
      fs.appendFileSync(gitignorePath, "\n" + expressKitIgnore);
    }
  } else {
    fs.writeFileSync(gitignorePath, expressKitIgnore);
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

    const pkgPath = path.join(root, "package.json");
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));

    pkg.scripts = {
      dev: isTS ? "nodemon src/server.ts" : "nodemon src/server.js",
      start: isTS ? "node dist/server.js" : "node src/server.js",
      ...(isTS ? { build: "tsc" } : {}),
    };

    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

    await runCommand(
      "npm install express cors dotenv morgan --no-fund --no-audit",
      root,
    );

    await runCommand("npm install -D nodemon --no-fund --no-audit", root);

    if (isTS) {
      await runCommand(
        "npm install -D typescript ts-node @types/node @types/express @types/cors @types/morgan --no-fund --no-audit",
        root,
      );

      fs.writeFileSync(
        path.join(root, "tsconfig.json"),
        JSON.stringify(
          {
            compilerOptions: {
              target: "ES2020",
              module: "CommonJS",
              rootDir: ".", // Ensure this is '.' for your folder structure
              outDir: "dist",
              strict: true,
              esModuleInterop: true,
            },
            include: ["src/**/*", ".expresskit/**/*"],
          },
          null,
          2,
        ),
      );
    }
  } catch (err) {
    stopLoader();
    log.error("Installation failed (Check git or npm)");
    // Don't exit process hard, let the user see the error
  }

  stopLoader();
  log.success("Dependencies installed & Git initialized");

  console.log("\n✅ ExpressKit ready. Magic enabled ✨\n");
}
