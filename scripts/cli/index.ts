#!/usr/bin/env node
import { run as init } from "./init";
import { run as sync } from "./sync";

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
  init();
} else if (command === "sync" || command === "build-bridge") {
  sync();
} else {
  console.error(`❌ Unknown command: ${command}`);
  console.log(`Available commands: init, sync`);
  process.exit(1);
}
