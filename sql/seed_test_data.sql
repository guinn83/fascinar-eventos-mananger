-- Seed data for local testing (Supabase/Postgres)
-- Run this in your Supabase SQL editor or psql against the project DB.

BEGIN;

-- Profiles
INSERT INTO profiles (id, full_name, email, phone, role, has_password, cpf, company_name)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Organizador Teste', 'org@test.local', '+5511999000000', 'organizer', true, NULL, NULL),
  ('22222222-2222-2222-2222-222222222222', 'Maria Silva', 'maria@test.local', '+5511999111111', 'client', false, '123.456.789-00', NULL),
  ('33333333-3333-3333-3333-333333333333', 'João Pereira', 'joao@test.local', '+5511999222222', 'client', false, '987.654.321-00', NULL),
  ('44444444-4444-4444-4444-444444444444', 'Equipe Externa', NULL, NULL, 'client', false, NULL, 'Fornecedor ABC');

-- Event
INSERT INTO events (id, title, description, event_date, end_date, location, max_attendees, price, image_url, status, client_profile_id, created_by_profile_id, staff)
VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'Casamento Demo',
  'Evento de teste para validação da UI e staff',
  '2025-09-10T18:00:00Z',
  '2025-09-10T23:00:00Z',
  'Salão Central',
  150,
  15000.00,
  NULL,
  'active',
  '44444444-4444-4444-4444-444444444444',
  '11111111-1111-1111-1111-111111111111',
  3
);

-- Default staff roles (profiles 222 and 333 will be staff candidates)
INSERT INTO default_staff_roles (id, profile_id, staff_role, experience_level, hourly_rate, notes, is_active)
VALUES
  ('55555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', 'assistente', 3, 80.00, 'Disponível para eventos noturnos', true),
  ('66666666-6666-6666-6666-666666666666', '33333333-3333-3333-3333-333333333333', 'produtor_camarim', 4, 120.00, 'Experiência com artistas', true);

-- Staff availability for event date
INSERT INTO staff_availability (id, profile_id, available_date, start_time, end_time, status, notes)
VALUES
  ('77777777-7777-7777-7777-777777777777', '22222222-2222-2222-2222-222222222222', '2025-09-10', '16:00', '23:59', 'available', 'OK para o evento'),
  ('88888888-8888-8888-8888-888888888888', '33333333-3333-3333-3333-333333333333', '2025-09-10', '16:00', '23:59', 'available', 'Sem restrições');

-- Assign one staff to the event (confirmed)
INSERT INTO event_staff (id, event_id, profile_id, staff_role, confirmed, hourly_rate, hours_planned, notes, assigned_by)
VALUES
  ('99999999-9999-9999-9999-999999999999', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', 'produtor_camarim', true, 120.00, 6.0, 'Contratado para apoiar camarim', '11111111-1111-1111-1111-111111111111');

COMMIT;

-- End of seed file
