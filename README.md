# AAU Redesign

[![CI](https://github.com/dismount8645/FINAL-AAU-REDESIGN/actions/workflows/ci.yml/badge.svg)](https://github.com/dismount8645/FINAL-AAU-REDESIGN/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://react.dev/)

Modern React + TypeScript student portal for Aalborg University.  
Replaces Moodle frontend with responsive dashboard, course overview, calendar, and messaging.

## Prerequisites

- **Node.js**: Version 20.x or higher (see `.nvmrc`)
- **npm**: Version 10.x or higher
- **Git**

> **Host Environment Note**: Node.js and npm must be available on your system `PATH` to install dependencies and run build/test scripts. If using `nvm` (Node Version Manager):
> ```bash
> nvm use 20
> # or: nvm install 20
> ```

## Quick Start

```bash
# 1. Verify Node.js version
node --version   # Output should be >= 20.0.0

# 2. Install dependencies (uses clean lockfile)
npm install

# 3. Configure local environment variables
cp .env.example .env

# 4. Start local development server
npm run dev      # Opens at http://localhost:3000
```

## Scripts

| Command | Action | Description |
|---------|--------|-------------|
| `npm run dev` | Development Server | Starts Vite dev server with hot module replacement at `localhost:3000` |
| `npm run build` | Production Build | Compiles TypeScript and bundles production assets into `dist/` |
| `npm test` | Unit & Component Tests | Runs full Vitest suite (`client/src` and `tests/`) |
| `npm run lint` | Full Lint Suite | Runs TypeScript typecheck (`tsc`) and ESLint (`client/eslint.config.js`) |
| `npm run lint:tsc` | TypeScript Check | Typechecks codebase via `tsc --noEmit` |
| `npm run lint:eslint` | ESLint Check | Lints TypeScript/React source code using ESLint |
| `npm run knip` | Dead Code Audit | Detects unused exports, files, and dependencies |
| `npm run preview` | Preview Build | Previews production build locally |
| `npm run clean` | Clean Artifacts | Deletes `dist/` directory and stats files |
| `npm run deep-clean` | Deep Clean | Cleans `dist/`, removes `node_modules/`, and runs fresh `npm install` |

## Project Structure

```text
FINAL-AAU-REDESIGN/
├── client/
│   ├── eslint.config.js # Modern flat ESLint configuration
│   ├── tsconfig.json    # Strict TypeScript client configuration
│   └── src/
│       ├── components/  # UI primitives, layout, and widgets
│       ├── config/      # Settings categories
│       ├── hooks/       # Custom React hooks
│       ├── lib/         # Utils, schemas, translations, types
│       ├── pages/       # Route pages (dashboard, courses, calendar…)
│       ├── store/       # Zustand state management
│       └── test/        # Shared setup & test utilities
├── tests/               # Additional integration and unit tests
├── knip.json            # Dead code and unused dependency configuration
├── package.json         # Workspace manifests and script commands
└── vite.config.ts       # Vite bundler configuration
```

## Tech Stack

React 18 · TypeScript · Vite · TailwindCSS v4 · Zustand · Vitest · Playwright · Lucide

## License

[MIT](LICENSE) — see `package.json`.
