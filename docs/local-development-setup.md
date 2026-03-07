# CS-ERP Local Development Setup

This guide walks through setting up CS-ERP for local development.

---

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 22+ (use nvm for version management) | Runtime |
| npm | 10+ (included with Node.js) | Package manager |
| PostgreSQL | 16+ | Database |
| Redis | 7+ | Cache and job queue |
| Git | 2.40+ | Version control |
| OpenSSL | 3+ | JWT key generation |
| Docker (optional) | 24+ | For containerized PostgreSQL/Redis |

**System requirements:** macOS 12+, Ubuntu 20.04+, or Windows 11 with WSL2. 4GB RAM minimum (8GB+ recommended).

---

## Step 1: Clone the Repository

```bash
git clone <repository-url> cs-erp
cd cs-erp
```

---

## Step 2: Install Dependencies

```bash
npm install
```

This installs all dependencies including Next.js 16, Drizzle ORM, Zod v4, Radix UI, Tailwind CSS, Lucide React, BullMQ, and bcrypt.

---

## Step 3: Database Setup

### Option A: Docker (Recommended)

```bash
docker run -d \
  --name cs-erp-postgres \
  -e POSTGRES_DB=cs_erp \
  -e POSTGRES_USER=codilla \
  -e POSTGRES_PASSWORD=localdevpass \
  -p 5432:5432 \
  postgres:16-alpine

docker run -d \
  --name cs-erp-redis \
  -p 6379:6379 \
  redis:7-alpine

# Verify
docker ps
```

### Option B: Local PostgreSQL

```bash
# macOS
brew install postgresql@16
brew services start postgresql@16

# Ubuntu
sudo apt install -y postgresql-16 postgresql-contrib-16
sudo systemctl start postgresql

# Create database and user
sudo -u postgres psql
CREATE USER codilla WITH PASSWORD 'localdevpass';
CREATE DATABASE cs_erp OWNER codilla;
GRANT ALL PRIVILEGES ON DATABASE cs_erp TO codilla;
\q
```

Ensure Redis is running locally on port 6379:

```bash
# macOS
brew install redis && brew services start redis

# Ubuntu
sudo apt install -y redis-server && sudo systemctl start redis-server
```

---

## Step 4: Generate JWT Keys

CS-ERP uses RS256 asymmetric JWT tokens. Generate the key pair:

```bash
mkdir -p .keys
openssl genrsa -out .keys/private.pem 2048
openssl rsa -in .keys/private.pem -pubout -out .keys/public.pem
chmod 600 .keys/private.pem
chmod 644 .keys/public.pem
```

The `.keys/` directory is in `.gitignore` -- never commit these files.

---

## Step 5: Environment Variables

Create a `.env.local` file in the project root:

```env
# Application
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3100
PORT=3100
NEXT_TELEMETRY_DISABLED=1
LOG_LEVEL=debug

# Database (direct connection for development)
DATABASE_URL=postgresql://codilla:localdevpass@localhost:5432/cs_erp
DIRECT_DATABASE_URL=postgresql://codilla:localdevpass@localhost:5432/cs_erp

# Redis
REDIS_URL=redis://localhost:6379

# JWT Keys
JWT_PRIVATE_KEY_PATH=.keys/private.pem
JWT_PUBLIC_KEY_PATH=.keys/public.pem

# Auth Secrets (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
CSRF_SECRET=your-random-32-char-secret-here
COOKIE_DOMAIN=localhost
```

The `.env.local` file is in `.gitignore` -- never commit it.

---

## Step 6: Run Database Migrations

Apply all Drizzle migrations to create the 528+ tables:

```bash
npx drizzle-kit migrate
```

To check migration status:

```bash
npx drizzle-kit status
```

To browse the database visually:

```bash
npx drizzle-kit studio   # Opens at localhost:5555
```

---

## Step 7: TypeScript Check

Verify TypeScript compiles cleanly:

```bash
npx tsc --noEmit
```

---

## Step 8: Start the Development Server

```bash
npm run dev
```

The application starts on **http://localhost:3100**.

---

## Step 9: Create Initial User

Use the registration API:

```bash
curl -X POST http://localhost:3100/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@localhost.com",
    "password": "SecureP@ss123",
    "full_name": "Admin User"
  }'
```

Then log in at http://localhost:3100/login.

### Verify Everything Works

```bash
# Check health endpoint
curl http://localhost:3100/api/health

# Login and get token
curl -X POST http://localhost:3100/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@localhost.com", "password": "SecureP@ss123"}'
```

---

## Project Structure

```
cs-erp/
  .keys/                          # JWT key pair (gitignored)
  drizzle/                        # Migration files
    meta/                         # Migration metadata
  docs/                           # Documentation
  public/                         # Static assets
  src/
    app/
      (auth)/                     # Auth pages (login, register)
      (dashboard)/                # Dashboard and module pages
      api/
        auth/                     # Auth API routes
        health/                   # Health check
        v1/                       # Module API routes
          {module-slug}/
            route.ts
      globals.css                 # Tailwind + CSS variables
      layout.tsx                  # Root layout
    db/
      schema/                     # Drizzle schema files (61+ files)
        {module-slug}.ts
        index.ts                  # Barrel export
      index.ts                    # DB connection
    lib/
      auth/                       # Auth utilities
      {module-slug}/              # Module-specific utilities
      jwt.ts                      # RS256 JWT sign/verify
      password.ts                 # bcrypt hashing
      rate-limit.ts               # In-memory rate limiter
      validation.ts               # Shared Zod schemas
      cookies.ts                  # Cookie helpers
      audit.ts                    # Audit logging
    types/
      {module-slug}.ts            # Module type definitions
    middleware.ts                  # Route protection
  drizzle.config.ts               # Drizzle configuration
  next.config.ts                  # Next.js configuration (standalone output)
  tailwind.config.ts              # Tailwind configuration
  tsconfig.json                   # TypeScript configuration (strict)
  package.json
  CLAUDE.md                       # AI coding standards
```

---

## Common Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server on port 3100 with hot reload |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npx tsc --noEmit` | TypeScript type check (0 errors required) |
| `npx drizzle-kit generate` | Generate migration from schema changes |
| `npx drizzle-kit migrate` | Apply pending migrations |
| `npx drizzle-kit status` | Check migration status |
| `npx drizzle-kit studio` | Open Drizzle Studio (DB browser) at localhost:5555 |
| `npm audit --audit-level=high` | Security audit (0 high/critical required) |

---

## Development Guidelines

### Server Components vs Client Components

- Default to Server Components (no directive needed)
- Add `'use client'` only when the component needs interactivity (event handlers, hooks, browser APIs)
- Place `loading.tsx` in every route segment for Suspense boundaries

### Database Queries

- Always use Drizzle ORM -- never raw SQL strings
- Use indexes on all WHERE clause columns
- Use JOINs or batch fetches -- N+1 queries are forbidden
- All list queries must use cursor-based pagination (max 50 rows)

### API Routes

- Validate all input with Zod before processing
- Wrap in try/catch; return generic error messages to clients
- Check auth (`requireAuth()`) and permissions (`requirePermission()`) on every route
- Return consistent response format (`{ data }` or `{ error }`)
- Include CSRF token check on mutations

### Styling

- Use Tailwind CSS utility classes
- Use CSS variables from `globals.css` for colors
- Use logical properties (`ms-`, `me-`) instead of `ml-`, `mr-` for RTL support
- Test at 375px width for mobile responsiveness

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `ECONNREFUSED 127.0.0.1:5432` | PostgreSQL not running. Start with `brew services start postgresql@16` or `docker start cs-erp-postgres` |
| `Error: Cannot find module 'bcrypt'` | Run `npm install` again; bcrypt needs native build |
| `PORT 3100 already in use` | `lsof -i :3100` to find PID, then `kill -9 <PID>` |
| JWT validation fails | Regenerate keys: `rm .keys/*` and redo Step 4 |
| `role "codilla" does not exist` | Create user: `sudo -u postgres createuser codilla` |
| `database "cs_erp" does not exist` | Create DB: `sudo -u postgres createdb -O codilla cs_erp` |
| TypeScript errors | Run `npx tsc --noEmit` to see all errors; fix before proceeding |
| Redis connection fails | Verify Redis: `redis-cli ping` should return `PONG` |

---

## Next Steps

1. Read the [Architecture Guide](./architecture.md) for system design
2. Check [Modules Reference](./modules-reference.md) for module specifications
3. Review [API Reference](./api-reference.md) for endpoint documentation
4. Follow coding standards in [CLAUDE.md](../CLAUDE.md)
