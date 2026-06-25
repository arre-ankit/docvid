# DocVid

Turn docs and prompts into narrated, animated code lessons.

A pnpm + Turborepo monorepo:

```
docvid/
├── apps/
│   └── web/              # Next.js app (frontend + API routes), deployed via OpenNext to Cloudflare
├── workers/
│   ├── ai-worker/        # Cloudflare Worker: lesson generation (Workers AI, Workflows, KV, R2)
│   └── payments-worker/  # Cloudflare Worker: Dodo Payments checkout + webhooks → D1 (later)
├── packages/
│   └── shared/           # Shared TypeScript types and validation
└── db/
    └── migrations/       # D1 schema migrations (later)
```

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
