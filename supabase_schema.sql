-- 🚨 METHODE RADICALE : Nettoyage complet
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

-- IMPORTANT: Donner les droits aux rôles Supabase
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres, anon, authenticated, service_role;

-- 💡 EXPLICATION UTILISATEURS
-- Supabase gère les comptes (Email/Mots de passe) dans une table cachée appelée 'auth.users'.
-- Nous créons ici une table 'profiles' dans le schéma public pour stocker les infos supplémentaires
-- (Nom, Avatar, Abonnement) liée à 'auth.users' par l'ID.

-- 1. Table: profiles (Extension publique de auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text, -- Copie de l'email pour facilité d'accès
  full_name text,
  avatar_url text,
  subscription_tier text default 'free' check (subscription_tier in ('free', 'pro', 'enterprise')),
  subscription_status text default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);
alter table public.profiles enable row level security;
grant all on table public.profiles to anon, authenticated, service_role;

create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- 2. Table: clients
create table public.clients (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users not null default auth.uid(),
  name text not null,
  email text,
  notes text,
  logo_url text,
  web_summary text,
  
  constraint name_length check (char_length(name) >= 1)
);
alter table public.clients enable row level security;
grant all on table public.clients to anon, authenticated, service_role;

-- 3. Table: payments
create table public.payments (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users not null default auth.uid(),
  client_id uuid references public.clients(id) on delete cascade not null,
  amount numeric not null check (amount >= 0),
  status text not null check (status in ('PAID', 'PENDING', 'OVERDUE')),
  description text,
  date timestamp with time zone default timezone('utc'::text, now()),
  due_date timestamp with time zone,
  video_url text
);
alter table public.payments enable row level security;
grant all on table public.payments to anon, authenticated, service_role;

-- INDEXES & PERFORMANCE
create index payments_user_id_idx on public.payments(user_id);
create index payments_client_id_idx on public.payments(client_id);
create index payments_status_idx on public.payments(status);
create index clients_user_id_idx on public.clients(user_id);

-- AUTOMATION (Triggers)

-- A. Synchro automatique auth.users -> public.profiles
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger déclenché à chaque création de compte dans auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- B. Updated_at auto
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_profiles_updated
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

-- POLICIES (Sécurité RLS)

-- Clients
create policy "Clients: Lecture pour propriétaire" on clients for select using (auth.uid() = user_id);
create policy "Clients: Création pour propriétaire" on clients for insert with check (auth.uid() = user_id);
create policy "Clients: Modif pour propriétaire" on clients for update using (auth.uid() = user_id);
create policy "Clients: Suppression pour propriétaire" on clients for delete using (auth.uid() = user_id);

-- Payments
create policy "Payments: Lecture pour propriétaire" on payments for select using (auth.uid() = user_id);
create policy "Payments: Création pour propriétaire" on payments for insert with check (auth.uid() = user_id);
create policy "Payments: Modif pour propriétaire" on payments for update using (auth.uid() = user_id);
create policy "Payments: Suppression pour propriétaire" on payments for delete using (auth.uid() = user_id);

