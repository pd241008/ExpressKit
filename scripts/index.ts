#!/usr/bin/env node
import { run } from "./expresskit_v1.js";

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

run();
