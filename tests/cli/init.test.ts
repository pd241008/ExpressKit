import fs from "fs";
import path from "path";
import os from "os";
import { execSync } from "child_process";

describe("CLI Init Command (E2E)", () => {
  let tempDir: string;
  let cliPath: string;
  let mockInquirerPath: string;

  beforeAll(() => {
    cliPath = path.resolve(__dirname, "../../scripts/cli/index.ts");
    
    // We create tempDir inside workspace tests to avoid node module resolution issues
    tempDir = fs.mkdtempSync(path.join(process.cwd(), "tests", "temp-init-"));

    // Create a mock file to intercept `inquirer.prompt` because E2E tests cannot easily pipe to TTY list prompts
    mockInquirerPath = path.join(tempDir, "mock-inquirer.js");
    fs.writeFileSync(mockInquirerPath, `
      const Module = require('module');
      const originalRequire = Module.prototype.require;
      Module.prototype.require = function(id) {
        if (id === 'inquirer') {
          return {
            prompt: async () => ({ projectName: 'test-project', language: 'ts' })
          };
        }
        return originalRequire.apply(this, arguments);
      };
    `);
  });

  afterAll(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it("should successfully run the init command and scaffold the project", () => {
    // 1. Execute the command
    // We use node with -r to preload our mock-inquirer.js before executing ts-node
    const command = `npx ts-node -r ./mock-inquirer.js ${cliPath} init`;
    
    let output = "";
    try {
      output = execSync(command, { cwd: tempDir, encoding: "utf8", stdio: "pipe" });
    } catch (error: any) {
      console.error("Init command failed with output:", error.stdout?.toString());
      throw error;
    }

    // 2. Assertions
    expect(output).toContain("ExpressKit ready. Magic enabled ✨");

    const projectRoot = path.join(tempDir, "test-project");
    expect(fs.existsSync(projectRoot)).toBe(true);

    // Verify package.json
    const pkgPath = path.join(projectRoot, "package.json");
    expect(fs.existsSync(pkgPath)).toBe(true);
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
    
    expect(pkg.scripts.postinstall).toBe("npx @pd241008/expresskit sync");
    
    // Verify tsconfig.json is generated (because we mocked language: 'ts')
    expect(fs.existsSync(path.join(projectRoot, "tsconfig.json"))).toBe(true);

    // Verify the user space directories
    expect(fs.existsSync(path.join(projectRoot, "src/controllers"))).toBe(true);
    expect(fs.existsSync(path.join(projectRoot, "src/services"))).toBe(true);
    expect(fs.existsSync(path.join(projectRoot, "src/middleware"))).toBe(true);
    expect(fs.existsSync(path.join(projectRoot, "src/routes/health"))).toBe(true);
    
    // Verify the bridge directory
    const expressKitDir = path.join(projectRoot, ".expresskit");
    expect(fs.existsSync(expressKitDir)).toBe(true);
    expect(fs.existsSync(path.join(expressKitDir, "error_handling"))).toBe(true);
  }, 30000); // 30 seconds timeout because npm install takes time
});
