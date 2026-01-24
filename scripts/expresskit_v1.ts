#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import inquirer from "inquirer";

/* ----------------------------------
   Minimal logger (clean DX)
----------------------------------- */
const log = {
  info: (msg: string) => console.log(`ℹ️  ${msg}`),
  success: (msg: string) => console.log(`✔ ${msg}`),
  error: (msg: string) => console.error(`❌ ${msg}`),
};

/* ----------------------------------
   TTY Detection (DO NOT REMOVE)
----------------------------------- */
const isInteractive = process.stdout.isTTY && process.env.TERM !== "dumb";

/* ----------------------------------
   CLI Loader (non-intrusive)
----------------------------------- */
function startLoader(text: string) {
  if (!isInteractive) {
    return () => {};
  }

  const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  let i = 0;

  const timer = setInterval(() => {
    process.stdout.write(`\r${frames[i++ % frames.length]} ${text}`);
  }, 80);

  return () => {
    clearInterval(timer);
    process.stdout.write("\r\x1b[K"); // ← important for PowerShell
  };
}

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

  createProject(projectName, language);
}

function createProject(projectName: string, language: "ts" | "js") {
  const root = path.join(process.cwd(), projectName);
  const isTS = language === "ts";
  const ext = isTS ? "ts" : "js";

  if (fs.existsSync(root)) {
    log.error(`Folder "${projectName}" already exists`);
    return;
  }

  log.info("Creating ExpressKit project");

  /* ----------------------------------
     USER STRUCTURE (PUBLIC API)
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

  /* ----------------------------------
     FRAMEWORK STRUCTURE (INTERNAL)
  ----------------------------------- */
  const frameworkDirs = [".expresskit"];

  fs.mkdirSync(root, { recursive: true });
  [...userDirs, ...frameworkDirs].forEach((dir) =>
    fs.mkdirSync(path.join(root, dir), { recursive: true }),
  );

  /* ----------------------------------
     EXPRESSKIT USER CONFIG
  ----------------------------------- */
  fs.writeFileSync(
    path.join(root, `src/config/expresskit.config.${ext}`),
    `export const ExpressKitConfig = {
  routePrefix: "/api",
  defaultRouteMessage: "⚡ ExpressKit is alive",
  loadRoutesFrom: "src/routes",
};
`,
  );

  /* ----------------------------------
     INTERNAL DEFAULT ROUTE
  ----------------------------------- */
  fs.writeFileSync(
    path.join(root, `.expresskit/default_route.${ext}`),
    `import { Router } from "express";
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
`,
  );

  /* ----------------------------------
     INTERNAL ROUTE LOADER
  ----------------------------------- */
  fs.writeFileSync(
    path.join(root, `.expresskit/route_loader.${ext}`),
    `import fs from "fs";
import path from "path";
import { Express } from "express";
import { ExpressKitConfig } from "../src/config/expresskit.config";

export async function load_routes(app: Express, routesPath: string) {
  if (!fs.existsSync(routesPath)) return;

  const entries = fs.readdirSync(routesPath);

  for (const entry of entries) {
    const base = path.join(routesPath, entry, "route");

    const file =
      fs.existsSync(base + ".ts")
        ? base + ".ts"
        : fs.existsSync(base + ".js")
        ? base + ".js"
        : null;

    if (!file) continue;

    const mod = await import(file);
    app.use(\`\${ExpressKitConfig.routePrefix}/\${entry}\`, mod.default);
  }
}
`,
  );

  /* ----------------------------------
     EXPRESSKIT BRIDGE (CONFIG)
  ----------------------------------- */
  fs.writeFileSync(
    path.join(root, `src/config/expresskit.bridge.${ext}`),
    `import path from "path";
import { Express } from "express";
import { ExpressKitConfig } from "./expresskit.config";

/**
 * Internal ExpressKit bridge.
 * Not intended to be modified.
 */
export async function loadExpressKit(app: Express) {
  const base = path.join(process.cwd(), ".expresskit");

  const { default: default_route } = await import(
    path.join(base, "default_route")
  );

  const { load_routes } = await import(
    path.join(base, "route_loader")
  );

  app.use("/", default_route);

  const routesPath = path.join(
    process.cwd(),
    ExpressKitConfig.loadRoutesFrom
  );

  await load_routes(app, routesPath);
}
`,
  );

  /* ----------------------------------
     app.ts
  ----------------------------------- */
  fs.writeFileSync(
    path.join(root, `src/app.${ext}`),
    `import express from "express";
import cors from "cors";
import morgan from "morgan";
import { loadExpressKit } from "./config/expresskit.bridge";

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

loadExpressKit(app);

export default app;
`,
  );

  /* ----------------------------------
     server.ts
  ----------------------------------- */
  fs.writeFileSync(
    path.join(root, `src/server.${ext}`),
    `import dotenv from "dotenv";
import app from "./app";

dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(\`🚀 Server running on port \${PORT}\`);
});
`,
  );

  /* ----------------------------------
     HEALTH EXAMPLE
  ----------------------------------- */
  fs.writeFileSync(
    path.join(root, `src/routes/health/route.${ext}`),
    `import { Router } from "express";
import { health_controller } from "../../controllers/health_controller";
import { health_middleware } from "../../middleware/health_middleware";

const router = Router();

router.get("/", health_middleware, health_controller);

export default router;
`,
  );

  fs.writeFileSync(
    path.join(root, `src/controllers/health_controller.${ext}`),
    `import { Request, Response } from "express";
import { health_service } from "../services/health_service";

export const health_controller = (_req: Request, res: Response) => {
  res.json(health_service());
};
`,
  );

  fs.writeFileSync(
    path.join(root, `src/services/health_service.${ext}`),
    `export const health_service = () => ({ status: "ok" });
`,
  );

  fs.writeFileSync(
    path.join(root, `src/middleware/health_middleware.${ext}`),
    `import { Request, Response, NextFunction } from "express";

export const health_middleware = (
  _req: Request,
  _res: Response,
  next: NextFunction
) => {
  next();
};
`,
  );

  /* ----------------------------------
     ENV & GITIGNORE
  ----------------------------------- */
  fs.writeFileSync(path.join(root, ".env"), "PORT=5000\n");
  fs.writeFileSync(path.join(root, ".env.example"), "PORT=5000\n");
  fs.writeFileSync(
    path.join(root, ".gitignore"),
    `node_modules
.env
.expresskit
`,
  );

  /* ----------------------------------
     NPM (QUIET + LOADER)
  ----------------------------------- */
  log.info("Installing dependencies");
  const stopLoader = startLoader("Installing packages...");

  execSync("npm init -y", { cwd: root, stdio: "ignore" });

  const pkgPath = path.join(root, "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));

  pkg.scripts = {
    dev: isTS ? "nodemon src/server.ts" : "nodemon src/server.js",
    start: isTS ? "node dist/server.js" : "node src/server.js",
    ...(isTS ? { build: "tsc" } : {}),
  };

  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

  execSync("npm install express cors dotenv morgan --no-fund --no-audit", {
    cwd: root,
    stdio: "ignore",
  });

  execSync("npm install -D nodemon --no-fund --no-audit", {
    cwd: root,
    stdio: "ignore",
  });

  if (isTS) {
    execSync(
      "npm install -D typescript ts-node @types/node @types/express @types/cors @types/morgan --no-fund --no-audit",
      { cwd: root, stdio: "ignore" },
    );

    fs.writeFileSync(
      path.join(root, "tsconfig.json"),
      JSON.stringify(
        {
          compilerOptions: {
            target: "ES2020",
            module: "CommonJS",
            rootDir: "src",
            outDir: "dist",
            strict: true,
            esModuleInterop: true,
          },
        },
        null,
        2,
      ),
    );
  }

  stopLoader();
  log.success("Dependencies installed");

  console.log("\n✅ ExpressKit ready. Magic enabled ✨\n");
}
