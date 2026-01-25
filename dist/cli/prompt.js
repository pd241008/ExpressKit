"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.promptInit = promptInit;
const inquirer_1 = __importDefault(require("inquirer"));
async function promptInit() {
    return inquirer_1.default.prompt([
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
