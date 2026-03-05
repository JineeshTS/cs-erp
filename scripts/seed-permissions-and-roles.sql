-- Seed all missing module permissions (CRUD for each resource)
-- Each resource gets: create, read, edit, delete
-- Some also get: approve, export, manage

DO $$
DECLARE
  resources TEXT[] := ARRAY[
    'anm', 'asset', 'audit', 'ccm', 'clm', 'gl', 'hr', 'iot',
    'loc', 'lrm', 'mob', 'procurement', 'ptt', 'ser', 'svp',
    'thm', 'treasury', 'vpe', 'mec'
  ];
  actions TEXT[] := ARRAY['create', 'read', 'edit', 'delete'];
  r TEXT;
  a TEXT;
BEGIN
  FOREACH r IN ARRAY resources LOOP
    FOREACH a IN ARRAY actions LOOP
      INSERT INTO permissions (id, name, resource, action, description)
      VALUES (
        gen_random_uuid(),
        r || ':' || a,
        r,
        a,
        'Can ' || a || ' ' || r || ' records'
      )
      ON CONFLICT (name) DO NOTHING;
    END LOOP;
  END LOOP;
END $$;

-- Add approve/export/manage for key resources that don't have them yet
DO $$
DECLARE
  approve_resources TEXT[] := ARRAY[
    'bunker', 'chartering', 'costing', 'demurrage', 'disbursement',
    'invoice', 'payable', 'receivable', 'insurance', 'treasury', 'gl',
    'procurement', 'customs', 'dangerous_goods'
  ];
  export_resources TEXT[] := ARRAY[
    'analytics', 'finance', 'reports', 'invoice', 'payable', 'receivable',
    'gl', 'treasury', 'customs', 'operations'
  ];
  manage_resources TEXT[] := ARRAY[
    'admin', 'infra', 'system', 'tenants', 'users', 'roles',
    'workflows', 'notifications', 'integration', 'ai'
  ];
  r TEXT;
BEGIN
  FOREACH r IN ARRAY approve_resources LOOP
    INSERT INTO permissions (id, name, resource, action, description)
    VALUES (gen_random_uuid(), r || ':approve', r, 'approve', 'Can approve ' || r || ' records')
    ON CONFLICT (name) DO NOTHING;
  END LOOP;
  FOREACH r IN ARRAY export_resources LOOP
    INSERT INTO permissions (id, name, resource, action, description)
    VALUES (gen_random_uuid(), r || ':export', r, 'export', 'Can export ' || r || ' data')
    ON CONFLICT (name) DO NOTHING;
  END LOOP;
  FOREACH r IN ARRAY manage_resources LOOP
    INSERT INTO permissions (id, name, resource, action, description)
    VALUES (gen_random_uuid(), r || ':manage', r, 'manage', 'Can manage ' || r || ' settings')
    ON CONFLICT (name) DO NOTHING;
  END LOOP;
END $$;

-- Get tenant ID
DO $$
DECLARE
  tid UUID;
  rid UUID;
  all_perm_ids UUID[];
  ops_perm_ids UUID[];
  fin_perm_ids UUID[];
  com_perm_ids UUID[];
  cust_perm_ids UUID[];
  doc_perm_ids UUID[];
  hub_perm_ids UUID[];
  trade_perm_ids UUID[];
BEGIN
  SELECT id INTO tid FROM tenants LIMIT 1;
  IF tid IS NULL THEN
    RAISE NOTICE 'No tenant found, skipping role seeding';
    RETURN;
  END IF;

  -- Helper: collect all permission IDs
  SELECT array_agg(id) INTO all_perm_ids FROM permissions;

  -- Operations permissions (operations, capacity, equipment, vessels, crew, port_agency, intermodal, containers, reefer, oog_special, thm, svp)
  SELECT array_agg(id) INTO ops_perm_ids FROM permissions
  WHERE resource IN ('operations', 'capacity', 'equipment', 'vessels', 'crew', 'port_agency', 'intermodal', 'containers', 'reefer', 'oog_special', 'thm', 'svp', 'routing', 'cargo', 'bookings', 'documents');

  -- Finance permissions (invoice, payable, receivable, costing, demurrage, disbursement, gl, treasury, insurance, finance)
  SELECT array_agg(id) INTO fin_perm_ids FROM permissions
  WHERE resource IN ('invoice', 'payable', 'receivable', 'costing', 'demurrage', 'disbursement', 'gl', 'treasury', 'insurance', 'finance', 'bunker');

  -- Commercial permissions (sales, commercial, liner, chartering, pricing, analytics)
  SELECT array_agg(id) INTO com_perm_ids FROM permissions
  WHERE resource IN ('sales', 'commercial', 'liner', 'chartering', 'analytics', 'ccm', 'clm');

  -- Customs permissions (customs, dangerous_goods, documents, compliance, mec)
  SELECT array_agg(id) INTO cust_perm_ids FROM permissions
  WHERE resource IN ('customs', 'dangerous_goods', 'documents', 'mec', 'survey');

  -- Documentation permissions (operations, documents, customs, bookings)
  SELECT array_agg(id) INTO doc_perm_ids FROM permissions
  WHERE resource IN ('operations', 'documents', 'customs', 'bookings', 'cargo', 'containers');

  -- Hub operations permissions (thm, vessels, equipment, operations, containers)
  SELECT array_agg(id) INTO hub_perm_ids FROM permissions
  WHERE resource IN ('thm', 'vessels', 'equipment', 'operations', 'containers', 'svp', 'port_agency');

  -- Trade permissions (liner, analytics, commercial, sales, chartering)
  SELECT array_agg(id) INTO trade_perm_ids FROM permissions
  WHERE resource IN ('liner', 'analytics', 'commercial', 'sales', 'chartering', 'reports');

  -------------------------------------------------------------------
  -- GLOBAL ROLES
  -------------------------------------------------------------------

  -- Super Admin (all permissions)
  INSERT INTO roles (id, tenant_id, name, description, is_system, country, region, permissions)
  VALUES (gen_random_uuid(), tid, 'Super Admin', 'Full system access across all modules and countries', true, NULL, NULL, '["*"]')
  ON CONFLICT DO NOTHING
  RETURNING id INTO rid;
  IF rid IS NOT NULL AND all_perm_ids IS NOT NULL THEN
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT rid, unnest(all_perm_ids)
    ON CONFLICT DO NOTHING;
  END IF;

  -- System Admin (all except financial approvals)
  INSERT INTO roles (id, tenant_id, name, description, is_system, country, region, permissions)
  VALUES (gen_random_uuid(), tid, 'System Admin', 'System administration without financial approval authority', true, NULL, NULL, '[]')
  ON CONFLICT DO NOTHING
  RETURNING id INTO rid;
  IF rid IS NOT NULL THEN
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT rid, id FROM permissions WHERE action != 'approve' OR resource NOT IN ('invoice', 'payable', 'receivable', 'treasury', 'gl')
    ON CONFLICT DO NOTHING;
  END IF;

  -------------------------------------------------------------------
  -- QATAR (QAT) ROLES
  -------------------------------------------------------------------

  INSERT INTO roles (id, tenant_id, name, description, is_system, country, region, permissions)
  VALUES (gen_random_uuid(), tid, 'Operations Manager - Qatar', 'Manages all operational activities for Qatar region', false, 'QAT', 'Middle East', '[]')
  RETURNING id INTO rid;
  IF ops_perm_ids IS NOT NULL THEN
    INSERT INTO role_permissions (role_id, permission_id) SELECT rid, unnest(ops_perm_ids) ON CONFLICT DO NOTHING;
  END IF;

  INSERT INTO roles (id, tenant_id, name, description, is_system, country, region, permissions)
  VALUES (gen_random_uuid(), tid, 'Finance Manager - Qatar', 'Manages financial operations for Qatar', false, 'QAT', 'Middle East', '[]')
  RETURNING id INTO rid;
  IF fin_perm_ids IS NOT NULL THEN
    INSERT INTO role_permissions (role_id, permission_id) SELECT rid, unnest(fin_perm_ids) ON CONFLICT DO NOTHING;
  END IF;

  INSERT INTO roles (id, tenant_id, name, description, is_system, country, region, permissions)
  VALUES (gen_random_uuid(), tid, 'Commercial Manager - Qatar', 'Manages sales, pricing, and contracts for Qatar', false, 'QAT', 'Middle East', '[]')
  RETURNING id INTO rid;
  IF com_perm_ids IS NOT NULL THEN
    INSERT INTO role_permissions (role_id, permission_id) SELECT rid, unnest(com_perm_ids) ON CONFLICT DO NOTHING;
  END IF;

  INSERT INTO roles (id, tenant_id, name, description, is_system, country, region, permissions)
  VALUES (gen_random_uuid(), tid, 'Customs Officer - Qatar', 'Handles customs and compliance for Qatar', false, 'QAT', 'Middle East', '[]')
  RETURNING id INTO rid;
  IF cust_perm_ids IS NOT NULL THEN
    INSERT INTO role_permissions (role_id, permission_id) SELECT rid, unnest(cust_perm_ids) ON CONFLICT DO NOTHING;
  END IF;

  -------------------------------------------------------------------
  -- UAE (ARE) ROLES
  -------------------------------------------------------------------

  INSERT INTO roles (id, tenant_id, name, description, is_system, country, region, permissions)
  VALUES (gen_random_uuid(), tid, 'Operations Manager - UAE', 'Manages all operational activities for UAE region', false, 'ARE', 'Middle East', '[]')
  RETURNING id INTO rid;
  IF ops_perm_ids IS NOT NULL THEN
    INSERT INTO role_permissions (role_id, permission_id) SELECT rid, unnest(ops_perm_ids) ON CONFLICT DO NOTHING;
  END IF;

  INSERT INTO roles (id, tenant_id, name, description, is_system, country, region, permissions)
  VALUES (gen_random_uuid(), tid, 'Finance Manager - UAE', 'Manages financial operations for UAE', false, 'ARE', 'Middle East', '[]')
  RETURNING id INTO rid;
  IF fin_perm_ids IS NOT NULL THEN
    INSERT INTO role_permissions (role_id, permission_id) SELECT rid, unnest(fin_perm_ids) ON CONFLICT DO NOTHING;
  END IF;

  INSERT INTO roles (id, tenant_id, name, description, is_system, country, region, permissions)
  VALUES (gen_random_uuid(), tid, 'Commercial Manager - UAE', 'Manages sales, pricing, and contracts for UAE', false, 'ARE', 'Middle East', '[]')
  RETURNING id INTO rid;
  IF com_perm_ids IS NOT NULL THEN
    INSERT INTO role_permissions (role_id, permission_id) SELECT rid, unnest(com_perm_ids) ON CONFLICT DO NOTHING;
  END IF;

  INSERT INTO roles (id, tenant_id, name, description, is_system, country, region, permissions)
  VALUES (gen_random_uuid(), tid, 'Customs Officer - UAE', 'Handles customs and compliance for UAE', false, 'ARE', 'Middle East', '[]')
  RETURNING id INTO rid;
  IF cust_perm_ids IS NOT NULL THEN
    INSERT INTO role_permissions (role_id, permission_id) SELECT rid, unnest(cust_perm_ids) ON CONFLICT DO NOTHING;
  END IF;

  -------------------------------------------------------------------
  -- INDIA (IND) ROLES
  -------------------------------------------------------------------

  INSERT INTO roles (id, tenant_id, name, description, is_system, country, region, permissions)
  VALUES (gen_random_uuid(), tid, 'Operations Manager - India', 'Manages all operational activities for India region', false, 'IND', 'South Asia', '[]')
  RETURNING id INTO rid;
  IF ops_perm_ids IS NOT NULL THEN
    INSERT INTO role_permissions (role_id, permission_id) SELECT rid, unnest(ops_perm_ids) ON CONFLICT DO NOTHING;
  END IF;

  INSERT INTO roles (id, tenant_id, name, description, is_system, country, region, permissions)
  VALUES (gen_random_uuid(), tid, 'Finance Manager - India', 'Manages financial operations for India', false, 'IND', 'South Asia', '[]')
  RETURNING id INTO rid;
  IF fin_perm_ids IS NOT NULL THEN
    INSERT INTO role_permissions (role_id, permission_id) SELECT rid, unnest(fin_perm_ids) ON CONFLICT DO NOTHING;
  END IF;

  INSERT INTO roles (id, tenant_id, name, description, is_system, country, region, permissions)
  VALUES (gen_random_uuid(), tid, 'Documentation Officer - India', 'Manages operations documentation and customs for India', false, 'IND', 'South Asia', '[]')
  RETURNING id INTO rid;
  IF doc_perm_ids IS NOT NULL THEN
    INSERT INTO role_permissions (role_id, permission_id) SELECT rid, unnest(doc_perm_ids) ON CONFLICT DO NOTHING;
  END IF;

  -------------------------------------------------------------------
  -- SINGAPORE (SGP) ROLES
  -------------------------------------------------------------------

  INSERT INTO roles (id, tenant_id, name, description, is_system, country, region, permissions)
  VALUES (gen_random_uuid(), tid, 'Hub Operations Manager - Singapore', 'Manages transshipment hub operations for Singapore', false, 'SGP', 'Southeast Asia', '[]')
  RETURNING id INTO rid;
  IF hub_perm_ids IS NOT NULL THEN
    INSERT INTO role_permissions (role_id, permission_id) SELECT rid, unnest(hub_perm_ids) ON CONFLICT DO NOTHING;
  END IF;

  INSERT INTO roles (id, tenant_id, name, description, is_system, country, region, permissions)
  VALUES (gen_random_uuid(), tid, 'Finance Manager - Singapore', 'Manages financial operations for Singapore', false, 'SGP', 'Southeast Asia', '[]')
  RETURNING id INTO rid;
  IF fin_perm_ids IS NOT NULL THEN
    INSERT INTO role_permissions (role_id, permission_id) SELECT rid, unnest(fin_perm_ids) ON CONFLICT DO NOTHING;
  END IF;

  -------------------------------------------------------------------
  -- UK (GBR) ROLES
  -------------------------------------------------------------------

  INSERT INTO roles (id, tenant_id, name, description, is_system, country, region, permissions)
  VALUES (gen_random_uuid(), tid, 'Trade Manager - UK', 'Manages liner trade, analytics, and commercial for UK', false, 'GBR', 'Europe', '[]')
  RETURNING id INTO rid;
  IF trade_perm_ids IS NOT NULL THEN
    INSERT INTO role_permissions (role_id, permission_id) SELECT rid, unnest(trade_perm_ids) ON CONFLICT DO NOTHING;
  END IF;

  RAISE NOTICE 'Seeded country-specific roles successfully';
END $$;

-- Report counts
SELECT 'Total permissions: ' || COUNT(*) FROM permissions;
SELECT 'Total resources: ' || COUNT(DISTINCT resource) FROM permissions;
SELECT 'Total roles: ' || COUNT(*) FROM roles;
SELECT 'Total role_permissions: ' || COUNT(*) FROM role_permissions;
