"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateConfigSystem = generateConfigSystem;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function generateConfigSystem(root, ext) {
    const configDir = path_1.default.join(root, "src/config");
    if (!fs_1.default.existsSync(configDir))
        fs_1.default.mkdirSync(configDir, { recursive: true });
    // 1. User Config
    fs_1.default.writeFileSync(path_1.default.join(configDir, `expresskit.config.${ext}`), `export const ExpressKitConfig = {
  routePrefix: "/api",
  defaultRouteMessage: "⚡ ExpressKit is alive",
  loadRoutesFrom: "src/routes",
};
`);
    // 2. The Bridge (Updated to export Error Handler)
    fs_1.default.writeFileSync(path_1.default.join(configDir, `expresskit.bridge.${ext}`), `import path from "path";
import { Express } from "express";
import { ExpressKitConfig } from "./expresskit.config";

// RE-EXPORT THE ERROR HANDLER HERE
// This abstracts the ugly path away from the user
export { errorHandler as ExpressKitError } from "../../.expresskit/error_handling/handler";

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
`);
}
