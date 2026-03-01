#!/usr/bin/env python3
"""Sync /root/cs-erp/src/ files into project_code_files table — v2 using psycopg2."""

import os
import sys
import subprocess

# Use docker exec + stdin with proper escaping via Python
PROJECT_ID = "ba9f6985-39ff-4d27-84b1-3820772fce2f"
PIPELINE_RUN_ID = "9fc609df-ff49-4b2a-aec2-4aca4a1710f0"
REPO = "/root/cs-erp"
SRC = os.path.join(REPO, "src")

MODULE_DIR_MAP = {
    "MOD-003": ["multi-entity-legal-structure"],
    "MOD-005": ["sales-crm"],
    "MOD-007": ["commercial-pricing-management"],
    "MOD-008": ["customer-service-operations"],
    "MOD-009": ["operations-documentation"],
    "MOD-010": ["equipment-control-yard-managem"],
    "MOD-011": ["capacity-voyage-management"],
    "MOD-012": ["chartering-vessel-management"],
    "MOD-032": ["master-data-management", "master-data"],
    "MOD-033": ["workflow-notification-engine"],
    "MOD-034": ["document-management-system"],
    "MOD-036": ["admin-portal"],
}

LANG_MAP = {
    ".ts": "typescript", ".tsx": "typescriptreact", ".css": "css",
    ".json": "json", ".sql": "sql", ".md": "markdown",
    ".js": "javascript", ".jsx": "javascriptreact", ".mjs": "javascript",
}

def detect_language(path):
    _, ext = os.path.splitext(path)
    return LANG_MAP.get(ext, "plaintext")

def detect_module(rel_path):
    for mod_id, slugs in MODULE_DIR_MAP.items():
        for slug in slugs:
            if slug in rel_path:
                return mod_id
    return "MOD-000"

def pg_escape(s):
    """Postgres dollar-quote safe escape."""
    # Use dollar quoting with unique tag to avoid issues with content
    return s

def main():
    files = []
    for root, dirs, filenames in os.walk(SRC):
        dirs[:] = [d for d in dirs if d not in ('node_modules', '.next', 'dist', '.git')]
        for f in filenames:
            full = os.path.join(root, f)
            rel = os.path.relpath(full, REPO)
            if os.path.getsize(full) > 500000:
                continue
            files.append((rel, full))
    
    for f in ["package.json", "tsconfig.json", "next.config.ts", "drizzle.config.ts", "tailwind.config.ts", "CLAUDE.md"]:
        full = os.path.join(REPO, f)
        if os.path.exists(full):
            files.append((f, full))

    print(f"Found {len(files)} files")
    
    # Delete existing
    delete_sql = f"DELETE FROM project_code_files WHERE project_id='{PROJECT_ID}' AND pipeline_run_id='{PIPELINE_RUN_ID}';\n"
    
    result = subprocess.run(
        ["docker", "exec", "-i", "06-build-postgres-1", "psql", "-U", "codilla", "-d", "codilla"],
        input=delete_sql.encode(), capture_output=True, timeout=30
    )
    print(f"Deleted old rows: {result.stdout.decode().strip()}")
    
    # Insert one at a time using dollar quoting
    success = 0
    errors = 0
    for i, (rel, full) in enumerate(files):
        try:
            with open(full, 'r', encoding='utf-8', errors='replace') as fh:
                content = fh.read()
        except:
            errors += 1
            continue
        
        lang = detect_language(rel)
        size = os.path.getsize(full)
        module = detect_module(rel)
        
        # Use $BODY$ dollar quoting for content
        tag = "$CSYNC$"
        if tag in content:
            tag = "$CSYNC2$"
        if tag in content:
            tag = "$CSYNC3$"
            
        sql = f"""INSERT INTO project_code_files (project_id, pipeline_run_id, file_path, content, language, size_bytes, generated_by, version, is_deleted, created_at, updated_at)
VALUES ('{PROJECT_ID}', '{PIPELINE_RUN_ID}', '{rel.replace("'", "''")}', {tag}{content}{tag}, '{lang}', {size}, '{module}', 1, false, NOW(), NOW());\n"""
        
        result = subprocess.run(
            ["docker", "exec", "-i", "06-build-postgres-1", "psql", "-U", "codilla", "-d", "codilla"],
            input=sql.encode('utf-8'), capture_output=True, timeout=15
        )
        
        if result.returncode == 0 and b'INSERT' in result.stdout:
            success += 1
        else:
            errors += 1
            if errors <= 3:
                print(f"  Error on {rel}: {result.stderr.decode()[:200]}")
        
        if (i+1) % 200 == 0:
            print(f"  Progress: {i+1}/{len(files)} ({success} ok, {errors} err)")
    
    print(f"\n✅ Done: {success} synced, {errors} errors out of {len(files)} files")

if __name__ == "__main__":
    main()

