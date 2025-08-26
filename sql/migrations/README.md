2025-08-25 - Add staff_event_availability migration

Files:
- 20250825_add_staff_event_availability.sql : creates table staff_event_availability, indexes, trigger and RLS policies.

Instructions:
1) Review the SQL file and confirm your DB has the helper function update_updated_at_column() (it exists in complete_database_setup_v2.sql).
2) Apply the migration with psql or your migration tool. Example with psql (Windows PowerShell):

```powershell
PS> psql "postgres://user:password@host:5432/dbname" -f "sql/migrations/20250825_add_staff_event_availability.sql"
```

3) Optional: After applying, consider updating application code to call get_available_staff_for_date_v2 when checking availability for a specific event.

Notes:
- The migration is safe to run multiple times thanks to IF NOT EXISTS / IF NOT EXISTS indexes and CREATE POLICY IF NOT EXISTS.
- If you use a different schema than public, adjust the file accordingly.
