import fs from "fs";
import path from "path";
import os from "os";
import { execSync } from "child_process";

describe("CLI Sync Command (E2E)", () => {
  let tempDir: string;
  let cliPath: string;

  beforeAll(() => {
    // Determine the absolute path to the CLI index file
    cliPath = path.resolve(__dirname, "../../scripts/cli/index.ts");
    
    // Create a temporary project directory
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "expresskit-sync-test-"));
  });

  afterAll(() => {
    // Cleanup temporary directory
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it("should successfully run the sync command and generate bridge files", () => {
    // 1. Setup minimal dummy project environment
    // We need package.json and tsconfig.json so the sync command detects a valid TS project
    fs.writeFileSync(path.join(tempDir, "package.json"), JSON.stringify({ name: "test-app" }));
    fs.writeFileSync(path.join(tempDir, "tsconfig.json"), JSON.stringify({}));
    
    // Create the directories that generateExampleSystem expects to exist
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

    // 2. Execute the sync command using ts-node inside the temp directory
    // We use ts-node because index.ts is a TypeScript file.
    const command = `npx ts-node ${cliPath} sync`;
    
    // We catch the buffer so we don't output to console during tests unless there's an error
    let output = "";
    try {
      output = execSync(command, { cwd: tempDir, encoding: "utf8", stdio: "pipe" });
    } catch (error: any) {
      console.error("Command failed with output:", error.stdout?.toString());
      throw error;
    }

    // 3. Assertions
    // Ensure the output contains success message
    expect(output).toContain("Successfully rebuilt .expresskit bridge files");

    // Ensure the bridge files were physically generated in the temp directory
    const expressKitDir = path.join(tempDir, ".expresskit");
    
    // Check if the directory exists
    expect(fs.existsSync(expressKitDir)).toBe(true);
    
    // Check specific critical files
    const errorHandlerPath = path.join(expressKitDir, "error_handling", "handler.ts");
    const appErrorPath = path.join(expressKitDir, "error_handling", "AppError.ts");
    const catchAsyncPath = path.join(expressKitDir, "error_handling", "catchAsync.ts");
    const routeLoaderPath = path.join(expressKitDir, "route_loader.ts");

    expect(fs.existsSync(errorHandlerPath)).toBe(true);
    expect(fs.existsSync(appErrorPath)).toBe(true);
    expect(fs.existsSync(catchAsyncPath)).toBe(true);
    expect(fs.existsSync(routeLoaderPath)).toBe(true);
  });
});
