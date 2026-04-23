import fs from "fs";
import path from "path";

export function generateCoreSystem(root: string, ext: "ts" | "js") {
  // 1. app.ts (Updated Import)
  fs.writeFileSync(
    path.join(root, `src/app.${ext}`),
    `import express from "express";
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
`,
  );

  fs.writeFileSync(
    path.join(root, `src/server.${ext}`),
    `import dotenv from "dotenv";
import app from "./app";

dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(\`🚀 Server running on port \${PORT}\`);
});
`,
  );
}
