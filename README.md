# DocVid

Turn docs and prompts into narrated, animated code lessons.

A pnpm + Turborepo monorepo:

Every workspace lives under `packages/*` — deployables and libraries side by side:

```
docvid/
└── packages/
    ├── web/              # Next.js app (frontend + API routes), deployed via OpenNext to Cloudflare
    ├── ai-worker/        # Cloudflare Worker: lesson generation (Workers AI, Workflows, KV, R2)
    ├── payments-worker/  # Cloudflare Worker: Dodo Payments checkout + webhooks → D1 (later)
    └── shared/           # Shared TypeScript types and validation (library, not deployed)
```

D1 schema migrations live in `db/migrations/` (added in Phase 2).

## Getting started

```bash
pnpm install
pnpm dev        # run all dev servers
pnpm build      # build everything
pnpm typecheck  # typecheck all workspaces
```

## Conventions

- **Package manager:** pnpm workspaces
- **Task runner:** Turborepo
- **Commits:** [Conventional Commits](https://www.conventionalcommits.org/)
