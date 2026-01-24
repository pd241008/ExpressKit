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
async function run() {
    const args = process.argv.slice(2);
    if (args[0] !== "init") {
        console.log(`
ExpressKit – Opinionated Backend Starter

Usage:
  expresskit init
`);
        return;
    }
    const { projectName, language } = await inquirer_1.default.prompt([
        {
            type: "input",
            name: "projectName",
            message: "📦 Project name:",
            default: "express-backend",
        },
        {
            type: "list",
            name: "language",
            message: "🧠 Choose language:",
            choices: [
                { name: "TypeScript", value: "ts" },
                { name: "JavaScript", value: "js" },
            ],
            default: "ts",
        },
    ]);
    createProject(projectName, language);
}
function createProject(projectName, language) {
    const root = path_1.default.join(process.cwd(), projectName);
    const isTS = language === "ts";
    const ext = isTS ? "ts" : "js";
    if (fs_1.default.existsSync(root)) {
        console.error(`❌ Folder "${projectName}" already exists`);
        return;
    }
    console.log("🚀 Creating ExpressKit project...");
    // =========================
    // USER STRUCTURE (STANDARD)
    // =========================
    const userDirs = [
        "src/config",
        "src/controllers",
        "src/services",
        "src/middleware",
        "src/models",
        "src/utils",
        "src/routes/health",
    ];
    // =========================
    // FRAMEWORK (MAGIC)
    // =========================
    const frameworkDirs = [".expresskit"];
    fs_1.default.mkdirSync(root, { recursive: true });
    [...userDirs, ...frameworkDirs].forEach((dir) => fs_1.default.mkdirSync(path_1.default.join(root, dir), { recursive: true }));
    // =========================
    // EXPRESSKIT USER CONFIG
    // =========================
    fs_1.default.writeFileSync(path_1.default.join(root, `src/config/expresskit.config.${ext}`), `export const ExpressKitConfig = {
  routePrefix: "/api",
  defaultRouteMessage: "⚡ ExpressKit is alive",
  loadRoutesFrom: "src/routes",
};
`);
    // =========================
    // .expresskit DEFAULT ROUTE
    // =========================
    fs_1.default.writeFileSync(path_1.default.join(root, `.expresskit/default_route.${ext}`), `import { Router } from "express";
import { ExpressKitConfig } from "../src/config/expresskit.config";

const router = Router();

router.get("/", (_req, res) => {
  res.json({
    framework: "ExpressKit",
    status: "running",
    message: ExpressKitConfig.defaultRouteMessage,
  });
});

export default router;
`);
    // =========================
    // .expresskit ROUTE LOADER
    // =========================
    fs_1.default.writeFileSync(path_1.default.join(root, `.expresskit/route_loader.${ext}`), `import fs from "fs";
import path from "path";
import { Express } from "express";

export async function load_routes(app: Express, routesPath: string) {
  if (!fs.existsSync(routesPath)) return;

  const entries = fs.readdirSync(routesPath);

  for (const entry of entries) {
    const routeBase = path.join(routesPath, entry, "route");

    const file =
      fs.existsSync(routeBase + ".ts")
        ? routeBase + ".ts"
        : fs.existsSync(routeBase + ".js")
        ? routeBase + ".js"
        : null;

    if (!file) continue;

    const mod = await import(file);
    app.use(\`/\${entry}\`, mod.default);
  }
}
`);
    // =========================
    // EXPRESSKIT BRIDGE (SRC)
    // =========================
    fs_1.default.writeFileSync(path_1.default.join(root, `src/expresskit.${ext}`), `import path from "path";
import { Express } from "express";
import { ExpressKitConfig } from "./config/expresskit.config";

export async function loadExpressKit(app: Express) {
  const base = path.join(process.cwd(), ".expresskit");

  const { default: default_route } = await import(
    path.join(base, "default_route")
  );

  const { load_routes } = await import(path.join(base, "route_loader"));

  app.use("/", default_route);

  const routesPath = path.join(process.cwd(), ExpressKitConfig.loadRoutesFrom);
  await load_routes(app, routesPath);
}
`);
    // =========================
    // app.ts
    // =========================
    fs_1.default.writeFileSync(path_1.default.join(root, `src/app.${ext}`), `import express from "express";
import cors from "cors";
import morgan from "morgan";
import { loadExpressKit } from "./expresskit";

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

loadExpressKit(app);

export default app;
`);
    // =========================
    // server.ts
    // =========================
    fs_1.default.writeFileSync(path_1.default.join(root, `src/server.${ext}`), `import dotenv from "dotenv";
import app from "./app";

dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(\`🚀 Server running on port \${PORT}\`);
});
`);
    // =========================
    // ROUTE
    // =========================
    fs_1.default.writeFileSync(path_1.default.join(root, `src/routes/health/route.${ext}`), `import { Router } from "express";
import { health_controller } from "../../controllers/health_controller";

const router = Router();

router.get("/", health_controller);

export default router;
`);
    // =========================
    // CONTROLLER
    // =========================
    fs_1.default.writeFileSync(path_1.default.join(root, `src/controllers/health_controller.${ext}`), `import { Request, Response } from "express";
import { health_service } from "../services/health_service";

export const health_controller = (_req: Request, res: Response) => {
  res.json(health_service());
};
`);
    // =========================
    // SERVICE
    // =========================
    fs_1.default.writeFileSync(path_1.default.join(root, `src/services/health_service.${ext}`), `export const health_service = () => {
  return { status: "ok" };
};
`);
    // =========================
    // ENV & GITIGNORE
    // =========================
    fs_1.default.writeFileSync(path_1.default.join(root, ".env"), "PORT=5000\n");
    fs_1.default.writeFileSync(path_1.default.join(root, ".env.example"), "PORT=5000\n");
    fs_1.default.writeFileSync(path_1.default.join(root, ".gitignore"), `node_modules
.env
.expresskit
`);
    // =========================
    // NPM INIT
    // =========================
    (0, child_process_1.execSync)("npm init -y", { cwd: root, stdio: "inherit" });
    const pkgPath = path_1.default.join(root, "package.json");
    const pkg = JSON.parse(fs_1.default.readFileSync(pkgPath, "utf-8"));
    pkg.scripts = {
        dev: isTS ? "nodemon src/server.ts" : "nodemon src/server.js",
        start: isTS ? "node dist/server.js" : "node src/server.js",
        ...(isTS ? { build: "tsc" } : {}),
    };
    fs_1.default.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
    // =========================
    // DEPENDENCIES
    // =========================
    (0, child_process_1.execSync)("npm install express cors dotenv morgan", {
        cwd: root,
        stdio: "inherit",
    });
    (0, child_process_1.execSync)("npm install -D nodemon", { cwd: root, stdio: "inherit" });
    if (isTS) {
        (0, child_process_1.execSync)("npm install -D typescript ts-node @types/node @types/express @types/cors @types/morgan", { cwd: root, stdio: "inherit" });
        fs_1.default.writeFileSync(path_1.default.join(root, "tsconfig.json"), JSON.stringify({
            compilerOptions: {
                target: "ES2020",
                module: "CommonJS",
                rootDir: "src",
                outDir: "dist",
                strict: true,
                esModuleInterop: true,
            },
        }, null, 2));
    }
    console.log("✅ ExpressKit ready. Magic enabled ✨");
}
