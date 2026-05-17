-- ============================================================
-- Futsal Hisab - Supabase Schema
-- Run this in your Supabase SQL editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES (linked to auth.users)
-- ============================================================
create table if not exists public.profiles (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references auth.users(id) on delete cascade unique not null,
  full_name   text not null,
  phone       text,
  email       text not null,
  role        text not null default 'player' check (role in ('admin', 'player')),
  status      text not null default 'active' check (status in ('active', 'inactive')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ============================================================
-- PLAYERS
-- ============================================================
create table if not exists public.players (
  id           uuid primary key default uuid_generate_v4(),
  full_name    text not null,
  phone        text,
  email        text,
  monthly_fee  integer not null default 1000,
  status       text not null default 'active' check (status in ('active', 'inactive')),
  joined_date  date not null default current_date,
  notes        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ============================================================
-- PAYMENTS
-- ============================================================
create table if not exists public.payments (
  id               uuid primary key default uuid_generate_v4(),
  player_id        uuid references public.players(id) on delete restrict not null,
  month            integer not null check (month between 1 and 12),
  year             integer not null check (year >= 2020),
  amount_due       integer not null default 1000,
  paid_amount      integer not null default 0,
  remaining_amount integer not null generated always as (greatest(0, amount_due - paid_amount)) stored,
  status           text not null default 'unpaid' check (status in ('paid', 'unpaid', 'partial', 'overpaid')),
  payment_method   text check (payment_method in ('cash', 'esewa', 'khalti', 'bank_transfer', 'other')),
  paid_date        date,
  notes            text,
  created_by       uuid references auth.users(id),
  updated_by       uuid references auth.users(id),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (player_id, month, year)
);

-- ============================================================
-- PAYMENT LOGS
-- ============================================================
create table if not exists public.payment_logs (
  id           uuid primary key default uuid_generate_v4(),
  payment_id   uuid references public.payments(id) on delete cascade not null,
  action_type  text not null,
  old_amount   integer,
  new_amount   integer,
  old_status   text,
  new_status   text,
  changed_by   uuid references auth.users(id),
  changed_at   timestamptz not null default now(),
  notes        text
);

-- ============================================================
-- EXPENSES
-- ============================================================
create table if not exists public.expenses (
  id           uuid primary key default uuid_generate_v4(),
  title        text not null,
  category     text not null check (category in (
    'ground_booking','jersey_kit','tournament_fee',
    'water_drinks','referee_fee','medical','miscellaneous'
  )),
  amount       integer not null,
  expense_date date not null default current_date,
  paid_by      text,
  notes        text,
  receipt_url  text,
  created_by   uuid references auth.users(id),
  updated_by   uuid references auth.users(id),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ============================================================
-- ANNOUNCEMENTS
-- ============================================================
create table if not exists public.announcements (
  id          uuid primary key default uuid_generate_v4(),
  title       text not null,
  message     text not null,
  created_by  uuid references auth.users(id),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ============================================================
-- TRANSACTIONS (audit log)
-- ============================================================
create table if not exists public.transactions (
  id            uuid primary key default uuid_generate_v4(),
  type          text not null check (type in ('income', 'expense')),
  reference_id  uuid,
  description   text not null,
  amount        integer not null,
  created_by    uuid references auth.users(id),
  created_at    timestamptz not null default now()
);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger on_profiles_updated before update on public.profiles
  for each row execute function public.handle_updated_at();
create trigger on_players_updated before update on public.players
  for each row execute function public.handle_updated_at();
create trigger on_payments_updated before update on public.payments
  for each row execute function public.handle_updated_at();
create trigger on_expenses_updated before update on public.expenses
  for each row execute function public.handle_updated_at();
create trigger on_announcements_updated before update on public.announcements
  for each row execute function public.handle_updated_at();

-- ============================================================
-- PAYMENT STATUS AUTO-UPDATE TRIGGER
-- ============================================================
create or replace function public.update_payment_status()
returns trigger language plpgsql as $$
begin
  if new.paid_amount = 0 then
    new.status = 'unpaid';
  elsif new.paid_amount < new.amount_due then
    new.status = 'partial';
  elsif new.paid_amount = new.amount_due then
    new.status = 'paid';
  else
    new.status = 'overpaid';
  end if;
  return new;
end;
$$;

create trigger before_payment_upsert before insert or update on public.payments
  for each row execute function public.update_payment_status();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.profiles enable row level security;
alter table public.players enable row level security;
alter table public.payments enable row level security;
alter table public.payment_logs enable row level security;
alter table public.expenses enable row level security;
alter table public.announcements enable row level security;
alter table public.transactions enable row level security;

-- Helper: is current user admin?
create or replace function public.is_admin()
returns boolean language sql security definer as $$
  select exists (
    select 1 from public.profiles
    where user_id = auth.uid() and role = 'admin'
  );
$$;

-- PROFILES policies
create policy "Users can view own profile" on public.profiles
  for select using (user_id = auth.uid());
create policy "Admin can view all profiles" on public.profiles
  for select using (public.is_admin());
create policy "Users can update own profile" on public.profiles
  for update using (user_id = auth.uid());
create policy "Admin can manage all profiles" on public.profiles
  for all using (public.is_admin());

-- PLAYERS policies
create policy "Admin can manage players" on public.players
  for all using (public.is_admin());
create policy "Players can view active players" on public.players
  for select using (auth.uid() is not null and status = 'active');

-- PAYMENTS policies
create policy "Admin can manage payments" on public.payments
  for all using (public.is_admin());
create policy "Players can view own payments" on public.payments
  for select using (
    exists (
      select 1 from public.profiles p
      join public.players pl on pl.email = p.email
      where p.user_id = auth.uid() and pl.id = player_id
    )
  );

-- PAYMENT LOGS policies
create policy "Admin can view payment logs" on public.payment_logs
  for select using (public.is_admin());
create policy "Admin can insert payment logs" on public.payment_logs
  for insert with check (public.is_admin());

-- EXPENSES policies
create policy "Admin can manage expenses" on public.expenses
  for all using (public.is_admin());
create policy "Players can view expenses" on public.expenses
  for select using (auth.uid() is not null);

-- ANNOUNCEMENTS policies
create policy "Admin can manage announcements" on public.announcements
  for all using (public.is_admin());
create policy "Anyone logged in can view announcements" on public.announcements
  for select using (auth.uid() is not null);

-- TRANSACTIONS policies
create policy "Admin can manage transactions" on public.transactions
  for all using (public.is_admin());
create policy "Players can view transactions" on public.transactions
  for select using (auth.uid() is not null);

-- ============================================================
-- NEW USER PROFILE TRIGGER
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (user_id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'player')
  );
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();
