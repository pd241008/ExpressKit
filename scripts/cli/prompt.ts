import inquirer from "inquirer";

export async function promptInit() {
  return inquirer.prompt([
    {
      type: "input",
      name: "projectName",
      message: "📦 Project name",
      default: "express-backend",
    },
    {
      type: "list",
      name: "language",
      message: "🧠 Choose language",
      choices: [
        { name: "TypeScript", value: "ts" },
        { name: "JavaScript", value: "js" },
      ],
      default: "ts",
    },
  ]);
}
