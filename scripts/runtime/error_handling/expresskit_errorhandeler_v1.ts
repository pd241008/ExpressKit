import fs from "fs";
import path from "path";

/**
 * Generates the v1 Error Handling System.
 * Creates: .expresskit/error_handling/handler.ts
 */
export function generateErrorSystem(root: string, ext: "ts" | "js") {
  // 1. Create the hidden folder inside .expresskit
  const errorDir = path.join(root, ".expresskit/error_handling");
  if (!fs.existsSync(errorDir)) fs.mkdirSync(errorDir, { recursive: true });

  // 2. The Content (Your custom logic)
  const errorHandlerContent = `import { Request, Response, NextFunction } from "express";

/**
 * ExpressKit Global Error Handler v1
 * Centralized, opinionated, production-safe
 */
export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const status = err.status || err.statusCode || 500;

  const payload = {
    success: false,
    error: {
      message:
        status === 500
          ? "Internal Server Error"
          : err.message || "Something went wrong",
      ...(process.env.NODE_ENV !== "production" && {
        stack: err.stack,
      }),
    },
  };

  res.status(status).json(payload);
}
`;

  // 3. Write the file
  fs.writeFileSync(path.join(errorDir, `handler.${ext}`), errorHandlerContent);
}
