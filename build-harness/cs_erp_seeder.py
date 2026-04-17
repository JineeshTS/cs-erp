#!/usr/bin/env python3
"""
CS ERP DB Seeder — reusable utility.
Claude Code only needs to import this and call seed_module(data).
No bash escaping issues — uses psql stdin directly.
"""
import subprocess
import json
import sys

def run_sql(sql: str):
    """Run SQL via psql stdin — handles all escaping safely."""
    result = subprocess.run(
        ["docker", "exec", "-i", "06-build-postgres-1",
         "psql", "-U", "codilla", "-d", "codilla", "--no-psqlrc", "-v", "ON_ERROR_STOP=1"],
        input=sql.encode(),
        capture_output=True
    )
    if result.returncode != 0:
        print(f"SQL ERROR: {result.stderr.decode()[:500]}", file=sys.stderr)
    else:
        print(f"OK: {result.stdout.decode()[:200]}")
    return result.returncode == 0

def escape(s: str) -> str:
    """Escape single quotes for SQL."""
    if s is None:
        return "NULL"
    return "'" + str(s).replace("'", "''") + "'"

def seed_module(module: dict):
    """
    Seed one module with all its features and requirements.
    
    module = {
        "id": "MOD-002",
        "name": "...",
        "description": "...",
        "priority": "must_have",
        "depends_on": ["MOD-001"],
        "service_name": "infra-service",
        "port": 4002,
        "features": [
            {
                "id": "FEAT-002-001",
                "name": "...",
                "description": "...",
                "ai_automated": True,
                "requirements": [
                    {
                        "id": "REQ-002-001",
                        "title": "...",
                        "description": "...",
                        "priority": "must_have",
                        "ai_agent": "...",
                        "human_touchpoint": "...",
                        "acceptance_criteria": ["AC1", "AC2"]
                    }
                ]
            }
        ]
    }
    """
    mod_id = module["id"]
    print(f"\n=== Seeding {mod_id}: {module['name']} ===")

    # Insert module
    depends = json.dumps(module.get("depends_on", []))
    sql = f"""
INSERT INTO cs_erp_modules (id, name, description, priority, depends_on, service_name, port)
VALUES (
    {escape(mod_id)},
    {escape(module['name'])},
    {escape(module.get('description', ''))},
    {escape(module.get('priority', 'must_have'))},
    {escape(depends)}::jsonb,
    {escape(module.get('service_name', ''))},
    {module.get('port', 'NULL')}
) ON CONFLICT (id) DO UPDATE SET
    name=EXCLUDED.name,
    description=EXCLUDED.description;
"""
    run_sql(sql)

    total_reqs = 0
    for feat in module.get("features", []):
        feat_id = feat["id"]
        # Insert feature
        sql = f"""
INSERT INTO cs_erp_features (id, module_id, name, description, ai_automated)
VALUES (
    {escape(feat_id)},
    {escape(mod_id)},
    {escape(feat['name'])},
    {escape(feat.get('description', ''))},
    {'true' if feat.get('ai_automated', True) else 'false'}
) ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name;
"""
        run_sql(sql)

        for req in feat.get("requirements", []):
            req_id = req["id"]
            criteria = json.dumps(req.get("acceptance_criteria", []))
            sql = f"""
INSERT INTO cs_erp_requirements (id, feature_id, module_id, title, description, priority, ai_agent, human_touchpoint, acceptance_criteria)
VALUES (
    {escape(req_id)},
    {escape(feat_id)},
    {escape(mod_id)},
    {escape(req['title'])},
    {escape(req.get('description', ''))},
    {escape(req.get('priority', 'must_have'))},
    {escape(req.get('ai_agent', ''))},
    {escape(req.get('human_touchpoint', ''))},
    {escape(criteria)}::jsonb
) ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title;
"""
            run_sql(sql)
            total_reqs += 1

    # Mark progress
    run_sql(f"""
INSERT INTO cs_erp_build_progress (module_id, phase, status, completed_at)
VALUES ({escape(mod_id)}, 'spec', 'done', NOW());
""")

    print(f"=== {mod_id} complete: {len(module.get('features',[]))} features, {total_reqs} requirements ===")
    return total_reqs


def get_progress():
    """Check what modules are already seeded."""
    result = subprocess.run(
        ["docker", "exec", "-i", "06-build-postgres-1",
         "psql", "-U", "codilla", "-d", "codilla", "-t", "-c",
         "SELECT module_id FROM cs_erp_build_progress WHERE phase='spec' AND status='done';"],
        capture_output=True, text=True
    )
    return [r.strip() for r in result.stdout.strip().split('\n') if r.strip()]


if __name__ == "__main__":
    done = get_progress()
    print(f"Already seeded: {done}")
