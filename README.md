# AAU Redesign

[![CI](https://github.com/dismount8645/FINAL-AAU-REDESIGN/actions/workflows/ci.yml/badge.svg)](https://github.com/dismount8645/FINAL-AAU-REDESIGN/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://react.dev/)
Modern React + TypeScript student portal for Aalborg University.  
Replaces Moodle frontend with responsive dashboard, course overview, calendar, and messaging.

## Quick start

```bash
node --version   # must match .nvmrc
npm install
cp .env.example .env   # fill secrets (see .env.example)
npm run dev            # → localhost:3000
```

## Scripts

| Command | Action |
|---------|--------|
| `npm run dev` | Dev server |
| `npm run build` | Prod build → `dist/` |
| `npm test` | Vitest tests |
| `npm run lint` | `tsc --noEmit` |
| `npm run preview` | Preview production build |

## Structure

```
client/src/
├── components/   UI primitives + layout + widgets
├── config/       Settings categories
├── hooks/        Custom hooks
├── lib/          Utils, schemas, translations, types
├── pages/        Route pages (dashboard, courses, calendar…)
├── store/        Zustand state (slices per domain)
└── test/         Shared setup + test utils
```

## Stack

React 18 · TypeScript · Vite · Tailwind v4 · Zustand · Vitest · Lucide

## License

MIT — see `package.json`.

