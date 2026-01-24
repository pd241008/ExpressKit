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
    // --------------------
    // FOLDERS (STANDARD)
    // --------------------
    const dirs = [
        "src/config",
        "src/controllers",
        "src/services",
        "src/middleware",
        "src/models",
        "src/utils",
        "src/routes/health",
    ];
    fs_1.default.mkdirSync(root, { recursive: true });
    dirs.forEach((dir) => fs_1.default.mkdirSync(path_1.default.join(root, dir), { recursive: true }));
    // --------------------
    // app.ts
    // --------------------
    fs_1.default.writeFileSync(path_1.default.join(root, `src/app.${ext}`), `import express from "express";
import cors from "cors";
import morgan from "morgan";
import healthRoutes from "./routes/health/route";

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/health", healthRoutes);

export default app;
`);
    // --------------------
    // server.ts (FIXED)
    // --------------------
    fs_1.default.writeFileSync(path_1.default.join(root, `src/server.${ext}`), `import dotenv from "dotenv";
import app from "./app";

dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(\`🚀 Server running on port \${PORT}\`);
});
`);
    // --------------------
    // ROUTE
    // --------------------
    fs_1.default.writeFileSync(path_1.default.join(root, `src/routes/health/route.${ext}`), `import { Router } from "express";
import { health_controller } from "../../controllers/health_controller";

const router = Router();

router.get("/", health_controller);

export default router;
`);
    // --------------------
    // CONTROLLER
    // --------------------
    fs_1.default.writeFileSync(path_1.default.join(root, `src/controllers/health_controller.${ext}`), `import { Request, Response } from "express";
import { health_service } from "../services/health_service";

export const health_controller = (_req: Request, res: Response) => {
  const result = health_service();
  res.json(result);
};
`);
    // --------------------
    // SERVICE
    // --------------------
    fs_1.default.writeFileSync(path_1.default.join(root, `src/services/health_service.${ext}`), `export const health_service = () => {
  return { status: "ok" };
};
`);
    // --------------------
    // MIDDLEWARE (READY)
    // --------------------
    fs_1.default.writeFileSync(path_1.default.join(root, `src/middleware/health_middleware.${ext}`), `import { Request, Response, NextFunction } from "express";

export const health_middleware = (
  _req: Request,
  _res: Response,
  next: NextFunction
) => {
  next();
};
`);
    // --------------------
    // ENV & GIT
    // --------------------
    fs_1.default.writeFileSync(path_1.default.join(root, ".env"), "PORT=5000\n");
    fs_1.default.writeFileSync(path_1.default.join(root, ".env.example"), "PORT=5000\n");
    fs_1.default.writeFileSync(path_1.default.join(root, ".gitignore"), "node_modules\n.env\n");
    // --------------------
    // NPM INIT
    // --------------------
    (0, child_process_1.execSync)("npm init -y", { cwd: root, stdio: "inherit" });
    const pkgPath = path_1.default.join(root, "package.json");
    const pkg = JSON.parse(fs_1.default.readFileSync(pkgPath, "utf-8"));
    pkg.scripts = {
        dev: isTS ? "nodemon src/server.ts" : "nodemon src/server.js",
        build: isTS ? "tsc" : undefined,
        start: isTS ? "node dist/server.js" : "node src/server.js",
    };
    fs_1.default.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
    // --------------------
    // DEPENDENCIES
    // --------------------
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
    console.log(`✅ ExpressKit ready! (${language.toUpperCase()})`);
}
