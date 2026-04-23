import fs from "fs";
import path from "path";
import express from "express";
import request from "supertest";
import { generateRouteSystem } from "../../scripts/runtime/route_handling/expresskit_router_v1";

describe("Runtime Route System (Integration)", () => {
  let tempDir: string;
  let expressKitDir: string;
  let srcRoutesDir: string;
  let loadRoutes: any;

  beforeAll(async () => {
    tempDir = fs.mkdtempSync(path.join(process.cwd(), "tests", "temp-router-"));
    expressKitDir = path.join(tempDir, ".expresskit");
    srcRoutesDir = path.join(tempDir, "src", "routes");

    // Create required directories
    fs.mkdirSync(srcRoutesDir, { recursive: true });

    // Mock ExpressKitConfig because route_loader.ts imports it from ../src/config/expresskit.config
    const configDir = path.join(tempDir, "src", "config");
    fs.mkdirSync(configDir, { recursive: true });
    fs.writeFileSync(
      path.join(configDir, "expresskit.config.ts"),
      `export const ExpressKitConfig = { routePrefix: '/api/v1' };`
    );

    // Generate Route system
    generateRouteSystem(tempDir, "ts");

    // Create a mock route in the user space
    const mockRouteDir = path.join(srcRoutesDir, "testmock");
    fs.mkdirSync(mockRouteDir, { recursive: true });
    fs.writeFileSync(
      path.join(mockRouteDir, "route.ts"),
      `
      import { Router } from "express";
      const router = Router();
      router.get("/", (req, res) => res.json({ success: true, message: "Mock route hit" }));
      export default router;
      `
    );

    // Dynamically import the generated load_routes function
    loadRoutes = (await import(path.join(expressKitDir, "route_loader.ts"))).load_routes;
  });

  afterAll(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it("should dynamically load routes and mount them to the Express app", async () => {
    const app = express();
    
    // Execute the generated route loader
    await loadRoutes(app, srcRoutesDir);

    // Hit the endpoint that should have been dynamically mounted
    const res = await request(app).get("/api/v1/testmock");
    
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      success: true,
      message: "Mock route hit"
    });
  });
});
