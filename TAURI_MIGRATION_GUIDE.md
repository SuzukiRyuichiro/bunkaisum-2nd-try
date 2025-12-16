# Tauri Migration Guide - Option 1: Frontend + Cloudflare Backend

## Overview

This guide outlines the steps to convert the current Nuxt/Cloudflare Workers application into a Tauri desktop app while keeping the Cloudflare backend as an API server.

**Architecture**:
- **Frontend**: Tauri app (desktop) with client-side rendering
- **Backend**: Cloudflare Workers + D1 (existing, with auth modifications)
- **Auth**: Token-based (JWT) instead of session-based
- **Data**: All data remains in Cloudflare D1, accessed via HTTP API

## Why This Approach?

- ✅ Minimal backend changes
- ✅ Can maintain web version alongside desktop app
- ✅ Centralized data (no local database complexity)
- ✅ Standard token-based auth pattern for native apps
- ❌ Requires internet connection

## Migration Steps

### Phase 1: Backend - Implement Token-Based Auth

#### 1.1 Install JWT Dependencies

```bash
npm install jose  # Modern JWT library for edge environments
```

#### 1.2 Create JWT Utilities

**File**: `server/utils/jwt.ts`

```typescript
import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

export interface TokenPayload {
  userId: string;
  email: string;
  exp?: number;
}

export async function generateAccessToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ userId: payload.userId, email: payload.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('15m') // Short-lived access token
    .sign(JWT_SECRET);
}

export async function generateRefreshToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ userId: payload.userId, email: payload.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d') // Long-lived refresh token
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<TokenPayload> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as TokenPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}
```

#### 1.3 Update Database Schema for Refresh Tokens

**File**: `server/db/schema.ts`

Add a new table to store refresh tokens:

```typescript
export const refreshTokens = sqliteTable('refresh_tokens', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(),
  token: text('token').notNull().unique(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});
```

Run:
```bash
npm run drizzle:generate
npm run drizzle:migrate
```

#### 1.4 Create Auth API Endpoints

**File**: `server/api/auth/login.post.ts`

```typescript
export default defineEventHandler(async (event) => {
  const { email, password } = await readBody(event);
  const db = useDrizzle(event);

  // Validate user credentials (implement your logic)
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user || !await verifyPassword(password, user.passwordHash)) {
    throw createError({
      statusCode: 401,
      message: 'Invalid credentials',
    });
  }

  // Generate tokens
  const accessToken = await generateAccessToken({
    userId: user.id,
    email: user.email,
  });

  const refreshToken = await generateRefreshToken({
    userId: user.id,
    email: user.email,
  });

  // Store refresh token in database
  await db.insert(refreshTokens).values({
    userId: user.id,
    token: refreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  };
});
```

**File**: `server/api/auth/refresh.post.ts`

```typescript
export default defineEventHandler(async (event) => {
  const { refreshToken } = await readBody(event);
  const db = useDrizzle(event);

  // Verify refresh token
  let payload: TokenPayload;
  try {
    payload = await verifyToken(refreshToken);
  } catch (error) {
    throw createError({
      statusCode: 401,
      message: 'Invalid refresh token',
    });
  }

  // Check if refresh token exists in database
  const storedToken = await db.query.refreshTokens.findFirst({
    where: eq(refreshTokens.token, refreshToken),
  });

  if (!storedToken || storedToken.expiresAt < new Date()) {
    throw createError({
      statusCode: 401,
      message: 'Refresh token expired or revoked',
    });
  }

  // Generate new access token
  const accessToken = await generateAccessToken({
    userId: payload.userId,
    email: payload.email,
  });

  return { accessToken };
});
```

**File**: `server/api/auth/logout.post.ts`

```typescript
export default defineEventHandler(async (event) => {
  const { refreshToken } = await readBody(event);
  const db = useDrizzle(event);

  // Revoke refresh token
  await db.delete(refreshTokens).where(eq(refreshTokens.token, refreshToken));

  return { success: true };
});
```

#### 1.5 Create Auth Middleware

**File**: `server/middleware/auth.ts`

```typescript
export default defineEventHandler(async (event) => {
  // Only protect /api routes (except auth routes)
  const path = event.path;
  if (!path.startsWith('/api') || path.startsWith('/api/auth')) {
    return;
  }

  const authHeader = getHeader(event, 'authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw createError({
      statusCode: 401,
      message: 'Missing or invalid authorization header',
    });
  }

  const token = authHeader.substring(7);

  try {
    const payload = await verifyToken(token);
    // Attach user info to event context
    event.context.user = payload;
  } catch (error) {
    throw createError({
      statusCode: 401,
      message: 'Invalid or expired token',
    });
  }
});
```

#### 1.6 Update Existing API Routes

All protected API routes now have access to `event.context.user`:

```typescript
export default defineEventHandler(async (event) => {
  const db = useDrizzle(event);
  const userId = event.context.user.userId; // From auth middleware

  // Use userId to fetch user-specific data
  const expenses = await db.query.expenses.findMany({
    where: eq(expenses.userId, userId),
  });

  return expenses;
});
```

### Phase 2: Environment Setup

#### 2.1 Add JWT Secret to Environment

**File**: `.env`

```env
JWT_SECRET=your-very-secure-random-secret-key-min-32-chars
```

**File**: `wrangler.jsonc` (for production)

```jsonc
{
  "vars": {
    "JWT_SECRET": "production-secret-from-cloudflare-dashboard"
  }
}
```

⚠️ **Security**: Use Cloudflare's encrypted environment variables for production.

### Phase 3: Frontend - Set Up Tauri

#### 3.1 Initialize Tauri Project

```bash
npm install --save-dev @tauri-apps/cli
npm install @tauri-apps/api
npx tauri init
```

During init:
- App name: Your app name
- Window title: Your app title
- Web assets: `dist` (Nuxt build output)
- Dev server URL: `http://localhost:3000`
- Dev command: `npm run dev`
- Build command: `npm run generate` (static site generation)

#### 3.2 Configure Nuxt for Static Generation

**File**: `nuxt.config.ts`

```typescript
export default defineNuxtConfig({
  // Change from server-side to static generation
  ssr: false, // Client-side only for Tauri

  nitro: {
    // Remove Cloudflare preset for Tauri build
    preset: process.env.TAURI_BUILD ? undefined : 'cloudflare-module',
  },

  // API base URL for production
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8787',
    },
  },
});
```

#### 3.3 Update Tauri Config

**File**: `src-tauri/tauri.conf.json`

```json
{
  "build": {
    "beforeDevCommand": "npm run dev",
    "beforeBuildCommand": "TAURI_BUILD=1 npm run generate",
    "devPath": "http://localhost:3000",
    "distDir": "../.output/public"
  },
  "tauri": {
    "allowlist": {
      "all": false,
      "http": {
        "all": true,
        "request": true,
        "scope": ["https://your-app.workers.dev/*"]
      },
      "window": {
        "all": false,
        "close": true,
        "hide": true,
        "show": true,
        "maximize": true,
        "minimize": true,
        "unmaximize": true,
        "unminimize": true,
        "startDragging": true
      }
    },
    "security": {
      "csp": "default-src 'self'; connect-src 'self' https://your-app.workers.dev"
    }
  }
}
```

#### 3.4 Install Tauri Plugin for Secure Storage

```bash
cd src-tauri
cargo add tauri-plugin-store
cd ..
```

**File**: `src-tauri/src/main.rs`

```rust
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::default().build())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### Phase 4: Frontend - Implement Auth Flow

#### 4.1 Create API Client Composable

**File**: `composables/useApi.ts`

```typescript
import { Store } from '@tauri-apps/plugin-store';

export const useApi = () => {
  const config = useRuntimeConfig();
  const store = process.client ? new Store('.auth.dat') : null;

  const getAccessToken = async (): Promise<string | null> => {
    if (!store) return null;
    return await store.get<string>('accessToken');
  };

  const getRefreshToken = async (): Promise<string | null> => {
    if (!store) return null;
    return await store.get<string>('refreshToken');
  };

  const setTokens = async (accessToken: string, refreshToken: string) => {
    if (!store) return;
    await store.set('accessToken', accessToken);
    await store.set('refreshToken', refreshToken);
    await store.save();
  };

  const clearTokens = async () => {
    if (!store) return;
    await store.delete('accessToken');
    await store.delete('refreshToken');
    await store.save();
  };

  const refreshAccessToken = async (): Promise<string | null> => {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) return null;

    try {
      const response = await $fetch<{ accessToken: string }>(
        `${config.public.apiBase}/api/auth/refresh`,
        {
          method: 'POST',
          body: { refreshToken },
        }
      );

      await store?.set('accessToken', response.accessToken);
      await store?.save();
      return response.accessToken;
    } catch (error) {
      await clearTokens();
      return null;
    }
  };

  const fetchWithAuth = async <T>(url: string, options: any = {}): Promise<T> => {
    let accessToken = await getAccessToken();

    const makeRequest = async (token: string | null) => {
      return $fetch<T>(`${config.public.apiBase}${url}`, {
        ...options,
        headers: {
          ...options.headers,
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
    };

    try {
      return await makeRequest(accessToken);
    } catch (error: any) {
      // If 401, try refreshing token
      if (error.statusCode === 401) {
        accessToken = await refreshAccessToken();
        if (accessToken) {
          return await makeRequest(accessToken);
        }
      }
      throw error;
    }
  };

  return {
    getAccessToken,
    getRefreshToken,
    setTokens,
    clearTokens,
    refreshAccessToken,
    fetchWithAuth,
  };
};
```

#### 4.2 Create Auth Composable

**File**: `composables/useAuth.ts`

```typescript
export const useAuth = () => {
  const config = useRuntimeConfig();
  const api = useApi();
  const user = useState<{ id: string; email: string; name: string } | null>('user', () => null);

  const login = async (email: string, password: string) => {
    const response = await $fetch<{
      accessToken: string;
      refreshToken: string;
      user: any;
    }>(`${config.public.apiBase}/api/auth/login`, {
      method: 'POST',
      body: { email, password },
    });

    await api.setTokens(response.accessToken, response.refreshToken);
    user.value = response.user;
  };

  const logout = async () => {
    const refreshToken = await api.getRefreshToken();
    if (refreshToken) {
      try {
        await $fetch(`${config.public.apiBase}/api/auth/logout`, {
          method: 'POST',
          body: { refreshToken },
        });
      } catch (error) {
        // Ignore errors during logout
      }
    }

    await api.clearTokens();
    user.value = null;
  };

  const checkAuth = async () => {
    const accessToken = await api.getAccessToken();
    if (!accessToken) {
      user.value = null;
      return false;
    }

    try {
      // Verify token is still valid by fetching user profile
      const userData = await api.fetchWithAuth<any>('/api/user/me');
      user.value = userData;
      return true;
    } catch (error) {
      user.value = null;
      return false;
    }
  };

  return {
    user: readonly(user),
    login,
    logout,
    checkAuth,
  };
};
```

#### 4.3 Create Auth Middleware for Pages

**File**: `middleware/auth.global.ts`

```typescript
export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuth();

  // Check if user is authenticated
  const isAuthenticated = await auth.checkAuth();

  // Define public routes
  const publicRoutes = ['/login', '/register'];
  const isPublicRoute = publicRoutes.includes(to.path);

  if (!isAuthenticated && !isPublicRoute) {
    return navigateTo('/login');
  }

  if (isAuthenticated && isPublicRoute) {
    return navigateTo('/');
  }
});
```

#### 4.4 Update API Calls in Components

Replace all API calls to use `fetchWithAuth`:

```typescript
// Before (using useFetch with server-side session)
const { data: expenses } = await useFetch('/api/expenses');

// After (using fetchWithAuth with token)
const api = useApi();
const expenses = await api.fetchWithAuth('/api/expenses');
```

### Phase 5: Testing & Deployment

#### 5.1 Test Locally

**Terminal 1** - Run Cloudflare Workers backend:
```bash
npm run dev  # This runs the Workers dev server
```

**Terminal 2** - Run Tauri app:
```bash
npm run tauri dev
```

#### 5.2 Build for Production

**Backend** (Cloudflare):
```bash
npm run deploy
```

**Desktop App** (Tauri):
```bash
NUXT_PUBLIC_API_BASE=https://your-app.workers.dev npm run tauri build
```

#### 5.3 Update Environment Variables

Create production environment file:

**File**: `.env.production`
```env
NUXT_PUBLIC_API_BASE=https://your-app.workers.dev
```

### Phase 6: Maintain Web Version (Optional)

If you want to keep the web version:

1. Create separate build commands:
```json
{
  "scripts": {
    "build:web": "nuxt build",
    "build:desktop": "TAURI_BUILD=1 nuxt generate",
    "deploy:web": "npm run build:web && wrangler deploy",
    "deploy:desktop": "npm run tauri build"
  }
}
```

2. Use conditional rendering for Tauri-specific features:
```typescript
import { isTauri } from '@tauri-apps/api/core';

if (await isTauri()) {
  // Tauri-specific code
} else {
  // Web-specific code
}
```

## Common Issues & Solutions

### Issue 1: CORS Errors

**Problem**: Tauri app gets CORS errors when calling Cloudflare API.

**Solution**: Add CORS headers to Cloudflare Workers:

**File**: `server/middleware/cors.ts`
```typescript
export default defineEventHandler((event) => {
  const origin = getHeader(event, 'origin');

  // Allow Tauri app origin
  if (origin?.startsWith('tauri://')) {
    setHeaders(event, {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      'Access-Control-Allow-Credentials': 'true',
    });
  }

  // Handle preflight
  if (getMethod(event) === 'OPTIONS') {
    setResponseStatus(event, 204);
    return '';
  }
});
```

### Issue 2: Token Storage Security

**Problem**: Concerned about storing tokens in Tauri.

**Solution**: Tauri's `tauri-plugin-store` encrypts data by default. For extra security:
- Use system keychain (platform-specific)
- Implement token rotation
- Use short-lived access tokens (15 min) with refresh tokens

### Issue 3: Offline Support

**Problem**: App doesn't work offline.

**Solution**: This architecture requires internet. For offline support, consider Option 3 (Hybrid) from the original discussion, which adds local SQLite caching.

## Next Steps

1. ✅ Implement backend token auth (Phase 1)
2. ✅ Set up Tauri project (Phase 3)
3. ✅ Implement frontend auth flow (Phase 4)
4. ✅ Update all API calls to use token auth
5. ✅ Test locally
6. ✅ Deploy to production

## Resources

- [Tauri Documentation](https://tauri.app/)
- [JWT Best Practices](https://datatracker.ietf.org/doc/html/rfc8725)
- [Cloudflare Workers Auth Patterns](https://developers.cloudflare.com/workers/examples/)
- [Nuxt 3 Documentation](https://nuxt.com/)

---

**Last Updated**: 2025-12-16
