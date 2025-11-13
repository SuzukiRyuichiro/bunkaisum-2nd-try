This app is me testing and setting up the basics of Nuxt + Drizzle kit

You can build using Sqlite + Nuxt + Drizzle ORM.

It is configured to be deployed with Cloudflare's D1 and Worker.

# How to modify tables

1. Edit `server/db/schema.ts` to what you need.
2. Run

```
npx drizzle-kit generate
```

and check the new migration file it created in the `drizzle` folder.

3. Then migrate with

```
npx drizzle-kit migrate
```
