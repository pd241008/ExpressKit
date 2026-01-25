"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCoreSystem = generateCoreSystem;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function generateCoreSystem(root, ext) {
    // 1. app.ts (Updated Import)
    fs_1.default.writeFileSync(path_1.default.join(root, `src/app.${ext}`), `import express from "express";
import cors from "cors";
import morgan from "morgan";
// Import everything from the Bridge
import { loadExpressKit, ExpressKitError } from "./config/expresskit.bridge";

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

loadExpressKit(app);


app.use(ExpressKitError);

export default app;
`);
    fs_1.default.writeFileSync(path_1.default.join(root, `src/server.${ext}`), `import dotenv from "dotenv";
import app from "./app";

dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(\`🚀 Server running on port \${PORT}\`);
});
`);
}
