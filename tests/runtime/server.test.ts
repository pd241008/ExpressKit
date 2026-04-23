import fs from "fs";
import path from "path";
import request from "supertest";

import { generateConfigSystem } from "../../scripts/runtime/config_handling/expresskit_config_v1";
import { generateRouteSystem } from "../../scripts/runtime/route_handling/expresskit_router_v1";
import { generateErrorSystem } from "../../scripts/runtime/error_handling/expresskit_errorhandeler_v1";
import { generateCoreSystem } from "../../scripts/runtime/core_handling/expresskit_core_v1";
import { generateExampleSystem } from "../../scripts/runtime/example_handling/expresskit_example_v1";

describe("Runtime Core Server (Integration)", () => {
  let tempDir: string;
  let app: any;

  beforeAll(async () => {
    tempDir = fs.mkdtempSync(path.join(process.cwd(), "tests", "temp-server-"));

    // Create required user directories that generateExampleSystem expects
    const userDirs = [
      "src/config",
      "src/controllers",
      "src/services",
      "src/middleware",
      "src/models",
      "src/utils",
      "src/routes/health",
    ];
    userDirs.forEach((dir) => fs.mkdirSync(path.join(tempDir, dir), { recursive: true }));

    // Generate the full runtime payload
    generateConfigSystem(tempDir, "ts");
    generateRouteSystem(tempDir, "ts");
    generateErrorSystem(tempDir, "ts");
    generateCoreSystem(tempDir, "ts");
    generateExampleSystem(tempDir, "ts");

    // The generated loadExpressKit bridge uses process.cwd() to resolve `.expresskit` and `src/routes`.
    // Since we are running Jest from the project root, it will look in the workspace root instead of tempDir.
    // To fix this without modifying the core, we can temporarily mock process.cwd() just for the app load.
    const originalCwd = process.cwd;
    process.cwd = () => tempDir;



    try {
      // Import the generated app.ts (which exports the Express app without calling listen)
      // We don't import server.ts to avoid EADDRINUSE and hanging the test suite.
      const appModule = await import(path.join(tempDir, "src", "app.ts"));
      app = appModule.default;

      // The core app.ts calls loadExpressKit(app) asynchronously without awaiting it.
      // We must wait a short tick for the dynamic route loader to finish reading the FS and mounting routes.
      await new Promise((resolve) => setTimeout(resolve, 500));
    } finally {
      // Restore process.cwd immediately
      process.cwd = originalCwd;
    }
  });

  afterAll(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it("should successfully boot the entire stack and respond to the health check", async () => {
    // Hit the generated example route which should be mounted at /api/health
    const res = await request(app).get("/api/health");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      status: "ok"
    });
  });

  it("should respond to the default framework route", async () => {
    // The route system also generates a default route mounted at the root
    const res = await request(app).get("/");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(
      expect.objectContaining({
        framework: "ExpressKit",
        status: "running"
      })
    );
  });
});
