#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const expresskit_v1_js_1 = require("./expresskit_v1.js");
const args = process.argv.slice(2);
/* ----------------------------------
   Safety Net (UX Guard)
----------------------------------- */
if (args.length === 0) {
    console.log(`
🚀 ExpressKit – Express.js Project Generator

This is a CLI tool and must be run with a command.

👉 To get started, run:

  npx @pd241008/expresskit init

or (recommended):

  npm create expresskit

Optional global install:

  npm install -g @pd241008/expresskit
  expresskit init
`);
    process.exit(0);
}
(0, expresskit_v1_js_1.run)();
