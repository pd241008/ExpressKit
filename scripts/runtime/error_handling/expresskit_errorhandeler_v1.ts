import fs from "fs";
import path from "path";

/**
 * Generates the v1 Error Handling System.
 * Creates: .expresskit/error_handling/handler.ts, AppError.ts, catchAsync.ts
 */
export function generateErrorSystem(root: string, ext: "ts" | "js") {
  // 1. Create the hidden folder inside .expresskit
  const errorDir = path.join(root, ".expresskit/error_handling");
  if (!fs.existsSync(errorDir)) fs.mkdirSync(errorDir, { recursive: true });

  // 2. The Content (Your custom logic)
  const appErrorContent = `export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}
`;

  const catchAsyncContent = `import { Request, Response, NextFunction } from "express";

export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
`;

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
  if (err.name === 'ZodError') {
    const zodIssues = err.issues || err.errors || [];
    const formattedErrors = zodIssues.map((e: any) => ({
      field: e.path.join('.'),
      message: e.message,
    }));

    res.status(400).json({
      success: false,
      error: {
        message: "Validation Error",
        details: formattedErrors,
      },
    });
    return;
  }

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

  // 3. Write the files
  fs.writeFileSync(path.join(errorDir, `AppError.${ext}`), appErrorContent);
  fs.writeFileSync(path.join(errorDir, `catchAsync.${ext}`), catchAsyncContent);
  fs.writeFileSync(path.join(errorDir, `handler.${ext}`), errorHandlerContent);
}
