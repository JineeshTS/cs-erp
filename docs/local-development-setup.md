# Local Development Setup — CS ERP

This guide walks through setting up CS ERP for local development on your machine.

## Prerequisites

### System Requirements

- **OS:** macOS 12+, Ubuntu 20.04+, or Windows 11 with WSL2
- **Node.js:** 20.0 or higher (use nvm or fnm for version management)
- **PostgreSQL:** 16 (local or via Docker)
- **Redis:** 7.0 (local or via Docker)
- **Git:** 2.30+
- **RAM:** 4GB minimum (8GB+ recommended)
- **Disk:** 10GB free space

### Package Manager

- **npm:** v10+ (included with Node.js)

### Code Editor (Recommended)

- VS Code with Extensions:
  - TypeScript Vue Plugin
  - Tailwind CSS IntelliSense
  - Prettier
  - ESLint
  - Thunder Client (or Postman for API testing)

---

## Step 1: Install Prerequisites

### macOS

```bash
# Install Homebrew if not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js (via nvm recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20

# Install PostgreSQL
brew install postgresql@16
brew services start postgresql@16

# Install Redis
brew install redis
brew services start redis

# Verify installations
node --version  # v20.x.x
npm --version   # 10.x.x
psql --version  # psql (PostgreSQL) 16.x
redis-cli --version  # redis-cli x.x.x
```

### Ubuntu / Debian

```bash
# Update package manager
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql-16 postgresql-contrib-16
sudo systemctl start postgresql

# Install Redis
sudo apt install -y redis-server
sudo systemctl start redis-server

# Verify
node --version
npm --version
psql --version
redis-cli --version
```

### Windows (WSL2)

```bash
# In WSL2 terminal, follow Ubuntu instructions above
wsl --install

# Verify Node.js in WSL
wsl node --version
```

### Using Docker (Alternative)

Instead of local PostgreSQL/Redis, use Docker:

```bash
# Install Docker Desktop: https://www.docker.com/products/docker-desktop

# Start PostgreSQL and Redis containers
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

---

## Step 2: Clone Repository

```bash
# Clone from GitHub (or your git host)
git clone https://github.com/codilla-ai/cs-erp.git
cd cs-erp

# Verify directory structure
ls -la
# You should see: src/, drizzle/, docs/, package.json, next.config.ts, etc.
```

---

## Step 3: Install Dependencies

```bash
# Install npm packages (this may take 2-3 minutes)
npm install

# Verify installation
npm list --depth=0
```

Expected major dependencies:
- next@16
- react@18 or 19
- drizzle-orm@latest
- zod@4
- @radix-ui/react-*
- tailwindcss
- typescript

---

## Step 4: Generate JWT Keys

CS ERP uses RS256 asymmetric JWT. Generate key pair:

```bash
# Create .keys directory
mkdir -p .keys

# Generate private key (2048-bit RSA)
openssl genrsa -out .keys/private.pem 2048

# Generate public key from private key
openssl rsa -in .keys/private.pem -pubout -out .keys/public.pem

# Verify files were created
ls -la .keys/

# Set secure permissions (private key readable by you only)
chmod 600 .keys/private.pem
chmod 644 .keys/public.pem

# View public key (for reference)
cat .keys/public.pem
```

---

## Step 5: Configure Environment Variables

Create `.env.local` in project root:

```bash
cat > .env.local << 'ENVEOF'
# Application
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3100
PORT=3100

# Database
DATABASE_URL=postgresql://codilla:localdevpass@localhost:5432/cs_erp
DIRECT_DATABASE_URL=postgresql://codilla:localdevpass@localhost:5432/cs_erp

# Redis
REDIS_URL=redis://localhost:6379

# JWT Keys
JWT_PRIVATE_KEY_PATH=.keys/private.pem
JWT_PUBLIC_KEY_PATH=.keys/public.pem

# Auth Secrets (generate random strings)
CSRF_SECRET=your-random-32-char-secret-123456789
SESSION_SECRET=your-random-32-char-secret-987654321

# Optional (for advanced features)
OPENAI_API_KEY=sk_test_... (if using AI features)
NEXT_TELEMETRY_DISABLED=1
LOG_LEVEL=debug
ENVEOF
```

**Generate Random Secrets:**

```bash
# Generate CSRF and Session secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Step 6: Setup Database

### 6a. Create Database (if using local PostgreSQL)

```bash
# Connect to PostgreSQL as superuser
sudo -u postgres psql

# In psql shell:
CREATE USER codilla WITH PASSWORD 'localdevpass';
CREATE DATABASE cs_erp OWNER codilla;
GRANT ALL PRIVILEGES ON DATABASE cs_erp TO codilla;
\q
```

### 6b. Run Migrations

```bash
# Generate Drizzle migrations from schema
npx drizzle-kit generate

# Apply migrations to database
npx drizzle-kit migrate

# Verify database structure (optional)
npx drizzle-kit studio  # Opens Drizzle Studio UI at localhost:5555
```

### 6c. Seed Initial Data (Optional)

```bash
# Check if seed script exists
ls -la scripts/seed.* 2>/dev/null || echo "No seed script found"

# If seed script exists, run it:
npm run seed
```

---

## Step 7: TypeScript Compilation Check

Verify TypeScript has no errors:

```bash
# Type check without emitting output
npx tsc --noEmit

# If errors occur, fix them before proceeding
# Common issues:
# - Missing types: npm install --save-dev @types/node
# - Zod schema mismatch: Verify schema files in src/lib/validation.ts
```

---

## Step 8: Start Development Server

```bash
# Run Next.js development server
npm run dev

# Expected output:
# ▲ Next.js 16.0.0
# - Local: http://localhost:3100
# - Environments: .env.local
# ○ Ready in 2.5s
```

Open browser: http://localhost:3100

You should see the login page (or homepage if already authenticated).

---

## Step 9: Create First User (Optional)

### Via Database (Manual)

```bash
# Generate password hash
node << 'HASHEOF'
const bcrypt = require('bcrypt');
bcrypt.hash('password123', 10, (err, hash) => {
  console.log('Hashed password:', hash);
});
HASHEOF

# Insert user into database
psql -U codilla cs_erp << 'SQLEOF'
INSERT INTO users (id, tenant_id, email, password_hash, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  gen_random_uuid(),
  'admin@example.com',
  '$2b$10$...',  -- Replace with hashed password from above
  NOW(),
  NOW()
);
SQLEOF
```

### Via Registration Endpoint

```bash
curl -X POST http://localhost:3100/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dev@example.com",
    "password": "TestPassword123!"
  }'
```

Then login with: dev@example.com / TestPassword123!

---

## Step 10: Verify Everything Works

```bash
# 1. Check API health
curl http://localhost:3100/api/health

# 2. Login and get JWT token
curl -X POST http://localhost:3100/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dev@example.com",
    "password": "TestPassword123!"
  }'

# 3. Use token to call protected endpoint
curl http://localhost:3100/api/v1/bookings \
  -H "Authorization: Bearer <ACCESS_TOKEN_FROM_STEP_2>"

# 4. Expected response: { data: [], meta: { total: 0, cursor: null } }
```

---

## Common Development Commands

```bash
# Start dev server with hot reload
npm run dev

# Build production bundle (for testing)
npm run build

# Run production build locally
npm run start

# Lint TypeScript and JavaScript
npm run lint

# Format code with Prettier
npm run format

# Type check
npm run type-check

# Run tests (if configured)
npm test

# Database Studio (visual DB browser)
npx drizzle-kit studio

# Generate new migration after schema changes
npx drizzle-kit generate
npx drizzle-kit migrate

# View database directly
psql -U codilla cs_erp
# Then SQL commands like: \dt (show tables), \d users (describe table)
```

---

## Project Structure

```
/root/cs-erp/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (modules)/          # Feature modules
│   │   │   └── {module}/       # e.g., booking/, vessel/
│   │   ├── api/                # API routes
│   │   │   └── v1/             # API v1 endpoints
│   │   └── layout.tsx          # Root layout
│   ├── db/
│   │   ├── schema/             # Drizzle ORM schemas
│   │   └── index.ts            # DB client
│   ├── lib/                    # Utility functions
│   │   ├── auth/               # Authentication
│   │   ├── jwt.ts              # JWT signing/verification
│   │   ├── validation.ts       # Zod schemas
│   │   └── ...
│   ├── types/                  # TypeScript type definitions
│   ├── components/             # Reusable React components
│   └── styles/                 # Global styles
├── drizzle/                    # Migrations folder
├── docs/                       # Documentation
├── public/                     # Static assets
├── .env.local                  # Local environment variables
├── .keys/                      # JWT key pair (DO NOT COMMIT)
├── next.config.ts             # Next.js configuration
├── tsconfig.json              # TypeScript configuration
├── tailwind.config.ts         # Tailwind CSS configuration
└── package.json               # Dependencies and scripts
```

---

## Debugging

### VS Code Debugger

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/next",
      "args": ["dev"],
      "console": "integratedTerminal",
      "env": {
        "NODE_ENV": "development"
      }
    }
  ]
}
```

### Server Logs

```bash
# Dev server logs are visible in terminal where npm run dev is running
# For persistent logging:
npm run dev > logs/dev.log 2>&1
tail -f logs/dev.log
```

### Database Logs

```bash
# PostgreSQL logs (macOS)
tail -f /usr/local/var/log/postgres.log

# PostgreSQL logs (Ubuntu)
tail -f /var/log/postgresql/postgresql-16-main.log

# Redis logs
redis-cli INFO
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `ECONNREFUSED 127.0.0.1:5432` | PostgreSQL not running. Try `brew services start postgresql@16` or docker command |
| `Error: Cannot find module 'bcrypt'` | Run `npm install` again; bcrypt needs native build |
| `PORT 3100 already in use` | Kill process: `lsof -i :3100 \| grep LISTEN \| awk '{print $2}' \| xargs kill -9` |
| JWT validation fails | Regenerate keys: `rm .keys/* && follow Step 4` |
| `psql: error: role "codilla" does not exist` | Create user: `sudo -u postgres createuser codilla` |
| `Database does not exist` | Create DB: `createdb -U postgres cs_erp` (or use SQL commands in Step 6a) |
| TypeScript errors on `drizzle-orm` | Run `npm install` and `npm run type-check` again |

---

## Environment Variables Reference

| Variable | Purpose | Example |
|----------|---------|---------|
| `NODE_ENV` | Environment mode | development, production |
| `NEXT_PUBLIC_API_URL` | Public API URL (accessible to browser) | http://localhost:3100 |
| `PORT` | Server port | 3100 |
| `DATABASE_URL` | Pooled DB connection (app) | postgresql://user:pass@localhost/cs_erp |
| `DIRECT_DATABASE_URL` | Direct DB connection (migrations) | postgresql://user:pass@localhost/cs_erp |
| `REDIS_URL` | Redis connection | redis://localhost:6379 |
| `JWT_PRIVATE_KEY_PATH` | RS256 private key file path | .keys/private.pem |
| `JWT_PUBLIC_KEY_PATH` | RS256 public key file path | .keys/public.pem |
| `CSRF_SECRET` | CSRF token secret | random 32-char string |
| `SESSION_SECRET` | Session encryption secret | random 32-char string |

---

## Next Steps

1. Read the [Architecture Guide](./architecture.md) for system design
2. Check [Module Reference](./modules-reference.md) for module specifications
3. Review [API Reference](./api-reference.md) for endpoint documentation
4. Explore [Operational Processes](./operational-processes.md) for use cases
5. Start coding! Make sure to follow standards in [CLAUDE.md](../CLAUDE.md)

---

## Tips for Development

- Use TypeScript strict mode: catch errors early
- Commit frequently with descriptive messages
- Write tests alongside features
- Use Drizzle Studio for database inspection
- Enable Prettier auto-format on save (VS Code)
- Check database migrations before pushing code
- Test on mobile viewport (DevTools: CMD+SHIFT+M)
- Test RTL layout (add `dir="rtl"` to html tag temporarily)

---

## Getting Help

- **Questions:** Check documentation in `/docs/`
- **Bugs:** GitHub Issues (if public repo)
- **Support:** Email development@codilla.ai
- **Slack:** Join #cs-erp-dev channel

Happy coding!
