-- Migration: add arrival_time to event_staff and max_role to profiles
BEGIN;

-- Add max_role to profiles (nullable)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS max_role staff_role NULL;

-- Add arrival_time to event_staff
ALTER TABLE public.event_staff
  ADD COLUMN IF NOT EXISTS arrival_time TIME NULL;

-- Update view event_staff_details to include arrival_time and guard cost calculations
CREATE OR REPLACE VIEW event_staff_details AS
SELECT 
  es.id,
  es.event_id,
  e.title as event_title,
  e.event_date,
  es.profile_id,
  COALESCE(p.full_name, es.person_name, 'Não atribuído') as staff_name,
  p.email as staff_email,
  p.phone as staff_phone,
  es.staff_role,
  es.confirmed,
  es.hourly_rate,
  es.arrival_time,
  es.hours_planned,
  es.hours_worked,
  es.assigned_at,
  es.confirmed_at,
  COALESCE(es.hourly_rate,0) * COALESCE(es.hours_planned,0) as planned_cost,
  COALESCE(es.hourly_rate,0) * COALESCE(es.hours_worked, es.hours_planned,0) as actual_cost,
  assigner.full_name as assigned_by_name
FROM event_staff es
JOIN events e ON e.id = es.event_id
LEFT JOIN profiles p ON p.id = es.profile_id
LEFT JOIN profiles assigner ON assigner.id = es.assigned_by;

COMMIT;

-- Enforce profile.max_role capability: create helper and trigger
BEGIN;

-- Helper to map staff_role to integer rank (lower = higher capability)
CREATE OR REPLACE FUNCTION get_staff_role_rank(r staff_role)
RETURNS INTEGER AS $$
BEGIN
  RETURN CASE r
    WHEN 'cerimonialista' THEN 0
    WHEN 'coordenador' THEN 1
    WHEN 'planner' THEN 2
    WHEN 'assistente' THEN 3
    WHEN 'recepcionista' THEN 4
    WHEN 'monitora' THEN 5
    WHEN 'produtor_camarim' THEN 6
    WHEN 'mestre_cerimonia' THEN 7
    WHEN 'seguranca' THEN 8
    ELSE 999
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger function that validates profiles.max_role covers the requested staff_role
CREATE OR REPLACE FUNCTION validate_event_staff_max_role()
RETURNS TRIGGER AS $$
DECLARE
  prof_max staff_role;
  prof_max_rank INTEGER;
  new_rank INTEGER;
BEGIN
  -- If no profile assigned, nothing to validate
  IF NEW.profile_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT max_role INTO prof_max FROM public.profiles WHERE id = NEW.profile_id;
  IF prof_max IS NULL THEN
    -- No max_role set, allow
    RETURN NEW;
  END IF;

  prof_max_rank := get_staff_role_rank(prof_max);
  new_rank := get_staff_role_rank(NEW.staff_role);

  -- Allow if profile's max_role rank is <= requested role rank
  IF prof_max_rank <= new_rank THEN
    RETURN NEW;
  ELSE
    RAISE EXCEPTION 'Profile % max_role (%) insufficient for requested role %', NEW.profile_id, prof_max, NEW.staff_role;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to event_staff
DROP TRIGGER IF EXISTS trg_validate_event_staff_max_role ON public.event_staff;
CREATE TRIGGER trg_validate_event_staff_max_role
BEFORE INSERT OR UPDATE ON public.event_staff
FOR EACH ROW EXECUTE FUNCTION validate_event_staff_max_role();

COMMIT;
