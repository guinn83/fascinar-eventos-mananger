Assignment UX + Data Spec — incremental plan

Goal

Make assignment flows safer and more developer-friendly by:
- Removing hourly_rate from the UI assignment flow (keep DB until migration)
- Adding arrival_time to assignments (UI + types + API payload)
- Showing a grid/list of organizer users below the free-text name field in the assignment modal (no desassign button in the list)
- Ensuring that once a profile is assigned to a role for an event it is not available to be assigned to another role on the same event
- Restricting assignable roles per profile using a `max_role` property derived from the existing `STAFF_ROLE_HIERARCHY`

Approach

We follow an incremental, backend-safe rollout in three phases:

Phase 1 (frontend-only, quick):
- Remove `hourly_rate` from the modal UI and submission form.
- Add an `arrival_time` time input to the modal and include it in `assignPersonToRoleWithName()` calls.
- Fetch organizer profiles via existing APIs (or `useProfiles` / supabase from `profiles`), filter locally by assigned profiles for the event and by `max_role` check.
- Make UI changes in `EventStaffView.tsx` modal: replace current form with a layout that shows a grid/list of organizers and below that a free-text name input and a time input.
- Do not alter DB schema or backend endpoints in this phase.

Phase 2 (backend support, optional but recommended):
- Expose `profile.max_role` on profiles API or add a lightweight mapping table.
- Add a backend query to fetch available organizers for a given event (taking into account other event assignments and capabilities)
- Add server-side validation to `assignPersonToRole` to ensure profile can accept role.

Phase 3 (cleanup):
- After testing, remove `hourly_rate` from DB and types (migration + code cleanup)

Data shapes and contracts

1) Frontend assign call (contract)

assignPersonToRole(eventStaffId: string, options: {
  profileId?: string; // profile id if assigning a user
  personName?: string; // free text name if not using profile
  arrivalTime?: string; // HH:mm (optional)
}): Promise<boolean>

Success criteria: returns true and UI refreshes staff list.

2) Profile shape (frontend)

interface Profile {
  id: string;
  full_name: string;
  role?: string; // 'organizer' etc.
  max_role?: StaffRole; // optional, controls the highest role they can receive
  // other fields...
}

3) Assignment shape (frontend)

// EventStaff / EventStaffDetailed — add arrival_time?: string (HH:mm)

Implementation details / UI

Modal layout (assignment, simplified):
- Title: "Atribuir Pessoa à Função"
- Top: role name (readonly)
- Left / Grid: list of available organizer profiles (avatar, name, max_role label) — click to select
- Right / Bottom: free-text input: "Nome (usar quando não for perfil do app)"
- Arrival time: <input type="time" /> — optional
- Buttons: Cancelar | Atribuir

Selection rules:
- Profiles already assigned to any role in the current event are excluded from the list.
- Profiles whose `max_role` disallows the target role are excluded.

Filtering logic (frontend interim):
- assignedProfileIds = new Set(eventStaff.map(s => s.profile_id).filter(Boolean))
- availableProfiles = allOrganizers
  .filter(p => p.id && !assignedProfileIds.has(p.id))
  .filter(p => !p.max_role || getRoleRank(p.max_role) <= getRoleRank(targetRole))

APIs

- Interim: GET /profiles?role=organizer (or use existing profiles fetch hook) — client filters
- Recommended: GET /events/:id/available-organizers?role=coordenador — backend filters availability and capability
- POST /events/:eventId/assign-staff — payload includes `profile_id | person_name` and `arrival_time` and `event_staff_id` or `role_id`

Type updates (frontend)

- src/types/staff.ts
  - Add `arrival_time?: string` on `EventStaff` and `EventStaffDetailed`
  - Keep `hourly_rate` in types for now but remove from assignment modal UI

Suggested Code Deltas (draft patches you can review)

Patch 1 — remove hourly_rate from modal UI (in `src/views/EventStaffView.tsx`)
- Remove form control for "Valor por Hora"
- Remove reading `assignHourlyRate` and sending it in assign call
- Keep `hourly_rate` in types until DB migration

Patch 2 — add arrival_time type (in `src/types/staff.ts`)
- Add `arrival_time?: string` comment // "HH:mm"

Patch 3 — minimal hook helper to get organizers (frontend)
- Add `useOrganizers` helper in `src/hooks/useProfiles.ts` or extend `useStaff` with `getOrganizers()` that queries profiles table (supabase) with role = 'organizer'

Patch 4 — modal UI changes (in `src/views/EventStaffView.tsx`)
- Replace or augment existing assign modal with:
  - Grid of organizers (click item to select profile)
  - Text input for free-name below
  - Time input for arrival_time
  - Atribuir button calls assignPersonToRoleWithName(selectedEventStaffId, personName || undefined, profileId || undefined, arrivalTime)

Estimated effort

- Phase 1 (frontend-only): 2–4 hours depending on existing hooks and style polishing.
- Phase 2 (backend): 4–8 hours including server validation and endpoint additions.
- Phase 3 (cleanup): 1–2 hours for migration + types cleanup.

Testing

- Manual: Create an event, add roles, open modal, assign a profile and a free-name, verify UI updates.
- Unit: add tests for `canAssignProfileToRole` util and assign hook.

Next steps

Choose one:
- I will implement Phase 1 now (small incremental changes to the frontend). — I'll apply patches.
- I will prepare a PR-like patch set but not apply them; you review and then I apply.

I prepared a list of concrete file edits and exact code snippets if you want me to apply Phase 1 automatically.

---
Notes: This is a non-breaking, incremental plan. Backend validation is recommended before making assignments final in production.
