#!/usr/bin/env python3
"""
CS ERP Module Builder — Sequential automation for all 61 modules.
Generates task files from DB data, runs Claude Code via tmux, monitors completion.
Usage: python3 /root/cs_erp_builder.py [--start MOD-000] [--dry-run]
"""

import subprocess, time, sys, json, os, re, argparse
from datetime import datetime

# ─── Config ───────────────────────────────────────────────────────────────────

TMUX_SESSION   = "cserp"
TMUX_PANE      = "cserp"
REPO_DIR       = "/root/cs-erp"
TASK_DIR       = "/home/ubuntu"
DB_CMD         = ["docker", "exec", "-i", "06-build-postgres-1", "psql",
                   "-U", "codilla", "-d", "codilla", "-t", "-A", "-F", "|"]
DB_CS_CMD      = ["docker", "exec", "-i", "06-build-postgres-1", "psql",
                   "-U", "codilla", "-d", "cs_erp", "-t", "-A", "-F", "|"]

WHATSAPP_TARGET = "+97474085579"

# Module parts: how many parts each module has (most = 2, complex = 3)
COMPLEX_MODULES = {
    "MOD-000": 2,  # p1 done, p2 now
    "MOD-001": 2,
    "MOD-004": 3,  # EDI integrations are complex
    "MOD-005": 3,  # CRM is large
    "MOD-009": 3,  # Operations & docs are large
    "MOD-031": 3,  # Analytics is large
    "MOD-041": 3,  # General Ledger is complex
    "MOD-050": 2,  # Mobile app
}

# All modules in build order (foundation first, then business, then advanced)
BUILD_ORDER = [
    "MOD-000",  # Foundation (auth done, RBAC/dashboard/admin = p2)
    "MOD-032",  # Master Data Management (reference data needed by everything)
    "MOD-033",  # Workflow & Notification Engine
    "MOD-034",  # Document Management System
    "MOD-036",  # Admin Portal
    "MOD-003",  # Multi-Entity & Legal Structure
    "MOD-012",  # Chartering & Vessel Management
    "MOD-011",  # Capacity & Voyage Management
    "MOD-010",  # Equipment Control & Yard Management
    "MOD-005",  # Sales & CRM
    "MOD-007",  # Commercial & Pricing Management
    "MOD-009",  # Operations & Documentation Management
    "MOD-027",  # Customs Compliance & Regulatory
    "MOD-023",  # Dangerous Goods Management
    "MOD-024",  # Reefer Container Management
    "MOD-022",  # Demurrage & Detention Management
    "MOD-014",  # Costing & Financial Management
    "MOD-015",  # Freight Invoice & Revenue Management
    "MOD-016",  # Accounts Receivable & Credit Control
    "MOD-017",  # Accounts Payable & Vendor Management
    "MOD-041",  # General Ledger & Financial Reporting
    "MOD-040",  # Treasury & Cash Management
    "MOD-006",  # Customer Self-Service Portal
    "MOD-008",  # Customer Service Operations
    "MOD-013",  # Bunker & Fuel Management
    "MOD-018",  # Port Disbursement Accounting
    "MOD-019",  # Vessel Technical Management
    "MOD-020",  # Crew Management
    "MOD-021",  # Liner Trade Route Management
    "MOD-025",  # OOG & Special Cargo Management
    "MOD-026",  # Intermodal & ICD Operations
    "MOD-028",  # Survey & Inspection Management
    "MOD-029",  # Insurance & Claims Management
    "MOD-030",  # Port Agency Management
    "MOD-035",  # Audit & Compliance Management
    "MOD-037",  # HR & Payroll Shore Staff
    "MOD-038",  # Procurement & Supply Chain
    "MOD-039",  # Fixed Assets Management
    "MOD-042",  # Vessel Performance & Efficiency
    "MOD-043",  # Cargo Claims Management
    "MOD-044",  # Container Leasing Management
    "MOD-045",  # Port Tariff & Terminal Billing
    "MOD-046",  # Liner Operations Control
    "MOD-047",  # Agent Network Management
    "MOD-048",  # Sustainability & ESG Reporting
    "MOD-049",  # Real-Time IoT & Asset Tracking
    "MOD-051",  # Liner Revenue Management
    "MOD-052",  # Schedule & Voyage Planning
    "MOD-053",  # Transshipment Hub Management
    "MOD-056",  # Voyage Results & Settlement
    "MOD-057",  # Fleet Deployment Planning
    "MOD-058",  # Empty Container Repositioning AI
    "MOD-059",  # MARPOL & Environmental Compliance
    "MOD-060",  # Loss Prevention & Risk Management
    "MOD-004",  # Integration & EDI Layer (needs everything else first)
    "MOD-031",  # Analytics & BI (needs data from all modules)
    "MOD-001",  # Core AI Architecture (built last, references all modules)
    "MOD-002",  # Infrastructure & Security (final hardening)
    "MOD-050",  # Mobile Operations App (needs all APIs done)
    "MOD-054",  # Knowledge Management
    "MOD-055",  # Implementation & Change Management
]

# ─── DB helpers ───────────────────────────────────────────────────────────────

def psql(sql, db="codilla"):
    cmd = DB_CMD if db == "codilla" else DB_CS_CMD
    result = subprocess.run(cmd, input=sql, capture_output=True, text=True, timeout=15)
    return result.stdout.strip()

def get_module_info(mod_id):
    rows = psql(f"SELECT id, name, description FROM cs_erp_modules WHERE id='{mod_id}';")
    if not rows:
        return None
    parts = rows.split("|", 2)
    return {"id": parts[0], "name": parts[1], "description": parts[2] if len(parts) > 2 else ""}

def get_features(mod_id):
    rows = psql(f"SELECT id, name FROM cs_erp_features WHERE module_id='{mod_id}' ORDER BY id;")
    features = []
    for row in rows.splitlines():
        if "|" in row:
            fid, fname = row.split("|", 1)
            features.append({"id": fid.strip(), "name": fname.strip()})
    return features

def get_build_progress(mod_id):
    rows = psql(f"SELECT phase, status FROM cs_erp_build_progress WHERE module_id='{mod_id}' AND status='completed';")
    done = set()
    for row in rows.splitlines():
        if row.strip():
            phase = row.split("|")[0].strip()
            done.add(phase)
    return done

def mark_started(mod_id, phase):
    psql(f"""
        INSERT INTO cs_erp_build_progress (module_id, phase, status, started_at)
        VALUES ('{mod_id}', '{phase}', 'running', NOW())
        ON CONFLICT (module_id, phase) DO UPDATE SET status='running', started_at=NOW();
    """)

# ─── tmux helpers ─────────────────────────────────────────────────────────────

def tmux_send(text):
    subprocess.run(["tmux", "send-keys", "-t", TMUX_PANE, text, "Enter"],
                   capture_output=True)

def tmux_read(lines=50):
    result = subprocess.run(
        ["tmux", "capture-pane", "-t", TMUX_PANE, "-p", "-S", f"-{lines}"],
        capture_output=True, text=True)
    return result.stdout

def wait_for_signal(signal, timeout_min=45):
    """Poll tmux pane every 30s for signal string. Returns True if found."""
    deadline = time.time() + timeout_min * 60
    last_check = ""
    while time.time() < deadline:
        pane = tmux_read(100)
        if signal in pane:
            return True
        # Show last meaningful line for monitoring
        lines = [l for l in pane.splitlines() if l.strip() and not l.startswith("─")]
        if lines and lines[-1] != last_check:
            last_check = lines[-1]
            print(f"  [{datetime.now().strftime('%H:%M')}] {last_check[:80]}")
        time.sleep(30)
    return False

def ensure_tmux_session():
    """Make sure cserp tmux session exists as ubuntu user."""
    result = subprocess.run(["tmux", "has-session", "-t", TMUX_SESSION],
                            capture_output=True)
    if result.returncode != 0:
        subprocess.run([
            "tmux", "new-session", "-d", "-s", TMUX_SESSION,
            "-c", REPO_DIR,
            "sudo", "-u", "ubuntu", "bash"
        ])
        time.sleep(2)
        tmux_send(f"cd {REPO_DIR}")
        time.sleep(1)
    # Check if Claude Code is running
    pane = tmux_read(5)
    if "❯" not in pane and "claude" not in pane.lower():
        # Launch Claude Code as ubuntu
        tmux_send(f"sudo -u ubuntu bash -c 'cd {REPO_DIR} && claude --dangerously-skip-permissions'")
        time.sleep(8)

# ─── Task file generator ──────────────────────────────────────────────────────

def generate_task_file(mod_id, part, mod_info, features):
    """Generate a comprehensive task file for a module part."""
    mod_name    = mod_info["name"]
    mod_num     = mod_id.replace("MOD-", "")
    feat_list   = "\n".join(f"- {f['id']}: {f['name']}" for f in features)
    signal      = f"MOD{mod_num.zfill(3)}_P{part}_DONE"
    slug        = mod_name.lower().replace(" & ", "-").replace(" ", "-").replace(",", "").replace("(", "").replace(")", "")[:30]
    slug        = re.sub(r'-+', '-', slug).strip('-')

    if part == 1:
        content = f"""# CS ERP — {mod_id}: {mod_name} — Part 1 (Schema + Core APIs)

## Context
AI-First Container Shipping ERP for Qatar, UAE, KSA, India.
Repo: /root/cs-erp | URL: https://cs-erp.codilla.ai
DB: postgresql://codilla:lBpBckhQr0XyD8VRLg1PMOPRelvZhkXx@06-build-pgbouncer-1:5432/cs_erp
Direct DB for migrations: postgresql://codilla:lBpBckhQr0XyD8VRLg1PMOPRelvZhkXx@06-build-postgres-1:5432/cs_erp
Standards: /root/cs-erp/CLAUDE.md (READ THIS FIRST)

## Module: {mod_name}
{mod_info.get("description", "")}

## Features to implement:
{feat_list}

## Part 1 Deliverables

### 1. Database Schema
File: `src/db/schema/{slug}.ts`
Create Drizzle ORM schema covering all features above. Requirements:
- Every table: id (uuid PK gen_random_uuid()), tenant_id (FK tenants.id), created_at, updated_at (timestamptz)
- Soft deletes: deleted_at timestamptz nullable
- Enable RLS on all tables with tenant isolation policy
- Add all necessary indexes (especially FK columns and commonly filtered columns)
- Status/enum fields use string with check constraints
- All amounts in smallest currency unit (paise/fils/halalas) as integer
- Run `npx drizzle-kit generate --dialect postgresql` then apply migration

### 2. Core API Routes
Directory: `src/app/api/v1/{slug}/`
Implement CRUD + business logic for all features:
- `GET  /api/v1/{slug}` — list (paginated cursor-based, max 50, filterable)
- `POST /api/v1/{slug}` — create (Zod validation, permission check)
- `GET  /api/v1/{slug}/[id]` — single record
- `PATCH /api/v1/{slug}/[id]` — update
- `DELETE /api/v1/{slug}/[id]` — soft delete
- Additional domain-specific endpoints as needed per features

All routes:
- Import `{{ requireAuth }}` from '@/lib/auth'
- Import `{{ requirePermission }}` from '@/lib/rbac'
- Zod schema validation on all inputs
- Consistent response: `{{ data: T, meta? }}` or `{{ error }}`
- Handle not-found (404), validation errors (422), auth errors (401/403)

### 3. Type Definitions
File: `src/types/{slug}.ts`
Export TypeScript types for all entities.

### 4. Service Layer (optional but preferred for complex logic)
File: `src/lib/{slug}/service.ts`
Pure functions for business logic, testable in isolation.

## Quality Gates
1. `npx tsc --noEmit` → 0 errors
2. `npm run build` → success  
3. Migration applied successfully (check with `SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename LIKE '%{slug.replace("-", "_")}%';`)
4. GET /api/v1/{slug} without auth → 401
5. GET /api/v1/{slug} with valid auth → 200

## On Completion
```sql
INSERT INTO cs_erp_build_progress (module_id, phase, status, output, started_at, completed_at)
VALUES ('{mod_id}', 'codegen-p1', 'completed',
  '{{"module":"{mod_id}","part":1,"features":{len(features)}}}'::jsonb, NOW(), NOW())
ON CONFLICT (module_id, phase) DO UPDATE
SET status='completed', output=EXCLUDED.output, completed_at=NOW();
```
Then echo exactly: `{signal}`
"""

    else:  # part == 2
        content = f"""# CS ERP — {mod_id}: {mod_name} — Part 2 (UI Pages)

## Context
AI-First Container Shipping ERP for Qatar, UAE, KSA, India.
Repo: /root/cs-erp | URL: https://cs-erp.codilla.ai
DB: postgresql://codilla:lBpBckhQr0XyD8VRLg1PMOPRelvZhkXx@06-build-pgbouncer-1:5432/cs_erp
Standards: /root/cs-erp/CLAUDE.md (READ THIS FIRST)

## Module: {mod_name}
Part 1 (schema + API) already complete.

## Features:
{feat_list}

## Part 2 Deliverables

### 1. List Page
File: `src/app/(dashboard)/{slug}/page.tsx`
- Server component, fetches data server-side
- Table/list with pagination (cursor-based)
- Search bar + relevant filters
- "New" button (permission-gated)
- Loading skeleton (loading.tsx)
- Empty state with call-to-action

### 2. Detail / View Page
File: `src/app/(dashboard)/{slug}/[id]/page.tsx`
- Full record details
- Related data (fetch in parallel with Promise.all)
- Action buttons (edit, delete — permission-gated)
- Status display with badges

### 3. Create / Edit Form
File: `src/app/(dashboard)/{slug}/[id]/edit/page.tsx` (and `new/page.tsx`)
- Client component for form interactivity
- React Hook Form + Zod resolver
- All fields from schema
- Submit calls API route, handles errors with toast notifications
- Cancel returns to list/detail

### 4. Module Navigation
Add `{mod_name}` to sidebar navigation in `src/components/layout/sidebar.tsx`
under appropriate section with correct permission gate.

### 5. Module-Specific Components
Any specialized UI components this module needs (charts, maps, status flows, etc.)
Place in: `src/components/{slug}/`

## UI Standards
- All pages: dark mode support via CSS variables
- RTL support via logical CSS properties (ps/pe not pl/pr)
- Mobile responsive (works at 375px)
- Lucide icons only
- Toast notifications for success/error feedback
- Loading states on all async actions
- Radix UI primitives for complex components (modals, dropdowns, date pickers)

## Quality Gates
1. `npx tsc --noEmit` → 0 errors
2. `npm run build` → success
3. GET https://cs-erp.codilla.ai/{slug} → 200 after login
4. Create form submits successfully → record in DB
5. List shows created record with pagination

## On Completion
```sql
INSERT INTO cs_erp_build_progress (module_id, phase, status, output, started_at, completed_at)
VALUES ('{mod_id}', 'codegen-p2', 'completed',
  '{{"module":"{mod_id}","part":2,"features":{len(features)}}}'::jsonb, NOW(), NOW())
ON CONFLICT (module_id, phase) DO UPDATE
SET status='completed', output=EXCLUDED.output, completed_at=NOW();
```
Then echo exactly: `{signal}`
"""

    task_path = f"{TASK_DIR}/cc_{mod_id.lower().replace('-','')}_p{part}_task.md"
    with open(task_path, "w") as f:
        f.write(content)
    return task_path

# ─── Notification ─────────────────────────────────────────────────────────────

def notify(msg):
    """Send WhatsApp notification via openclaw CLI."""
    result = subprocess.run([
        "openclaw", "message", "send",
        "--channel", "whatsapp",
        "--target", WHATSAPP_TARGET,
        "-m", msg
    ], capture_output=True, text=True, timeout=10)
    print(f"  📱 Notified: {msg[:80]} (rc={result.returncode})")

# ─── Main build loop ──────────────────────────────────────────────────────────

def build_module_part(mod_id, part, dry_run=False):
    """Build one part of one module. Returns True on success."""
    mod_info = get_module_info(mod_id)
    if not mod_info:
        print(f"  ⚠️  Module {mod_id} not found in DB")
        return False

    features = get_features(mod_id)
    print(f"\n{'='*60}")
    print(f"  Building: {mod_id} — {mod_info['name']} — Part {part}")
    print(f"  Features: {len(features)}")
    print(f"{'='*60}")

    if dry_run:
        print(f"  [DRY RUN] Would generate task file and run Claude Code")
        return True

    # Generate task file (special case for MOD-000 p2 — already written)
    if mod_id == "MOD-000" and part == 2:
        task_path = f"{TASK_DIR}/cc_mod000_p2_task.md"
    else:
        task_path = generate_task_file(mod_id, part, mod_info, features)

    print(f"  Task file: {task_path}")

    # Mark as started in DB
    phase = f"codegen-p{part}"
    mark_started(mod_id, phase)

    # Send task to Claude Code in tmux
    ensure_tmux_session()

    signal = f"MOD{mod_id.replace('MOD-','').zfill(3)}_P{part}_DONE"

    # Wait for Claude Code to be idle at ❯ prompt (up to 5 min)
    print(f"  ⏳ Waiting for Claude Code prompt...")
    for _ in range(20):
        pane = tmux_read(10)
        if "❯" in pane and "Press up to edit" not in pane and "⏺" not in pane:
            break
        time.sleep(15)

    time.sleep(2)

    # Send the instruction to read and execute the task file
    task_msg = f"Please read and execute all instructions in {task_path}. Complete every deliverable then echo exactly: {signal}"
    subprocess.run(["tmux", "send-keys", "-t", TMUX_PANE, task_msg, "Enter"],
                   capture_output=True)
    time.sleep(5)

    print(f"  ⏳ Waiting for signal: {signal} (timeout: 45min)")

    if wait_for_signal(signal, timeout_min=45):
        print(f"  ✅ {mod_id} Part {part} COMPLETE")
        return True
    else:
        print(f"  ❌ TIMEOUT: {mod_id} Part {part} — check tmux session: cserp")
        return False

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--start", default=None, help="Start from this module ID (e.g. MOD-003)")
    parser.add_argument("--dry-run", action="store_true", help="Print plan without executing")
    parser.add_argument("--module", default=None, help="Build only this module")
    args = parser.parse_args()

    print(f"\n{'='*60}")
    print(f"  CS ERP Builder — {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print(f"  Modules: {len(BUILD_ORDER)} | Repo: {REPO_DIR}")
    print(f"{'='*60}\n")

    # Build queue
    queue = BUILD_ORDER if not args.module else [args.module]
    if args.start:
        try:
            idx = queue.index(args.start)
            queue = queue[idx:]
        except ValueError:
            print(f"Module {args.start} not in build order")
            sys.exit(1)

    completed = 0
    failed    = []

    for mod_id in queue:
        done_phases = get_build_progress(mod_id)
        total_parts = COMPLEX_MODULES.get(mod_id, 2)

        for part in range(1, total_parts + 1):
            phase = f"codegen-p{part}"
            if phase in done_phases:
                print(f"  ⏭️  {mod_id} Part {part} already done — skipping")
                continue

            success = build_module_part(mod_id, part, dry_run=args.dry_run)

            if success:
                completed += 1
                # Notify every module completion
                mod_info = get_module_info(mod_id)
                notify(f"✅ CS ERP: {mod_id} {mod_info['name']} Part {part} complete ({completed} modules done)")
            else:
                failed.append(f"{mod_id}-p{part}")
                notify(f"⚠️ CS ERP: {mod_id} Part {part} FAILED — check tmux cserp")
                # Continue with next module (don't block the whole pipeline)
                break

            # Small gap between sessions
            if not args.dry_run:
                time.sleep(10)

    print(f"\n{'='*60}")
    print(f"  Build complete: {completed} parts done, {len(failed)} failed")
    if failed:
        print(f"  Failed: {', '.join(failed)}")
    print(f"{'='*60}\n")
    notify(f"🎉 CS ERP Build Complete! {completed} parts done. {len(failed)} failed: {', '.join(failed)}")

if __name__ == "__main__":
    main()
