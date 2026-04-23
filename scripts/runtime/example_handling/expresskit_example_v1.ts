import fs from "fs";
import path from "path";

export function generateExampleSystem(root: string, ext: "ts" | "js") {
  // 1. Controller
  fs.writeFileSync(
    path.join(root, `src/controllers/health_controller.${ext}`),
    `import { Request, Response } from "express";
import { health_service } from "../services/health_service";

export const health_controller = (_req: Request, res: Response) => {
  res.json(health_service());
};
`,
  );

  // 2. Service
  fs.writeFileSync(
    path.join(root, `src/services/health_service.${ext}`),
    `export const health_service = () => ({ status: "ok" });
`,
  );

  // 3. Middleware
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

  // 4. Route
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
}
