"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateExampleSystem = generateExampleSystem;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function generateExampleSystem(root, ext) {
    // 1. Controller
    fs_1.default.writeFileSync(path_1.default.join(root, `src/controllers/health_controller.${ext}`), `import { Request, Response } from "express";
import { health_service } from "../services/health_service";

export const health_controller = (_req: Request, res: Response) => {
  res.json(health_service());
};
`);
    // 2. Service
    fs_1.default.writeFileSync(path_1.default.join(root, `src/services/health_service.${ext}`), `export const health_service = () => ({ status: "ok" });
`);
    // 3. Middleware
    fs_1.default.writeFileSync(path_1.default.join(root, `src/middleware/health_middleware.${ext}`), `import { Request, Response, NextFunction } from "express";

export const health_middleware = (
  _req: Request,
  _res: Response,
  next: NextFunction
) => {
  next();
};
`);
    // 4. Route
    fs_1.default.writeFileSync(path_1.default.join(root, `src/routes/health/route.${ext}`), `import { Router } from "express";
import { health_controller } from "../../controllers/health_controller";
import { health_middleware } from "../../middleware/health_middleware";

const router = Router();

router.get("/", health_middleware, health_controller);

export default router;
`);
}
