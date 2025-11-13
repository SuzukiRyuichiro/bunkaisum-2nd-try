# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Nuxt 4 application configured for deployment on Cloudflare Workers with D1 database (SQLite). It uses Drizzle ORM for database operations and is designed to run both locally (with better-sqlite3) and on Cloudflare's edge infrastructure.

## Key Commands

### Development

```bash
npm run dev              # Start local development server with nitro-cloudflare-dev
npm run build            # Build for production
npm run preview          # Preview production build
npm run deploy           # Build and deploy to Cloudflare Workers
```

### Database Operations

```bash
npm run drizzle:generate # Generate migration files after schema changes
npm run drizzle:migrate  # Apply migrations to database
```

## Architecture

### Database Layer

**Schema Location**: `server/db/schema.ts`

- All database table definitions using Drizzle ORM
- Uses SQLite dialect with Cloudflare D1 driver

**Database Access**: `server/utils/drizzle.ts`

- Exports `useDrizzle(event)` utility function to get database instance
- Accesses D1 binding from `event.context.cloudflare.env.db`
- Provides type-safe access via exported types (e.g., `Expense`)

**Usage Pattern in API Routes**:

```typescript
const db = useDrizzle(event);
const results = await db.query.tableName.findMany();
```

### API Routes

Routes in `server/api/` follow Nuxt's file-based routing:

- Use `defineEventHandler()` to create handlers
- Access database via `useDrizzle(event)` utility
- Examples: `/api/expenses`

### Cloudflare Configuration

**wrangler.jsonc**: Cloudflare Workers configuration

- D1 database binding named "db"
- Points to migrations in `drizzle/migrations`
- Node.js compatibility enabled

**nuxt.config.ts**:

- Preset: `cloudflare-module` for Nitro
- Uses `nitro-cloudflare-dev` module for local D1 emulation
- Node compatibility enabled in Cloudflare settings

### Environment Variables

Required in `.env`:

- `DATABASE_URL`: Local SQLite database path
- `CLOUDFLARE_ACCOUNT_ID`: Cloudflare account ID
- `CLOUDFLARE_DATABASE_ID`: D1 database ID
- `CLOUDFLARE_D1_TOKEN`: Cloudflare API token

## Database Schema Workflow

1. Modify `server/db/schema.ts` with desired table changes
2. Run `npm run drizzle:generate` to create migration files in `drizzle/`
3. Review generated SQL migration file
4. Run `npm run drizzle:migrate` to apply changes
5. Migrations are automatically applied on Cloudflare deployment via `wrangler.jsonc` config

## Type Safety

- Database types are inferred from schema using `$inferSelect`
- Export types from `server/utils/drizzle.ts` for reuse across API routes
- Cloudflare Worker types defined in `worker-configuration.d.ts`
