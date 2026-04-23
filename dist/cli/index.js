#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const init_1 = require("./init");
const sync_1 = require("./sync");
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

👉 To regenerate bridge files (if missing after cloning):

  npx @pd241008/expresskit sync

Optional global install:

  npm install -g @pd241008/expresskit
  expresskit init
`);
    process.exit(0);
}
const command = args[0];
if (command === "init") {
    (0, init_1.run)();
}
else if (command === "sync" || command === "build-bridge") {
    (0, sync_1.run)();
}
else {
    console.error(`❌ Unknown command: ${command}`);
    console.log(`Available commands: init, sync`);
    process.exit(1);
}
