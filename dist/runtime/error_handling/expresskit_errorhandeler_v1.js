"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateErrorSystem = generateErrorSystem;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
/**
 * Generates the v1 Error Handling System.
 * Creates: .expresskit/error_handling/handler.ts
 */
function generateErrorSystem(root, ext) {
    // 1. Create the hidden folder inside .expresskit
    const errorDir = path_1.default.join(root, ".expresskit/error_handling");
    if (!fs_1.default.existsSync(errorDir))
        fs_1.default.mkdirSync(errorDir, { recursive: true });
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
    fs_1.default.writeFileSync(path_1.default.join(errorDir, `handler.${ext}`), errorHandlerContent);
}
