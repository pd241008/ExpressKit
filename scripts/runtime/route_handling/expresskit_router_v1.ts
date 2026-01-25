import fs from "fs";
import path from "path";

export function generateRouteSystem(root: string, ext: "ts" | "js") {
  const expressKitDir = path.join(root, ".expresskit");
  if (!fs.existsSync(expressKitDir))
    fs.mkdirSync(expressKitDir, { recursive: true });

  // 1. Route Loader
  const routeLoaderContent = `import fs from "fs";
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
`;

  // 2. Default Route
  const defaultRouteContent = `import { Router } from "express";
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
`;

  fs.writeFileSync(
    path.join(expressKitDir, `route_loader.${ext}`),
    routeLoaderContent,
  );
  fs.writeFileSync(
    path.join(expressKitDir, `default_route.${ext}`),
    defaultRouteContent,
  );
}
