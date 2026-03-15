-- Migration 0070: Make admin_audit_logs immutable
-- Prevents UPDATE and DELETE on audit log records for compliance

CREATE OR REPLACE FUNCTION prevent_audit_log_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Audit logs are immutable — UPDATE and DELETE operations are not allowed on admin_audit_logs';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_logs_immutable_update
  BEFORE UPDATE ON admin_audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION prevent_audit_log_modification();

CREATE TRIGGER audit_logs_immutable_delete
  BEFORE DELETE ON admin_audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION prevent_audit_log_modification();
