#!/usr/bin/env python3
"""
CS ERP Fast Pipeline Automation
Triggers the Codilla Fast Pipeline for each CS ERP module in order.
Creates a Codilla project per module, generates productBrief from DB specs,
triggers Fast Pipeline, waits for completion, then moves to next module.

Usage: python3 /root/cs_erp_pipeline.py
Logs:  /tmp/cs_erp_pipeline.log
State: /root/cs_erp_pipeline_state.json
"""

import subprocess, json, os, time, logging, re
import urllib.request, urllib.error
import uuid
from datetime import datetime

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s %(levelname)s %(message)s',
    handlers=[
        logging.FileHandler('/tmp/cs_erp_pipeline.log'),
        logging.StreamHandler()
    ]
)
log = logging.getLogger('cs-erp-pipeline')

# ─── Config ─────────────────────────────────────────────────────────────────
INTERNAL_API_KEY   = "94f7b736-4696-45eb-a32d-8cccfb5a547e"
CODILLA_BASE_URL   = "http://172.20.0.13:3000"   # internal Docker network
OWNER_USER_ID      = "c04ef36d-928a-4cb6-8d15-ca05f1c4212a"  # jineeshs@gmail.com
STATE_FILE         = "/root/cs_erp_pipeline_state.json"
POLL_INTERVAL      = 30   # seconds between status checks
PIPELINE_TIMEOUT   = 3600 # 1 hour max per module

# ─── Module Build Order ──────────────────────────────────────────────────────
# Foundation first, then ERP modules in dependency order
BUILD_ORDER = [
    # Phase 0 — SaaS Foundation (Auth + RBAC + Multi-Tenant + Admin + Dashboard + Onboarding)
    {"project_name": "CS ERP — SaaS Foundation",
     "module_ids": ["MOD-000"],
     "brief_override": None},

    # Phase 1 — Core Infrastructure (all other modules depend on these)
    {"project_name": "CS ERP — Core AI Architecture & Agent Framework",
     "module_ids": ["MOD-001"],
     "brief_override": None},
    {"project_name": "CS ERP — Infrastructure & Security Foundation",
     "module_ids": ["MOD-002"],
     "brief_override": None},

    {"project_name": "CS ERP — Admin Portal & System Configuration",
     "module_ids": ["MOD-036"],
     "brief_override": None},

    {"project_name": "CS ERP — Master Data Management",
     "module_ids": ["MOD-032"],
     "brief_override": None},

    # Phase 2 — Core ERP
    {"project_name": "CS ERP — Multi-Entity & Legal Structure",     "module_ids": ["MOD-003"], "brief_override": None},
    {"project_name": "CS ERP — Sales & CRM",                        "module_ids": ["MOD-005"], "brief_override": None},
    {"project_name": "CS ERP — Customer Self-Service Portal",        "module_ids": ["MOD-006"], "brief_override": None},
    {"project_name": "CS ERP — Commercial & Pricing Management",     "module_ids": ["MOD-007"], "brief_override": None},
    {"project_name": "CS ERP — Customer Service Operations",         "module_ids": ["MOD-008"], "brief_override": None},
    {"project_name": "CS ERP — Operations & Documentation",          "module_ids": ["MOD-009"], "brief_override": None},
    {"project_name": "CS ERP — Equipment Control & Yard Management", "module_ids": ["MOD-010"], "brief_override": None},
    {"project_name": "CS ERP — Capacity & Voyage Management",        "module_ids": ["MOD-011"], "brief_override": None},
    {"project_name": "CS ERP — Chartering & Vessel Management",      "module_ids": ["MOD-012"], "brief_override": None},
    {"project_name": "CS ERP — Freight Invoice & Revenue",           "module_ids": ["MOD-015"], "brief_override": None},
    {"project_name": "CS ERP — Accounts Receivable & Credit",        "module_ids": ["MOD-016"], "brief_override": None},
    {"project_name": "CS ERP — Accounts Payable & Vendors",          "module_ids": ["MOD-017"], "brief_override": None},
    {"project_name": "CS ERP — Demurrage & Detention Management",    "module_ids": ["MOD-022"], "brief_override": None},
    {"project_name": "CS ERP — Dangerous Goods Management",          "module_ids": ["MOD-023"], "brief_override": None},
    {"project_name": "CS ERP — Reefer Container Management",         "module_ids": ["MOD-024"], "brief_override": None},
    {"project_name": "CS ERP — Analytics & Business Intelligence",   "module_ids": ["MOD-031"], "brief_override": None},
    {"project_name": "CS ERP — Integration & EDI Layer",             "module_ids": ["MOD-004"], "brief_override": None},
    {"project_name": "CS ERP — Workflow & Notification Engine",      "module_ids": ["MOD-033"], "brief_override": None},
    {"project_name": "CS ERP — Document Management System",          "module_ids": ["MOD-034"], "brief_override": None},
    {"project_name": "CS ERP — Costing & Financial Management",      "module_ids": ["MOD-014"], "brief_override": None},
    {"project_name": "CS ERP — General Ledger & Financial Reporting","module_ids": ["MOD-041"], "brief_override": None},
    {"project_name": "CS ERP — Treasury & Cash Management",          "module_ids": ["MOD-040"], "brief_override": None},
    {"project_name": "CS ERP — Customs Compliance & Regulatory",     "module_ids": ["MOD-027"], "brief_override": None},
    {"project_name": "CS ERP — Port Agency Management",              "module_ids": ["MOD-030"], "brief_override": None},
    {"project_name": "CS ERP — Vessel Technical Management",         "module_ids": ["MOD-019"], "brief_override": None},
    {"project_name": "CS ERP — Vessel Performance & Efficiency",     "module_ids": ["MOD-042"], "brief_override": None},
    {"project_name": "CS ERP — Crew Management",                     "module_ids": ["MOD-020"], "brief_override": None},
    {"project_name": "CS ERP — Bunker & Fuel Management",            "module_ids": ["MOD-013"], "brief_override": None},
    {"project_name": "CS ERP — Port Disbursement Accounting",        "module_ids": ["MOD-018"], "brief_override": None},
    {"project_name": "CS ERP — OOG & Special Cargo",                 "module_ids": ["MOD-025"], "brief_override": None},
    {"project_name": "CS ERP — Survey & Inspection Management",      "module_ids": ["MOD-028"], "brief_override": None},
    {"project_name": "CS ERP — Insurance & Claims Management",       "module_ids": ["MOD-029"], "brief_override": None},
    {"project_name": "CS ERP — Liner Trade Route Management",        "module_ids": ["MOD-021"], "brief_override": None},
    {"project_name": "CS ERP — Cargo Claims Management",             "module_ids": ["MOD-043"], "brief_override": None},
    {"project_name": "CS ERP — Container Leasing Management",        "module_ids": ["MOD-044"], "brief_override": None},
    {"project_name": "CS ERP — Intermodal & ICD Operations",         "module_ids": ["MOD-026"], "brief_override": None},
    {"project_name": "CS ERP — Port Tariff & Terminal Billing",      "module_ids": ["MOD-045"], "brief_override": None},
    {"project_name": "CS ERP — Liner Operations Control",            "module_ids": ["MOD-046"], "brief_override": None},
    {"project_name": "CS ERP — Agent Network Management",            "module_ids": ["MOD-047"], "brief_override": None},
    {"project_name": "CS ERP — Sustainability & ESG Reporting",      "module_ids": ["MOD-048"], "brief_override": None},
    {"project_name": "CS ERP — Real-Time IoT & Asset Tracking",      "module_ids": ["MOD-049"], "brief_override": None},
    {"project_name": "CS ERP — Mobile Operations App",               "module_ids": ["MOD-050"], "brief_override": None},
    {"project_name": "CS ERP — Liner Revenue Management",            "module_ids": ["MOD-051"], "brief_override": None},
    {"project_name": "CS ERP — Schedule & Voyage Planning",          "module_ids": ["MOD-052"], "brief_override": None},
    {"project_name": "CS ERP — Transshipment Hub Management",        "module_ids": ["MOD-053"], "brief_override": None},
    {"project_name": "CS ERP — Knowledge Management & Training",     "module_ids": ["MOD-054"], "brief_override": None},
    {"project_name": "CS ERP — HR & Payroll Shore Staff",            "module_ids": ["MOD-037"], "brief_override": None},
    {"project_name": "CS ERP — Procurement & Supply Chain",          "module_ids": ["MOD-038"], "brief_override": None},
    {"project_name": "CS ERP — Fixed Assets Management",             "module_ids": ["MOD-039"], "brief_override": None},
    {"project_name": "CS ERP — Voyage Results & Settlement",         "module_ids": ["MOD-056"], "brief_override": None},
    {"project_name": "CS ERP — Fleet Deployment Planning",           "module_ids": ["MOD-057"], "brief_override": None},
    {"project_name": "CS ERP — Empty Container Repositioning AI",    "module_ids": ["MOD-058"], "brief_override": None},
    {"project_name": "CS ERP — MARPOL & Environmental Compliance",   "module_ids": ["MOD-059"], "brief_override": None},
    {"project_name": "CS ERP — Loss Prevention & Risk Management",   "module_ids": ["MOD-060"], "brief_override": None},
    {"project_name": "CS ERP — Audit & Compliance Management",       "module_ids": ["MOD-035"], "brief_override": None},
    {"project_name": "CS ERP — Core AI Architecture",                "module_ids": ["MOD-001"], "brief_override": None},
    {"project_name": "CS ERP — Infrastructure & Security",           "module_ids": ["MOD-002"], "brief_override": None},
    {"project_name": "CS ERP — Implementation & Change Management",  "module_ids": ["MOD-055"], "brief_override": None},
]

# ─── DB Helpers ──────────────────────────────────────────────────────────────
def psql(sql: str) -> str:
    r = subprocess.run(
        ["docker","exec","-i","06-build-postgres-1","psql","-U","codilla","-d","codilla","-t","-c",sql],
        capture_output=True, text=True
    )
    return r.stdout.strip()

def generate_product_brief(module_ids: list) -> str:
    """Generate a rich productBrief from CS ERP DB specs."""
    lines = ["# CS ERP Module Specification\n"]
    lines.append("This is a module for an AI-First Container Shipping ERP serving Qatar/Dubai/KSA/India operations.")
    lines.append("Operations at Hamad Port (Qatar), Khalifa Port (Abu Dhabi), Jebel Ali (Dubai), JNPT (India).")
    lines.append("95% AI-automated. Arabic + English. Multi-currency (USD/AED/QAR/SAR/INR). Multi-entity.\n")

    for mod_id in module_ids:
        # Get module info
        mod_row = psql(f"SELECT id, name, service_name, port FROM cs_erp_modules WHERE id='{mod_id}';")
        if not mod_row:
            continue
        parts = [p.strip() for p in mod_row.split('|')]
        mod_name = parts[1] if len(parts) > 1 else mod_id

        lines.append(f"## Module: {mod_id} — {mod_name}\n")

        # Get features
        feats = psql(f"""
        SELECT f.id, f.name, f.description,
               COUNT(r.id) as req_count
        FROM cs_erp_features f
        LEFT JOIN cs_erp_requirements r ON r.feature_id=f.id
        WHERE f.module_id='{mod_id}'
        GROUP BY f.id, f.name, f.description
        ORDER BY f.id;
        """)

        for feat_line in feats.split('\n'):
            if '|' not in feat_line:
                continue
            fp = [p.strip() for p in feat_line.split('|')]
            if len(fp) < 4:
                continue
            fid, fname, fdesc, rcount = fp[0], fp[1], fp[2], fp[3]

            lines.append(f"### Feature: {fid} — {fname}")
            if fdesc:
                lines.append(fdesc)
            lines.append("")

            # Get requirements for this feature
            reqs = psql(f"""
            SELECT r.id, r.title, r.description
            FROM cs_erp_requirements r
            WHERE r.feature_id='{fid}'
            ORDER BY r.id;
            """)
            lines.append("**Requirements:**")
            for req_line in reqs.split('\n'):
                if '|' not in req_line:
                    continue
                rp = [p.strip() for p in req_line.split('|')]
                if len(rp) < 3:
                    continue
                rid, rtitle, rdesc = rp[0], rp[1], rp[2]
                lines.append(f"- [{rid}] {rtitle}: {rdesc}")
            lines.append("")

    return '\n'.join(lines)

# ─── HTTP Helpers ─────────────────────────────────────────────────────────────
def http_post(url: str, body: dict) -> dict:
    data = json.dumps(body).encode('utf-8')
    req = urllib.request.Request(
        url,
        data=data,
        headers={
            'Content-Type': 'application/json',
            'x-internal-api-key': INTERNAL_API_KEY,
        },
        method='POST'
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        body_txt = e.read().decode()
        raise RuntimeError(f"HTTP {e.code}: {body_txt}")

def http_get(url: str) -> dict:
    req = urllib.request.Request(
        url,
        headers={'x-internal-api-key': INTERNAL_API_KEY},
        method='GET'
    )
    with urllib.request.urlopen(req, timeout=10) as resp:
        return json.loads(resp.read())

# ─── State Management ─────────────────────────────────────────────────────────
def load_state() -> dict:
    if os.path.exists(STATE_FILE):
        try:
            return json.load(open(STATE_FILE))
        except:
            pass
    return {"completed": [], "projects": {}}

def save_state(state: dict):
    json.dump(state, open(STATE_FILE, 'w'), indent=2)

# ─── Codilla Project Management ───────────────────────────────────────────────
def create_codilla_project(name: str) -> str:
    """Create a project in Codilla DB directly (bypasses UI flow)."""
    project_id = str(uuid.uuid4())
    psql(f"""
    INSERT INTO projects (id, user_id, name, status, tech_type, created_at, updated_at)
    VALUES (
        '{project_id}',
        '{OWNER_USER_ID}',
        {repr(name)},
        'active',
        'fullstack_saas',
        NOW(), NOW()
    ) ON CONFLICT DO NOTHING;
    """)
    log.info(f"  Created Codilla project: {project_id} — {name}")
    return project_id

def get_pipeline_status(project_id: str) -> dict:
    """Check Fast Pipeline run status for a project."""
    result = psql(f"""
    SELECT current_phase, blueprint_status, code_gen_status, deploy_status, deploy_url, error_message
    FROM fast_pipeline_runs
    WHERE project_id='{project_id}'
    ORDER BY created_at DESC LIMIT 1;
    """)
    if not result or '|' not in result:
        return {}
    parts = [p.strip() for p in result.split('|')]
    return {
        'current_phase':     parts[0] if len(parts) > 0 else '',
        'blueprint_status':  parts[1] if len(parts) > 1 else '',
        'code_gen_status':   parts[2] if len(parts) > 2 else '',
        'deploy_status':     parts[3] if len(parts) > 3 else '',
        'deploy_url':        parts[4] if len(parts) > 4 else '',
        'error_message':     parts[5] if len(parts) > 5 else '',
    }

def wait_for_pipeline(project_id: str, project_name: str) -> bool:
    """Wait for Fast Pipeline to complete. Returns True if success."""
    start = time.time()
    log.info(f"  Monitoring pipeline for {project_name}...")

    while time.time() - start < PIPELINE_TIMEOUT:
        status = get_pipeline_status(project_id)
        phase = status.get('current_phase', '')

        log.info(f"  Phase: {phase} | Blueprint: {status.get('blueprint_status')} | "
                 f"CodeGen: {status.get('code_gen_status')} | Deploy: {status.get('deploy_status')}")

        if phase == 'deployed':
            url = status.get('deploy_url', '')
            log.info(f"  ✅ DEPLOYED! URL: {url}")
            return True
        elif phase == 'failed':
            log.error(f"  ❌ FAILED: {status.get('error_message', 'unknown error')}")
            return False

        time.sleep(POLL_INTERVAL)

    log.error(f"  ⏱ TIMEOUT after {PIPELINE_TIMEOUT}s")
    return False

# ─── Main ─────────────────────────────────────────────────────────────────────
def main():
    log.info("=" * 60)
    log.info("CS ERP Fast Pipeline Automation")
    log.info(f"Modules to process: {len(BUILD_ORDER)}")
    log.info("=" * 60)

    state = load_state()
    completed = set(state.get("completed", []))
    projects = state.get("projects", {})

    for idx, item in enumerate(BUILD_ORDER, 1):
        name = item["project_name"]
        key = name

        if key in completed:
            log.info(f"⏭  [{idx}/{len(BUILD_ORDER)}] Skipping: {name}")
            continue

        log.info(f"\n{'─'*50}")
        log.info(f"▶  [{idx}/{len(BUILD_ORDER)}] {name}")

        # Generate product brief
        if item["brief_override"]:
            brief = item["brief_override"].strip()
            log.info(f"  Using custom brief ({len(brief)} chars)")
        else:
            log.info(f"  Generating brief from DB for modules: {item['module_ids']}")
            brief = generate_product_brief(item["module_ids"])
            log.info(f"  Brief generated: {len(brief)} chars")

        # Create or reuse Codilla project
        if name in projects:
            project_id = projects[name]
            log.info(f"  Reusing project: {project_id}")
        else:
            project_id = create_codilla_project(name)
            projects[name] = project_id
            state["projects"] = projects
            save_state(state)

        # Trigger Fast Pipeline
        log.info(f"  Triggering Fast Pipeline...")
        try:
            resp = http_post(
                f"{CODILLA_BASE_URL}/api/internal/fast-pipeline-execute",
                {
                    "projectId": project_id,
                    "userId": OWNER_USER_ID,
                    "productBrief": brief,
                    "projectName": name,
                    "productType": "fullstack_saas",
                }
            )
            log.info(f"  Pipeline queued: {resp}")
        except Exception as e:
            log.error(f"  Failed to trigger pipeline: {e}")
            continue

        # Wait for completion
        success = wait_for_pipeline(project_id, name)

        if success:
            completed.add(key)
            state["completed"] = list(completed)
            save_state(state)
            log.info(f"  ✅ {name} — COMPLETE ({idx}/{len(BUILD_ORDER)})")
        else:
            log.error(f"  ❌ {name} — FAILED (will retry next run)")

    log.info("\n" + "=" * 60)
    log.info(f"COMPLETE: {len(completed)}/{len(BUILD_ORDER)} modules processed")
    log.info("=" * 60)

if __name__ == '__main__':
    main()
