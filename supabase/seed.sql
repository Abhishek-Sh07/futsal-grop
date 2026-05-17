-- ============================================================
-- Futsal Hisab - Seed Data
-- Run AFTER schema.sql
-- NOTE: First create admin user via Supabase Auth Dashboard or API,
--       then update the profile role to 'admin' manually.
-- ============================================================

-- 20 demo players with Nepali names
insert into public.players (full_name, phone, email, monthly_fee, status, joined_date) values
('Ram Bahadur Thapa',     '9841123456', 'ram.thapa@gmail.com',    1000, 'active', '2024-01-15'),
('Shyam Prasad Sharma',   '9841234567', 'shyam.sharma@gmail.com', 1000, 'active', '2024-01-15'),
('Hari Bhandari',         '9842345678', 'hari.b@gmail.com',       1000, 'active', '2024-02-01'),
('Suman Khadka',          '9843456789', 'suman.k@gmail.com',      1000, 'active', '2024-02-01'),
('Dipak Magar',           '9844567890', 'dipak.m@gmail.com',      1000, 'active', '2024-03-01'),
('Roshan Gurung',         '9845678901', 'roshan.g@gmail.com',     1000, 'active', '2024-03-01'),
('Anil Tamang',           '9846789012', 'anil.t@gmail.com',       1000, 'active', '2024-04-01'),
('Bikram Rai',            '9847890123', 'bikram.r@gmail.com',     1000, 'active', '2024-04-01'),
('Nabin Karki',           '9848901234', 'nabin.k@gmail.com',      1000, 'active', '2024-05-01'),
('Santosh Poudel',        '9849012345', 'santosh.p@gmail.com',    1000, 'active', '2024-05-01'),
('Manish Adhikari',       '9841098765', 'manish.a@gmail.com',     1000, 'active', '2024-06-01'),
('Pratik Shrestha',       '9842109876', 'pratik.s@gmail.com',     1000, 'active', '2024-06-01'),
('Sunil Maharjan',        '9843210987', 'sunil.m@gmail.com',      1000, 'active', '2024-07-01'),
('Rajesh Basnet',         '9844321098', 'rajesh.b@gmail.com',     1000, 'active', '2024-07-01'),
('Gaurav Oli',            '9845432109', 'gaurav.o@gmail.com',     1000, 'active', '2024-08-01'),
('Nirajan Ghimire',       '9846543210', 'nirajan.g@gmail.com',    1000, 'active', '2024-08-01'),
('Prashant Dahal',        '9847654321', 'prashant.d@gmail.com',   1000, 'active', '2024-09-01'),
('Alok Joshi',            '9848765432', 'alok.j@gmail.com',       1000, 'active', '2024-09-01'),
('Binod Tiwari',          '9849876543', 'binod.t@gmail.com',      1000, 'active', '2024-10-01'),
('Kushal Dhakal',         '9840987654', 'kushal.d@gmail.com',     1000, 'inactive','2024-10-01');

-- Payments for May 2026 (current month)
-- Use a DO block to reference inserted players by name
do $$
declare
  v_may   integer := 5;
  v_year  integer := 2026;
  p       record;
  i       integer := 0;
begin
  for p in select id, full_name from public.players where status = 'active' order by created_at loop
    i := i + 1;
    if i <= 10 then
      -- First 10: paid
      insert into public.payments (player_id, month, year, amount_due, paid_amount, payment_method, paid_date)
      values (p.id, v_may, v_year, 1000, 1000,
        case when i % 3 = 0 then 'esewa'
             when i % 3 = 1 then 'cash'
             else 'khalti' end,
        ('2026-05-' || lpad((i + 1)::text, 2, '0'))::date)
      on conflict (player_id, month, year) do nothing;
    elsif i <= 14 then
      -- Next 4: partial
      insert into public.payments (player_id, month, year, amount_due, paid_amount, payment_method, paid_date)
      values (p.id, v_may, v_year, 1000, 500, 'cash', '2026-05-10')
      on conflict (player_id, month, year) do nothing;
    else
      -- Remaining 5: unpaid
      insert into public.payments (player_id, month, year, amount_due, paid_amount)
      values (p.id, v_may, v_year, 1000, 0)
      on conflict (player_id, month, year) do nothing;
    end if;
  end loop;
end;
$$;

-- Payments for April 2026
do $$
declare
  v_month integer := 4;
  v_year  integer := 2026;
  p       record;
  i       integer := 0;
begin
  for p in select id from public.players where status = 'active' order by created_at loop
    i := i + 1;
    if i <= 16 then
      insert into public.payments (player_id, month, year, amount_due, paid_amount, payment_method, paid_date)
      values (p.id, v_month, v_year, 1000, 1000,
        case when i % 2 = 0 then 'cash' else 'esewa' end,
        '2026-04-15')
      on conflict (player_id, month, year) do nothing;
    else
      insert into public.payments (player_id, month, year, amount_due, paid_amount)
      values (p.id, v_month, v_year, 1000, 0)
      on conflict (player_id, month, year) do nothing;
    end if;
  end loop;
end;
$$;

-- Sample expenses
insert into public.expenses (title, category, amount, expense_date, paid_by, notes) values
('Futsal Ground - May 2026',    'ground_booking', 8000, '2026-05-01', 'Ram Thapa',   'Weekend bookings for May'),
('Drinking Water & Snacks',     'water_drinks',    500,  '2026-05-05', 'Santosh',     'Post-match refreshments'),
('Tournament Entry Fee',        'tournament_fee', 3000, '2026-05-10', 'Admin',       'Zone-level futsal tournament'),
('Futsal Ground - April 2026',  'ground_booking', 8000, '2026-04-01', 'Ram Thapa',   'Weekend bookings for April'),
('Referee Fee - April',         'referee_fee',    1000, '2026-04-15', 'Admin',       'Friendly match referee'),
('First Aid Kit Restock',       'medical',         800, '2026-04-20', 'Shyam',       'Bandages, spray etc.');

-- Sample announcements
insert into public.announcements (title, message) values
('May Payment Deadline',
 'Dear team, please clear your monthly fee of NPR 1,000 for May 2026 by 20th May. Pay to Ram (cash) or use eSewa: 9841123456.'),
('Next Match - 18th May',
 'Our next friendly match is on Sunday 18th May at 6 AM. Venue: Sanepa Futsal. Please be on time!'),
('Tournament Registration Open',
 'We are registering for the Zone Futsal Tournament. Fee is NPR 150/player. Confirm participation by 15th May.');
