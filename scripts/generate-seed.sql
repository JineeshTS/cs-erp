-- Auto-generate seed data for all empty tables in cs_erp
-- This script creates a PL/pgSQL function that generates INSERT statements

CREATE OR REPLACE FUNCTION generate_seed_data() RETURNS void AS $$
DECLARE
  tbl RECORD;
  col RECORD;
  cols TEXT;
  vals TEXT;
  i INTEGER;
  num_rows INTEGER;
  tenant_id_val TEXT := '7f709f8d-ca75-4626-85ae-5501ddeea85e';
  user_id_val TEXT;
  row_count BIGINT;
  col_list TEXT[];
  val_template TEXT;
BEGIN
  -- Get a user ID for FK references
  SELECT id::text INTO user_id_val FROM users LIMIT 1;
  IF user_id_val IS NULL THEN
    user_id_val := gen_random_uuid()::text;
  END IF;

  -- Loop through all tables with 0 rows
  FOR tbl IN
    SELECT t.table_name
    FROM information_schema.tables t
    WHERE t.table_schema = 'public'
      AND t.table_type = 'BASE TABLE'
      AND t.table_name NOT IN (
        'auth_audit_log','cs_erp_build_progress','permissions','role_permissions',
        'role_assignments','roles','sessions','tenants','users',
        -- Tables with data already
        'aaf_agents','bfm_bunker_orders','cap_port_rotations','cap_vessel_schedules',
        'cvm_charter_parties','cvm_voyage_estimates','eqy_container_fleet',
        'firm_freight_invoices','odm_bills_of_lading','scm_customers','scm_leads','scm_contracts'
      )
    ORDER BY t.table_name
  LOOP
    -- Check actual row count
    EXECUTE format('SELECT count(*) FROM %I', tbl.table_name) INTO row_count;
    IF row_count > 0 THEN
      CONTINUE;
    END IF;

    -- Build column list and value templates
    cols := '';

    FOR i IN 1..8 LOOP
      vals := '';
      FOR col IN
        SELECT c.column_name, c.data_type, c.column_default, c.is_nullable, c.character_maximum_length,
               c.udt_name
        FROM information_schema.columns c
        WHERE c.table_schema = 'public' AND c.table_name = tbl.table_name
        ORDER BY c.ordinal_position
      LOOP
        -- Skip columns with defaults that auto-generate (like id, created_at, updated_at)
        IF col.column_name = 'id' AND col.column_default LIKE '%random%' THEN
          CONTINUE;
        END IF;
        IF col.column_name IN ('created_at', 'updated_at') AND col.column_default IS NOT NULL THEN
          CONTINUE;
        END IF;
        IF col.column_name = 'deleted_at' THEN
          CONTINUE;
        END IF;

        -- Build column name list (only on first row)
        IF i = 1 THEN
          IF cols != '' THEN cols := cols || ', '; END IF;
          cols := cols || quote_ident(col.column_name);
        END IF;

        -- Build value
        IF vals != '' THEN vals := vals || ', '; END IF;

        -- tenant_id
        IF col.column_name = 'tenant_id' THEN
          vals := vals || quote_literal(tenant_id_val) || '::uuid';
        -- user-related FKs
        ELSIF col.column_name IN ('user_id', 'uploaded_by', 'created_by', 'assigned_to', 'assigned_by', 'approved_by', 'reviewed_by', 'signer_id', 'acknowledged_by', 'officer_id', 'inspector_id', 'surveyor_id', 'master_id', 'operator_id', 'handler_id', 'reporter_id', 'investigator_id', 'auditor_id', 'assessor_id', 'trainer_id', 'captain_id', 'chief_engineer_id', 'manager_id', 'analyst_id', 'owner_id', 'driver_id', 'agent_id', 'vendor_id', 'customer_id', 'contact_id') THEN
          vals := vals || quote_literal(user_id_val) || '::uuid';
        -- Other UUID FK columns
        ELSIF col.udt_name = 'uuid' AND col.is_nullable = 'YES' THEN
          vals := vals || 'NULL';
        ELSIF col.udt_name = 'uuid' THEN
          vals := vals || 'gen_random_uuid()';
        -- Boolean
        ELSIF col.udt_name = 'bool' THEN
          IF col.column_default IS NOT NULL THEN
            vals := vals || col.column_default;
          ELSE
            vals := vals || CASE WHEN i % 2 = 0 THEN 'true' ELSE 'false' END;
          END IF;
        -- Integer
        ELSIF col.data_type = 'integer' THEN
          vals := vals || (i * 10 + (CASE WHEN col.column_name LIKE '%count%' THEN 5
                                          WHEN col.column_name LIKE '%amount%' THEN 1000
                                          WHEN col.column_name LIKE '%size%' THEN 2048
                                          WHEN col.column_name LIKE '%order%' THEN i
                                          WHEN col.column_name LIKE '%number%' THEN i
                                          WHEN col.column_name LIKE '%version%' THEN 1
                                          WHEN col.column_name LIKE '%days%' THEN 30
                                          WHEN col.column_name LIKE '%confidence%' THEN 85
                                          ELSE i END))::text;
        -- Numeric/decimal
        ELSIF col.data_type = 'numeric' THEN
          vals := vals || (1000.00 + i * 250.50)::text;
        -- Timestamp
        ELSIF col.udt_name = 'timestamptz' THEN
          IF col.is_nullable = 'YES' THEN
            vals := vals || CASE WHEN i <= 5 THEN 'NOW() - interval ''' || (30 - i * 3) || ' days''' ELSE 'NULL' END;
          ELSE
            vals := vals || 'NOW() - interval ''' || (30 - i * 3) || ' days''';
          END IF;
        -- Date
        ELSIF col.data_type = 'date' THEN
          vals := vals || '(CURRENT_DATE - interval ''' || (30 - i * 3) || ' days'')::date';
        -- JSON/JSONB
        ELSIF col.udt_name = 'jsonb' OR col.udt_name = 'json' THEN
          IF col.column_name LIKE '%tags%' THEN
            vals := vals || quote_literal('["shipping", "qatar"]') || '::jsonb';
          ELSIF col.column_name LIKE '%metadata%' THEN
            vals := vals || quote_literal('{"source": "seed", "version": 1}') || '::jsonb';
          ELSIF col.column_name LIKE '%config%' THEN
            vals := vals || quote_literal('{"enabled": true}') || '::jsonb';
          ELSIF col.column_name LIKE '%data%' OR col.column_name LIKE '%details%' THEN
            vals := vals || quote_literal('{"key": "value"}') || '::jsonb';
          ELSIF col.column_name LIKE '%permissions%' THEN
            vals := vals || quote_literal('[]') || '::jsonb';
          ELSE
            vals := vals || quote_literal('{}') || '::jsonb';
          END IF;
        -- inet
        ELSIF col.udt_name = 'inet' THEN
          vals := vals || quote_literal('192.168.1.' || i);
        -- text/varchar - generate realistic data based on column name patterns
        ELSIF col.data_type IN ('text', 'character varying') THEN
          IF col.column_name = 'status' THEN
            vals := vals || quote_literal(CASE i
              WHEN 1 THEN 'active' WHEN 2 THEN 'pending' WHEN 3 THEN 'completed'
              WHEN 4 THEN 'active' WHEN 5 THEN 'in_progress' WHEN 6 THEN 'active'
              WHEN 7 THEN 'draft' ELSE 'active' END);
          ELSIF col.column_name = 'priority' THEN
            vals := vals || quote_literal(CASE WHEN i <= 2 THEN 'high' WHEN i <= 5 THEN 'normal' ELSE 'low' END);
          ELSIF col.column_name = 'severity' THEN
            vals := vals || quote_literal(CASE WHEN i <= 2 THEN 'high' WHEN i <= 5 THEN 'medium' ELSE 'low' END);
          ELSIF col.column_name = 'currency' OR col.column_name = 'currency_code' THEN
            vals := vals || quote_literal('USD');
          ELSIF col.column_name LIKE '%email%' THEN
            vals := vals || quote_literal('user' || i || '@cserp.com');
          ELSIF col.column_name LIKE '%phone%' THEN
            vals := vals || quote_literal('+974-4400-' || (1000 + i)::text);
          ELSIF col.column_name LIKE '%country%' THEN
            vals := vals || quote_literal(CASE i WHEN 1 THEN 'QAT' WHEN 2 THEN 'ARE' WHEN 3 THEN 'IND' WHEN 4 THEN 'SGP' WHEN 5 THEN 'SAU' WHEN 6 THEN 'GBR' WHEN 7 THEN 'QAT' ELSE 'ARE' END);
          ELSIF col.column_name LIKE '%port%' AND col.column_name NOT LIKE '%report%' THEN
            vals := vals || quote_literal(CASE i WHEN 1 THEN 'QAHMD' WHEN 2 THEN 'AEJEA' WHEN 3 THEN 'INNSA' WHEN 4 THEN 'SGSIN' WHEN 5 THEN 'SAJED' WHEN 6 THEN 'GBFXT' WHEN 7 THEN 'CNSHA' ELSE 'QAHMD' END);
          ELSIF col.column_name LIKE '%vessel%' AND col.column_name NOT LIKE '%report%' THEN
            vals := vals || quote_literal(CASE i WHEN 1 THEN 'MV Qatar Spirit' WHEN 2 THEN 'MV Gulf Pioneer' WHEN 3 THEN 'MV Arabian Sea' WHEN 4 THEN 'MV Pearl Express' WHEN 5 THEN 'MV Desert Rose' WHEN 6 THEN 'MV India Star' WHEN 7 THEN 'MV Singapore Bridge' ELSE 'MV Qatar Spirit' END);
          ELSIF col.column_name = 'name' OR col.column_name = 'title' THEN
            vals := vals || quote_literal(replace(tbl.table_name, '_', ' ') || ' Record ' || i);
          ELSIF col.column_name LIKE '%number%' OR col.column_name LIKE '%code%' OR col.column_name LIKE '%reference%' OR col.column_name LIKE '%ref%' THEN
            vals := vals || quote_literal(upper(left(tbl.table_name, 3)) || '-2025-' || lpad(i::text, 4, '0'));
          ELSIF col.column_name = 'description' OR col.column_name LIKE '%notes%' OR col.column_name LIKE '%comment%' OR col.column_name LIKE '%reason%' THEN
            vals := vals || quote_literal('Demo ' || replace(col.column_name, '_', ' ') || ' for record ' || i);
          ELSIF col.column_name = 'type' OR col.column_name LIKE '%_type' THEN
            vals := vals || quote_literal('standard');
          ELSIF col.column_name = 'category' OR col.column_name LIKE '%_category' THEN
            vals := vals || quote_literal('general');
          ELSIF col.column_name LIKE '%unit%' THEN
            vals := vals || quote_literal(CASE WHEN col.column_name LIKE '%fuel%' THEN 'MT' WHEN col.column_name LIKE '%weight%' THEN 'KG' ELSE 'TEU' END);
          ELSIF col.column_name LIKE '%imo%' THEN
            vals := vals || quote_literal((9000000 + i * 111)::text);
          ELSIF col.column_name LIKE '%container%' AND col.data_type = 'character varying' THEN
            vals := vals || quote_literal('CSLU' || lpad((1000000 + i)::text, 7, '0'));
          ELSIF col.column_name LIKE '%address%' THEN
            vals := vals || quote_literal(i::text || ' Maritime Avenue, Doha, Qatar');
          ELSIF col.column_name = 'channel' THEN
            vals := vals || quote_literal(CASE WHEN i <= 3 THEN 'email' WHEN i <= 6 THEN 'sms' ELSE 'push' END);
          ELSIF col.column_name LIKE '%slug%' THEN
            vals := vals || quote_literal(replace(tbl.table_name, '_', '-') || '-' || i);
          ELSIF col.column_name LIKE '%url%' OR col.column_name LIKE '%path%' OR col.column_name LIKE '%link%' THEN
            vals := vals || quote_literal('/docs/' || tbl.table_name || '/' || i);
          ELSIF col.column_name LIKE '%format%' THEN
            vals := vals || quote_literal('pdf');
          ELSIF col.column_name LIKE '%mime%' THEN
            vals := vals || quote_literal('application/pdf');
          ELSIF col.column_name LIKE '%file%' AND col.column_name LIKE '%name%' THEN
            vals := vals || quote_literal('document_' || i || '.pdf');
          ELSIF col.column_name = 'region' THEN
            vals := vals || quote_literal(CASE WHEN i <= 4 THEN 'Middle East' WHEN i <= 6 THEN 'South Asia' ELSE 'Southeast Asia' END);
          ELSIF col.column_name LIKE '%level%' THEN
            vals := vals || quote_literal(CASE WHEN i <= 2 THEN 'high' WHEN i <= 5 THEN 'medium' ELSE 'low' END);
          ELSIF col.column_name LIKE '%frequency%' THEN
            vals := vals || quote_literal(CASE WHEN i <= 3 THEN 'daily' WHEN i <= 6 THEN 'weekly' ELSE 'monthly' END);
          ELSIF col.column_name LIKE '%classification%' THEN
            vals := vals || quote_literal('internal');
          ELSE
            -- Generic varchar value
            IF col.character_maximum_length IS NOT NULL AND col.character_maximum_length < 20 THEN
              vals := vals || quote_literal(left(upper(replace(tbl.table_name, '_', '')), LEAST(col.character_maximum_length - 2, 8)) || i::text);
            ELSE
              vals := vals || quote_literal(initcap(replace(col.column_name, '_', ' ')) || ' ' || i);
            END IF;
          END IF;
        -- Enum types
        ELSIF col.data_type = 'USER-DEFINED' THEN
          -- Try to get the first enum value
          BEGIN
            EXECUTE format('SELECT enumlabel FROM pg_enum WHERE enumtypid = %L::regtype ORDER BY enumsortorder LIMIT 1 OFFSET %s', col.udt_name, (i-1) % 4)
            INTO val_template;
            IF val_template IS NOT NULL THEN
              vals := vals || quote_literal(val_template);
            ELSE
              vals := vals || quote_literal('active');
            END IF;
          EXCEPTION WHEN OTHERS THEN
            vals := vals || quote_literal('active');
          END;
        ELSE
          -- Unknown type - NULL if nullable, skip otherwise
          IF col.is_nullable = 'YES' THEN
            vals := vals || 'NULL';
          ELSE
            vals := vals || quote_literal('unknown');
          END IF;
        END IF;
      END LOOP;

      -- Execute the INSERT
      IF cols != '' AND vals != '' THEN
        BEGIN
          EXECUTE format('INSERT INTO %I (%s) VALUES (%s)', tbl.table_name, cols, vals);
        EXCEPTION WHEN OTHERS THEN
          RAISE NOTICE 'Error inserting into %: % (row %)', tbl.table_name, SQLERRM, i;
        END;
      END IF;
    END LOOP;

    IF cols != '' THEN
      RAISE NOTICE 'Seeded: %', tbl.table_name;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute
SELECT generate_seed_data();

-- Cleanup
DROP FUNCTION generate_seed_data();
