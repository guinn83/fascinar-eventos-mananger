Migration: staff availability → event-scoped overrides

What changed
- Database schema now supports per-event staff availability via `staff_availability` (rows with `event_id`) and `staff_event_availability` (legacy/per-event table retained).
- `staff_availability` rows with `event_id IS NULL` are default availability.
- Backend SQL updated: `sql/complete_database_setup_v2.sql` contains updated functions (`get_available_staff_for_date`, `get_available_staff_for_date_v2`), RLS policies and helper SECURITY DEFINER functions to avoid recursive policy evaluation.
- Frontend hooks updated to prefer `staff_availability.event_id` + `is_available` and to fall back to legacy `status` where present.

How to test (Supabase SQL Editor)
1. Apply the full setup (if not already):
   - Run `sql/complete_database_setup_v2.sql` in Supabase SQL Editor (the script is idempotent).
2. Run the smoke-test in `sql/check_profiles_policy.sql` (it prints helpful queries). The test is read-only; examine its output.

Frontend notes
- `src/hooks/useEventAvailability.ts` and `src/hooks/useStaff.ts` were updated to use `event_id` and `is_available`.
- A build was tested locally after pinning `lucide-react` to `^0.538.0` to avoid an upstream packaging issue; you can revert if you prefer to pick a different version.

Next steps
- (Recommended) Create a PR from branch `preview/test` with these changes and run the app in staging.
- Update any external integrations that depended on `available_date` (we kept it in types for compatibility).

If you want, I can:
- Create the PR for you (if you share preferred branch/remote naming), or
- Make the test `20250825_test_staff_event_availability.sql` fully standalone to replace DB functions when run.

Questions: which next step should I take? (create-PR / make-test-standalone / update-more-frontend)
