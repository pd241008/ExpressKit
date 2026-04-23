# ⚡ ExpressKit

**The Opinionated Backend Starter for Express.js**

[![npm version](https://img.shields.io/npm/v/@pd241008/expresskit.svg)](https://www.npmjs.com/package/@pd241008/expresskit)
[![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg)](https://opensource.org/licenses/ISC)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/Tests-11%20passed-brightgreen.svg)](#-testing)

---

## 📌 What is ExpressKit?

**ExpressKit** is a production-ready, opinionated framework wrapper for Express.js.

It aims to do for backend development **what Next.js did for frontend**.

Instead of starting every Express project by debating folder structures, configuring TypeScript, and wiring up boilerplate middleware, ExpressKit gives you a **structured, scalable foundation out of the box**.

> **Philosophy:** Express is unopinionated. ExpressKit is opinionated so you don't have to be.

---

## 🚀 Quick Start

You can use ExpressKit immediately without installing anything, or install it globally for frequent use.

### Option 1: Interactive Init (Recommended)

No installation required. This ensures you always use the latest version.

```bash
npx @pd241008/expresskit init
```

### Option 2: Global Install

Useful if you plan to generate many projects and want the command available everywhere.

```bash
npm install -g @pd241008/expresskit

# Then run:
expresskit init
```

---

## 🎯 Why ExpressKit?

Every new Express project usually suffers from "Decision Fatigue": Where do controllers go? How do I structure services? How do I manage config?

ExpressKit solves this by enforcing battle-tested conventions.

| Feature           | Standard Express       | ExpressKit                |
| ----------------- | ---------------------- | ------------------------- |
| Project Structure | Empty Folder           | Convention-based          |
| Architecture      | Ad-hoc                 | Controller → Service      |
| Config            | `process.env` chaos    | Centralized Config        |
| Language          | JS / manual TS         | TypeScript-first          |
| Error Handling    | `try/catch` everywhere | Global Error Layer        |
| Validation        | Manual                 | Zod-powered, auto-formatted |
| Team Onboarding   | Clone & pray           | `postinstall` auto-sync   |

---

## 🏗️ High-Level Architecture

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

---

## 📁 Project Structure

When you initialize a project, ExpressKit generates this scalable structure:

```
my-project/
├── src/
│   ├── app.ts                 # App bootstrap & middleware
│   ├── server.ts              # Server entry point
│   ├── config/
│   │   ├── expresskit.config.ts   # User-facing configuration
│   │   └── expresskit.bridge.ts   # Framework bridge (auto-generated)
│   ├── routes/                # Convention-based route definitions
│   │   └── health/
│   │       └── route.ts
│   ├── controllers/           # Request handlers (I/O only)
│   ├── services/              # Business logic
│   ├── middleware/             # Custom Express middleware
│   ├── models/                # Database models
│   └── utils/                 # Helper utilities
├── .expresskit/               # 🔒 Framework internals (git-ignored)
│   ├── error_handling/
│   │   ├── AppError.ts        # Operational error class
│   │   ├── catchAsync.ts      # Async wrapper (no try/catch needed)
│   │   └── handler.ts         # Global error middleware + Zod support
│   ├── route_loader.ts        # Dynamic filesystem route scanner
│   └── default_route.ts       # Default framework route
├── .env
├── .gitignore
├── package.json
└── tsconfig.json
```

---

## 🛠️ Features

### TypeScript Native
Built for type safety from day one. Full `tsconfig.json` pre-configured.

### Controller–Service Pattern
Clean separation of concerns. Controllers handle HTTP I/O, services handle business logic.

### Centralized Configuration
One place for environment and app config via `expresskit.config.ts`.

### 🆕 Global Error Handling & Zod Validation

ExpressKit v1.5.0 introduces a centralized error-handling architecture scaffolded into every new project:

- **`AppError`** — An operational error class extending native `Error` with `statusCode` and `isOperational` properties.
- **`catchAsync`** — A lightweight wrapper that eliminates `try/catch` blocks in every controller:
  ```typescript
  // Before (manual)
  export const getUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await userService.find(req.params.id);
      res.json(user);
    } catch (err) {
      next(err);
    }
  };

  // After (with catchAsync)
  export const getUser = catchAsync(async (req, res) => {
    const user = await userService.find(req.params.id);
    res.json(user);
  });
  ```
- **Global Error Middleware** — Automatically intercepts all errors. When a **Zod validation error** is thrown, it extracts the exact fields and messages into a clean JSON response:
  ```json
  {
    "success": false,
    "error": {
      "message": "Validation Error",
      "details": [
        { "field": "email", "message": "Invalid email" },
        { "field": "age", "message": "Number must be greater than or equal to 18" }
      ]
    }
  }
  ```

### 🆕 Bridge Architecture & Auto-Sync

Framework logic lives in `.expresskit/`, keeping your application code clean. These files are **git-ignored** by design.

When another developer clones your project, the bridge files are automatically rebuilt:

```bash
# Happens automatically via the postinstall hook:
npx @pd241008/expresskit sync
```

This means `npm install` on a freshly cloned repo will regenerate all missing `.expresskit/` files — **zero manual setup required**.

---

## 📡 CLI Commands

| Command                             | Description                                      |
| ----------------------------------- | ------------------------------------------------ |
| `npx @pd241008/expresskit init`     | Scaffold a new ExpressKit project interactively   |
| `npx @pd241008/expresskit sync`     | Regenerate `.expresskit/` bridge files            |

---

## 🧪 Testing

ExpressKit ships with a comprehensive Jest test suite covering the CLI and runtime systems.

```bash
npm test
```

| Test Suite           | Type        | What it validates                                          |
| -------------------- | ----------- | ---------------------------------------------------------- |
| `cli/init.test.ts`   | E2E         | Full project scaffolding, `package.json`, directory layout |
| `cli/sync.test.ts`   | E2E         | Bridge file regeneration from a clean clone                |
| `runtime/error_handler.test.ts` | Integration | `AppError`, `catchAsync`, ZodError formatting   |
| `runtime/router.test.ts`       | Integration | Dynamic route loader mounting controllers       |
| `runtime/config.test.ts`       | Unit        | Config defaults and environment overrides       |
| `runtime/server.test.ts`       | Integration | Full stack smoke test (Config → Router → Response) |

---

## 🧭 Roadmap

### Phase 1: Core Framework ✅
- [x] CLI for rapid scaffolding (`expresskit init`)
- [x] Standardized folder structure
- [x] Controller–Service architecture
- [x] Centralized config system
- [x] Global error handling with Zod validation
- [x] Bridge file auto-sync (`expresskit sync`)
- [x] Comprehensive Jest test suite

### Phase 2: Developer Experience 🚧
- [ ] Auth presets (JWT, Auth0)
- [ ] ORM integrations (Prisma, Mongoose)
- [ ] Advanced logging (Winston, Pino)

### Phase 3: Ecosystem 🚀
- [ ] Microservice mode
- [ ] API Gateway patterns
- [ ] Code generators (`expresskit make:route`)

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to your branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 👨‍💻 Author

**Prathmesh Desai**

- [GitHub](https://github.com/pd241008)
- [NPM](https://www.npmjs.com/~pd241008)

---

<p align="center"> Built with ❤️ for the Node.js Community </p>
