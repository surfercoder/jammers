<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project conventions

- **Stack:** Next.js 16 (App Router) · React 19 (React Compiler is **on** — do not add manual `useMemo`/`useCallback`/`memo` for perf) · TypeScript · Tailwind CSS v4 · Supabase.
- **Middleware is `proxy.ts`.** Next.js 16 renamed Middleware to Proxy. The matcher + session refresh live in `src/proxy.ts` — do not create a `middleware.ts`.
- **Path alias:** import from `@/*` (maps to `src/*`).
- **Supabase:** use the helpers in `src/utils/supabase/` — `client.ts` (browser), `server.ts` (server components / route handlers), `middleware.ts` (token refresh, called from `proxy.ts`).

## UI: shadcn/ui

This project uses **shadcn/ui** (Radix base, `radix-nova` style, `neutral` base color, Lucide icons). Config lives in `components.json`.

- **Add components with the CLI — never hand-write them:** `npx shadcn@latest add <name>` (e.g. `button`, `dialog`, `dropdown-menu`). The `shadcn` MCP server is also available to search/inspect the registry.
- Generated primitives land in `src/components/ui/`. **Treat these as editable source** — restyle them in place rather than wrapping. App-level components go in `src/components/`.
- **Class merging:** always compose `className`s with `cn()` from `@/lib/utils`. Variants use `class-variance-authority` (see `button.tsx`).
- **Styling:** Tailwind v4 is CSS-first. Design tokens + light/dark palettes live in `src/app/globals.css` (`@theme inline` + `:root`/`.dark`). Use semantic token classes (`bg-background`, `text-muted-foreground`, `border-border`, `bg-primary`…) — **not** raw colors like `bg-zinc-50`.
- **Dark mode** is class-based via `next-themes` (`attribute="class"`). `ThemeProvider` wraps the app in `layout.tsx`; toggle with `<ModeToggle />`. The `dark` variant is defined in `globals.css` as `@custom-variant dark (&:is(.dark *))`.
- **Toasts:** `import { toast } from "sonner"`. The `<Toaster />` is already mounted in `layout.tsx`.
- **Icons:** import from `lucide-react`.
- **Server vs client:** keep pages/layouts as Server Components; mark interactive leaves with `"use client"` (see `src/components/showcase.tsx`, `mode-toggle.tsx`).
