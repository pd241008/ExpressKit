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

Get a production-grade backend running in seconds using the CLI.

### Interactive Init (Recommended)

````bash
npx @pd241008/expresskit init
Global Install (Optional)
npm install -g @pd241008/expresskit
expresskit init
🎯 Why ExpressKit?
Every new Express project usually suffers from Decision Fatigue:

Where do controllers go?

How do I structure services?

How should errors be handled?

How do I manage environment config cleanly?

ExpressKit solves this by enforcing battle-tested conventions.

Feature	Standard Express	ExpressKit
Project Structure	DIY / Empty Folder	Convention-based
Architecture	Ad-hoc	Controller → Service
Config	process.env chaos	Centralized Config
Language	JS / manual TS	TypeScript-first
Error Handling	try/catch everywhere	Global Error Layer
🏗️ High-Level Architecture
ExpressKit enforces a strict unidirectional flow, making your backend predictable and scalable.

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
📁 Project Structure
When you initialize a project, ExpressKit generates:

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
🛠️ Features
TypeScript Native – Built for type safety from day one

Controller–Service Pattern – Clean separation of concerns

Centralized Configuration – One place for env & app config

Global Error Handling – No more async try/catch hell

Bridge Architecture – Framework logic lives in .expresskit, your app stays clean

🧭 Roadmap
Phase 1: Core Framework ✅
 CLI for rapid scaffolding (expresskit init)

 Standardized folder structure

 Controller–Service architecture

 Centralized config system

Phase 2: Developer Experience 🚧
 Auth presets (JWT, Auth0)

 ORM integrations (Prisma, Mongoose)

 Advanced logging (Winston, Pino)

Phase 3: Ecosystem 🚀
 Microservice mode

 API Gateway patterns

 Code generators (expresskit make:route)

🤝 Contributing
Contributions are welcome!

Fork the repository

Create a feature branch

Commit your changes

Push to your branch

Open a Pull Request

👨‍💻 Author
Prathmesh Desai

GitHub: https://github.com/pd241008

npm: https://www.npmjs.com/~pd241008



Built with ❤️ for the Node.js 

