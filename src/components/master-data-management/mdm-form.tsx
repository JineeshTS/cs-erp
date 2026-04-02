/**
 * MdmForm is now a re-export of AdminForm to eliminate code duplication.
 * Both components had identical logic — only minor CSS differences.
 */
export { AdminForm as MdmForm, type FieldConfig } from "@/components/admin-portal/admin-form";
