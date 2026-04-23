import fs from "fs";
import path from "path";
import os from "os";
import express from "express";
import request from "supertest";
import { z, ZodError } from "zod";
import { generateErrorSystem } from "../../scripts/runtime/error_handling/expresskit_errorhandeler_v1";

describe("Error Handler Boilerplate", () => {
  let tempDir: string;
  let errorDir: string;
  let AppError: any;
  let catchAsync: any;
  let errorHandler: any;

  beforeAll(async () => {
    // 1. Create a temporary directory for generating the code inside the workspace
    // so that ts-jest can resolve 'express' from the workspace's node_modules.
    tempDir = fs.mkdtempSync(path.join(process.cwd(), "tests", "temp-"));
    
    // 2. Run the generator to create AppError.ts, catchAsync.ts, handler.ts
    generateErrorSystem(tempDir, "ts");
    errorDir = path.join(tempDir, ".expresskit", "error_handling");

    // 3. Dynamically import the generated files.
    // Note: Jest with ts-jest should be able to compile these on the fly.
    AppError = (await import(path.join(errorDir, "AppError.ts"))).AppError;
    catchAsync = (await import(path.join(errorDir, "catchAsync.ts"))).catchAsync;
    errorHandler = (await import(path.join(errorDir, "handler.ts"))).errorHandler;
  });

  afterAll(() => {
    // Cleanup temporary directory
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  describe("AppError", () => {
    it("should correctly assign statusCode, message, and isOperational", () => {
      const err = new AppError("Test error message", 404);
      expect(err.message).toBe("Test error message");
      expect(err.statusCode).toBe(404);
      expect(err.isOperational).toBe(true);
      expect(err).toBeInstanceOf(Error);
    });
  });

  describe("Global Error Handler (E2E with Express)", () => {
    let app: express.Express;

    beforeEach(() => {
      app = express();
      app.use(express.json());
    });

    it("should format standard AppError correctly", async () => {
      // Dummy route wrapping AppError
      app.get(
        "/test-app-error",
        catchAsync(async (_req: express.Request, _res: express.Response) => {
          throw new AppError("Resource not found", 404);
        })
      );

      // Register generated global error handler
      app.use(errorHandler);

      const res = await request(app).get("/test-app-error");

      expect(res.status).toBe(404);
      expect(res.body).toEqual({
        success: false,
        error: expect.objectContaining({
          message: "Resource not found",
        }),
      });
    });

    it("should intercept and format ZodError cleanly", async () => {
      const schema = z.object({
        email: z.string().email(),
        age: z.number().min(18),
      });

      // Dummy route throwing ZodError
      app.post(
        "/test-zod-error",
        catchAsync(async (req: express.Request, _res: express.Response) => {
          schema.parse(req.body);
        })
      );

      // Register generated global error handler
      app.use(errorHandler);

      const res = await request(app).post("/test-zod-error").send({
        email: "invalid-email",
        age: 12,
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toBe("Validation Error");
      expect(res.body.error.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: "email" }),
          expect.objectContaining({ field: "age" }),
        ])
      );
    });

    it("should fallback to 500 for unhandled generic errors", async () => {
      app.get(
        "/test-generic-error",
        catchAsync(async (_req: express.Request, _res: express.Response) => {
          throw new Error("Some unhandled crash");
        })
      );

      app.use(errorHandler);

      const res = await request(app).get("/test-generic-error");

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toBe("Internal Server Error"); // Or "Something went wrong" depending on environment logic
    });
  });
});
