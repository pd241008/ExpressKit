#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import inquirer from "inquirer";

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

function createProject(projectName: string, language: "ts" | "js") {
  const root = path.join(process.cwd(), projectName);
  const isTS = language === "ts";
  const ext = isTS ? "ts" : "js";

  if (fs.existsSync(root)) {
    console.error(`❌ Folder "${projectName}" already exists`);
    return;
  }

  const dirs = [
    "src/config",
    "src/routes",
    "src/controllers",
    "src/services",
    "src/models",
    "src/middleware",
    "src/utils",
  ];

  console.log("🚀 Creating ExpressKit project...");

  fs.mkdirSync(root, { recursive: true });
  dirs.forEach((dir) =>
    fs.mkdirSync(path.join(root, dir), { recursive: true }),
  );

  // app file
  fs.writeFileSync(
    path.join(root, `src/app.${ext}`),
    `import express from "express";
import cors from "cors";
import morgan from "morgan";

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

export default app;
`,
  );

  // server file
  fs.writeFileSync(
    path.join(root, `src/server.${ext}`),
    `import dotenv from "dotenv";
import app from "./app.${ext}";

dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(\`🚀 Server running on port \${PORT}\`);
});
`,
  );

  // health route
  fs.writeFileSync(
    path.join(root, `src/routes/health.routes.${ext}`),
    `import { Router } from "express";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

export default router;
`,
  );

  // env + git
  fs.writeFileSync(path.join(root, ".env"), "PORT=5000\n");
  fs.writeFileSync(path.join(root, ".env.example"), "PORT=5000\n");
  fs.writeFileSync(path.join(root, ".gitignore"), "node_modules\n.env\n");

  // init npm
  execSync("npm init -y", { cwd: root, stdio: "inherit" });

  // update package.json scripts
  const pkgPath = path.join(root, "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));

  pkg.scripts = {
    dev: isTS ? "nodemon src/server.ts" : "nodemon src/server.js",
    start: isTS ? "node dist/server.js" : "node src/server.js",
    ...(isTS ? { build: "tsc" } : {}),
  };

  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

  // dependencies
  execSync("npm install express cors dotenv morgan", {
    cwd: root,
    stdio: "inherit",
  });

  execSync("npm install -D nodemon", { cwd: root, stdio: "inherit" });

  // typescript setup
  if (isTS) {
    execSync(
      "npm install -D typescript ts-node @types/node @types/express @types/cors @types/morgan",
      { cwd: root, stdio: "inherit" },
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

  console.log(`✅ ExpressKit ready! (${language.toUpperCase()})`);
}
