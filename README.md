# ⚡ ExpressKit

**The Opinionated Backend Starter for Express.js**

[![npm version](https://img.shields.io/npm/v/@pd241008/expresskit.svg)](https://www.npmjs.com/package/@pd241008/expresskit)
[![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg)](https://opensource.org/licenses/ISC)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)

---

## 📌 What is ExpressKit?

**ExpressKit** is a production-ready, opinionated framework wrapper for Express.js.

It aims to do for backend development **what Next.js did for frontend**.

Instead of starting every Express project by debating folder structures, configuring TypeScript, and wiring up boilerplate middleware, ExpressKit gives you a **structured, scalable foundation out of the box**.

> **Philosophy:** Express is unopinionated. ExpressKit is opinionated so you don’t have to be.

---

## 🚀 Quick Start

You can use ExpressKit immediately without installing anything, or install it globally for frequent use.

### Option 1: Interactive Init (Recommended)

No installation required. This ensures you always use the latest version.

```bash
npx @pd241008/expresskit init
```

Option 2: Global Install
Useful if you plan to generate many projects and want the command available everywhere.

```bash
npm install -g @pd241008/expresskit

# Then run:
expresskit init
```

🎯 Why ExpressKit?
Every new Express project usually suffers from "Decision Fatigue": Where do controllers go? How do I structure services? How do I manage config?

ExpressKit solves this by enforcing battle-tested conventions.

---

|Feature |Standard Express|ExpressKit |
|Project Structure,DIY |Empty Folder |Convention-based |
|Architecture |Ad-hoc |Controller → Service |
|Config |process |env chaos,Centralized Config |
|Language |JS |manual TS,TypeScript-first |
|Error Handling | |try/catch everywhere,Global Error Layer |

---

🏗️ High-Level Architecture
ExpressKit enforces a strict unidirectional flow, making your backend predictable and scalable.

```
Request
  ↓
Global Middleware (Auth / Validation)
  ↓
Controller (HTTP Layer – No Business Logic)
  ↓
Service (Business Logic Layer)
  ↓
Data / External APIs
  ↓
Standardized Response
```

📁 Project Structure
When you initialize a project, ExpressKit generates this scalable structure:

```bash
src/
├─ app.ts             # App bootstrap & middleware
├─ server.ts          # Server entry point
├─ config/            # Centralized environment config
├─ routes/            # Route definitions
├─ controllers/       # Request handlers (I/O only)
├─ services/          # Business logic
├─ middleware/        # Custom Express middleware
├─ models/            # Database models
├─ utils/             # Helper utilities
└─ types/             # Shared TypeScript types
```

🛠️ Features
TypeScript Native: Built for type safety from day one.

Controller–Service Pattern: Clean separation of concerns.

Centralized Configuration: One place for env & app config.

Global Error Handling: No more async try/catch hell.

Bridge Architecture: Framework logic lives in .expresskit, keeping your app clean.

🧭 Roadmap
Phase 1: Core Framework ✅
```
[x] CLI for rapid scaffolding (expresskit init)

[x] Standardized folder structure

[x] Controller–Service architecture

[x] Centralized config system
```
Phase 2: Developer Experience 🚧
```
[ ] Auth presets (JWT, Auth0)

[ ] ORM integrations (Prisma, Mongoose)

[ ] Advanced logging (Winston, Pino)
```
Phase 3: Ecosystem 🚀
```
[ ] Microservice mode

[ ] API Gateway patterns

[ ] Code generators (expresskit make:route)
```
🤝 Contributing
```
Contributions are welcome!

Fork the repository

Create a feature branch

Commit your changes

Push to your branch

Open a Pull Request
```
👨‍💻 Author
```
Prathmesh Desai
```
```
GitHub

NPM
```
<p align="center"> Built with ❤️ for the Node.js Community </p>
