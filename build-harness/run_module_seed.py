#!/usr/bin/env python3
"""
Runner: reads /tmp/module_data.json and seeds to DB.
Claude Code only writes the JSON file — no Python execution needed in prompt.
Run: python3 /root/run_module_seed.py
"""
import subprocess, json, sys

def run_sql(sql: str):
    result = subprocess.run(
        ["docker", "exec", "-i", "06-build-postgres-1",
         "psql", "-U", "codilla", "-d", "codilla", "--no-psqlrc"],
        input=sql.encode(), capture_output=True
    )
    out = result.stdout.decode()
    err = result.stderr.decode()
    if "ERROR" in err:
        print(f"SQL ERR: {err[:300]}", file=sys.stderr)
    return result.returncode == 0

def esc(s):
    if s is None: return "NULL"
    return "'" + str(s).replace("'", "''") + "'"


def normalize(data):
    """Handle any JSON structure Claude Code might generate."""
    # Normalize top-level module fields
    if 'module' in data and 'id' not in data:
        data['id'] = data.pop('module')
    if 'module_title' in data and 'name' not in data:
        data['name'] = data.pop('module_title')
    if 'module_name' in data and 'name' not in data:
        data['name'] = data.pop('module_name')
    if 'module_id' in data and 'id' not in data:
        data['id'] = data.pop('module_id')
    # Normalize features list key
    for key in ['feature_list','feature_groups','sections']:
        if key in data and 'features' not in data:
            data['features'] = data.pop(key)
    # Normalize each feature
    for f in data.get('features',[]):
        if 'feature_id' in f and 'id' not in f:
            f['id'] = f.pop('feature_id')
        if 'feature_title' in f and 'title' not in f:
            f['title'] = f.pop('feature_title')
        # Normalize requirements list
        for rkey in ['atomic_requirements','requirement_list','items','criteria']:
            if rkey in f and 'requirements' not in f and 'acceptance_criteria' not in f:
                f['requirements'] = f.pop(rkey)
    return data

def seed(module):
    mid = module["id"]
    print(f"\n>>> {mid}: {module['name']}")
    depends = module.get("depends_on", [])
    depends_sql = "ARRAY[" + ",".join(esc(d) for d in depends) + "]::text[]" if depends else "'{}'::text[]"
    port_val = str(module['port']) if module.get('port') else 'NULL'
    run_sql(f"""
INSERT INTO cs_erp_modules (id,name,description,priority,depends_on,service_name,port)
VALUES ({esc(mid)},{esc(module['name'])},{esc(module.get('description',''))},
{esc(module.get('priority','must_have'))},{depends_sql},
{esc(module.get('service_name',''))},{port_val})
ON CONFLICT (id) DO UPDATE SET description=EXCLUDED.description, service_name=EXCLUDED.service_name;
""")
    total = 0
    for f in module.get("features", []):
        fid = f["id"]
        run_sql(f"""
INSERT INTO cs_erp_features (id,module_id,name,description,ai_automated)
VALUES ({esc(fid)},{esc(mid)},{esc(f.get('name') or f.get('title') or fid)},{esc(f.get('description',''))},
{'true' if f.get('ai_automated',True) else 'false'})
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name;
""")
        reqs = f.get('requirements') or []
        if not reqs:
            ac = f.get('acceptance_criteria', [])
            if ac and isinstance(ac[0], dict) and 'id' in ac[0]:
                reqs = ac
            elif ac and isinstance(ac[0], str):
                reqs = [{'id': f'{fid}-R{i+1:03d}', 'title': s[:200], 'description': s, 'priority': 'must_have'} for i,s in enumerate(ac)]
        for r in reqs:
            rid = r["id"]
            ac = json.dumps(r.get("acceptance_criteria", []))
            title = r.get('title') or r.get('text') or r.get('name') or rid
            desc = r.get('description') or r.get('detail') or r.get('text') or ''
            run_sql(f"""
INSERT INTO cs_erp_requirements (id,feature_id,module_id,title,description,priority,ai_agent,human_touchpoint,acceptance_criteria)
VALUES ({esc(rid)},{esc(fid)},{esc(mid)},{esc(title)},{esc(desc)},
{esc(r.get('priority','must_have'))},{esc(r.get('ai_agent',''))},
{esc(r.get('human_touchpoint',''))},{esc(ac)}::jsonb)
ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title;
""")
            total += 1
    run_sql(f"""
INSERT INTO cs_erp_build_progress (module_id,phase,status,completed_at)
VALUES ({esc(mid)},'spec','done',NOW())
ON CONFLICT DO NOTHING;
""")
    print(f">>> Done: {len(module.get('features',[]))} features, {total} requirements")

if __name__ == "__main__":
    data = normalize(json.load(open("/tmp/module_data.json")))
    seed(data)
    result = subprocess.run(
        ["docker","exec","-i","06-build-postgres-1","psql","-U","codilla","-d","codilla","-t","-c",
         "SELECT module_id, COUNT(*) FROM cs_erp_requirements GROUP BY module_id ORDER BY module_id;"],
        capture_output=True, text=True)
    print("\nDB totals:\n", result.stdout)
