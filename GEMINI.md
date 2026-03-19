# GEMINI.md

This file provides guidance to Gemini CLI when working with code in this repository.

## Project Overview

This is a Nuxt 4 application configured for deployment on Cloudflare Workers with D1 database (SQLite) and as a Tauri desktop application. It uses Bun as the package manager and runtime, and Drizzle ORM for database operations.

## Key Commands

### Development

```bash
bun dev                  # Start local development server
bun tauri:dev            # Start Tauri development environment
```

### Build & Deploy

```bash
bun build                # Build for production (Web)
bun deploy               # Build and deploy to Cloudflare Workers
bun tauri:build          # Build native desktop application
```

### Database Operations

```bash
bun run drizzle:generate # Generate migration files after schema changes
bun run drizzle:migrate  # Apply migrations to database
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

### API Routes

Routes in `server/api/` follow Nuxt's file-based routing:

- Use `defineEventHandler()` to create handlers
- Access database via `useDrizzle(event)` utility

### Cloudflare & Tauri Configuration

**wrangler.jsonc**: Cloudflare Workers configuration
- D1 database binding named "db"
- Points to migrations in `drizzle/migrations`

**src-tauri/tauri.conf.json**: Tauri configuration
- Frontend assets pointed to `.output/public`
- Dev server pointed to `http://localhost:3000`

**nuxt.config.ts**:
- Preset: `cloudflare-module` for Web, `static` for Tauri (`TAURI_BUILD=1`)
- Built-in Cloudflare development emulation enabled

## Database Schema Workflow

1. Modify `server/db/schema.ts` with desired table changes
2. Run `bun run drizzle:generate` to create migration files in `drizzle/`
3. Review generated SQL migration file
4. Run `bun run drizzle:migrate` to apply changes
5. Migrations are automatically applied on Cloudflare deployment via `wrangler.jsonc` config
