# CLAUDE.md

## Project Overview

**CHR (Choir Harana Reports)** is a web application for managing choir harana visit reports. Users submit visit reports via an embedded Google Form, and authorized users can view aggregated reports with filtering and summary statistics.

## Tech Stack

- **Language:** TypeScript (strict mode)
- **Framework:** React 19 with React Router 7
- **Build Tool:** Vite 7
- **Package Manager:** npm with workspaces
- **Deployment:** Vercel (static SPA with client-side routing)
- **Styling:** Plain CSS (no preprocessor)
- **Auth:** Google Sign-In (OAuth 2.0, client-side JWT decoding)
- **Data Source:** Google Apps Script API backed by Google Sheets

## Repository Structure

```
chr/
├── package.json          # Workspace root (delegates to frontend/)
├── vercel.json           # Vercel deployment config
└── frontend/             # React SPA (single workspace)
    ├── package.json      # Dependencies and scripts
    ├── index.html        # HTML entry point
    ├── vite.config.ts    # Vite configuration
    ├── tsconfig.json     # TS project references
    ├── tsconfig.app.json # TS config for app code (strict)
    ├── tsconfig.node.json# TS config for build tooling
    ├── eslint.config.js  # ESLint flat config
    └── src/
        ├── main.tsx      # App entry point (renders AuthProvider + BrowserRouter)
        ├── App.tsx       # Root component: nav bar + route definitions
        ├── App.css       # Global styles + responsive layout
        ├── index.css     # Base/reset styles
        ├── auth/
        │   ├── AuthContext.tsx   # React Context for Google auth state
        │   ├── allowedEmails.ts  # Email whitelist for reports access
        │   └── google.d.ts      # Type declarations for Google Sign-In API
        └── pages/
            ├── FormPage.tsx     # Embedded Google Form iframe
            └── ReportsPage.tsx  # Reports dashboard (fetch, filter, aggregate)
```

## Commands

All commands run from the repository root:

```bash
npm install              # Install all dependencies
npm run dev              # Start Vite dev server (http://localhost:5173)
npm run build            # TypeScript check + Vite production build
```

From the `frontend/` directory:

```bash
npm run dev              # Vite dev server
npm run build            # tsc -b && vite build
npm run lint             # ESLint on all .ts/.tsx files
npm run preview          # Preview production build locally
```

## Linting

- **ESLint 9** with flat config format (`frontend/eslint.config.js`)
- Plugins: `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`
- Targets `**/*.{ts,tsx}` files; ignores `dist/`
- No Prettier or auto-formatter configured
- Run with: `npm run lint` from `frontend/`

## TypeScript Configuration

- **Strict mode** enabled with additional checks:
  - `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`
  - `erasableSyntaxOnly`, `noUncheckedSideEffectImports`
- Target: ES2022, Module: ESNext, JSX: react-jsx
- Module resolution: `bundler` (Vite-compatible)
- `noEmit: true` (Vite handles bundling, tsc only type-checks)

## Architecture

### Authentication Flow
1. Google Sign-In SDK loaded dynamically in `AuthContext.tsx`
2. JWT credential decoded client-side to extract user info (email, name, picture)
3. User persisted in `sessionStorage` (key: `chr_user`)
4. Access control via email whitelist in `allowedEmails.ts` (`'*'` = allow all)
5. `useAuth()` hook exposes `user`, `isAllowed`, `login`, `logout`, `ready`

### Routing
- `/` — FormPage (public, embedded Google Form)
- `/reports` — ReportsPage (protected, redirects to `/` if not authorized)
- Vercel rewrites all routes to `/` for client-side routing

### Data Flow (ReportsPage)
1. Fetches JSON from Google Apps Script endpoint on mount
2. Parses row-based response into typed `VisitRecord[]`
3. Client-side filtering by date range
4. Summary aggregation: total visits, families, choir groups, district count

## Key Conventions

- **No testing framework** is configured; there are no test files
- **Monorepo layout** with npm workspaces, but currently only one workspace (`frontend/`)
- **Pure CSS** styling with mobile-first responsive design (breakpoint at 640px)
- **No environment variables** — API URLs and Google Client ID are hardcoded in source
- **ES modules** throughout (`"type": "module"` in frontend package.json)
- Components use function declarations (not arrow functions) for top-level exports

## Deployment

Deployed via **Vercel**:
- Build: `cd frontend && npm run build`
- Output: `frontend/dist`
- SPA rewrite: `/(.*) → /` for React Router
