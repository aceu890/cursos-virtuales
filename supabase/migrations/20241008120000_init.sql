-- Practica: perfiles, catálogo y progreso.
-- Aplicar en el SQL Editor de Supabase o con `supabase db push`.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null,
  level text not null check (level in ('principiante', 'intermedio', 'avanzado')),
  estimated_minutes integer not null check (estimated_minutes > 0),
  cover_image text,
  published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  title text not null,
  description text,
  sort_order integer not null default 0
);

create index if not exists modules_course_id_sort_idx
  on public.modules (course_id, sort_order);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules (id) on delete cascade,
  slug text not null,
  title text not null,
  description text not null,
  lesson_type text not null check (lesson_type in ('interactive', 'article')),
  content jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  published boolean not null default false,
  unique (module_id, slug)
);

create index if not exists lessons_module_id_sort_idx
  on public.lessons (module_id, sort_order);

create table if not exists public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  completed_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

create index if not exists lesson_progress_user_id_idx
  on public.lesson_progress (user_id);

create index if not exists lesson_progress_lesson_id_idx
  on public.lesson_progress (lesson_id);

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.lesson_progress enable row level security;

drop policy if exists "cursos publicados visibles" on public.courses;
create policy "cursos publicados visibles"
  on public.courses for select
  using (published = true);

drop policy if exists "modulos de cursos publicados" on public.modules;
create policy "modulos de cursos publicados"
  on public.modules for select
  using (
    exists (
      select 1 from public.courses c
      where c.id = modules.course_id and c.published = true
    )
  );

drop policy if exists "lecciones publicadas visibles" on public.lessons;
create policy "lecciones publicadas visibles"
  on public.lessons for select
  using (
    published = true
    and exists (
      select 1
      from public.modules m
      join public.courses c on c.id = m.course_id
      where m.id = lessons.module_id and c.published = true
    )
  );

drop policy if exists "perfil propio leer" on public.profiles;
create policy "perfil propio leer"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "perfil propio actualizar" on public.profiles;
create policy "perfil propio actualizar"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "progreso propio leer" on public.lesson_progress;
create policy "progreso propio leer"
  on public.lesson_progress for select
  using (auth.uid() = user_id);

drop policy if exists "progreso propio insertar" on public.lesson_progress;
create policy "progreso propio insertar"
  on public.lesson_progress for insert
  with check (auth.uid() = user_id);

drop policy if exists "progreso propio actualizar" on public.lesson_progress;
create policy "progreso propio actualizar"
  on public.lesson_progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'display_name',
      split_part(new.email, '@', 1)
    )
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Seed: Fundamentos de electricidad
insert into public.courses (
  id, slug, title, description, level, estimated_minutes, published, sort_order
) values (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'fundamentos-de-electricidad',
  'Fundamentos de electricidad',
  'Aprende qué es un circuito cerrado armando uno con tus manos: batería, interruptor y ampolleta. Sin fórmulas todavía; primero la intuición.',
  'principiante',
  60,
  true,
  1
) on conflict (id) do nothing;

insert into public.modules (id, course_id, title, description, sort_order) values
  (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'El circuito eléctrico',
    'Fuente, interruptor, carga y el camino de la corriente.',
    1
  ),
  (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Corriente y seguridad',
    'De dónde sale la corriente y cómo tratarla con respeto.',
    2
  )
on conflict (id) do nothing;

insert into public.lessons (
  id, module_id, slug, title, description, lesson_type, content, sort_order, published
) values
  (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a31',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21',
    'circuito-simple',
    'Circuito simple',
    'Arma un circuito cerrado y haz que la ampolleta se encienda.',
    'interactive',
    '{
      "simulation": "circuit",
      "concepto": "Un circuito cerrado es un camino continuo por donde puede circular la corriente: sale del polo +, pasa por el interruptor y la carga, y vuelve al polo −.",
      "objetivo": "Haz que la ampolleta se encienda",
      "componentesDisponibles": [
        {"kind": "battery", "label": "Batería", "count": 1},
        {"kind": "switch", "label": "Interruptor", "count": 1},
        {"kind": "bulb", "label": "Ampolleta", "count": 1}
      ],
      "reglas": {
        "requiereCircuitoCerrado": true,
        "componentesObligatorios": ["battery", "switch", "bulb"],
        "maxConexionesPorTerminal": 1
      }
    }'::jsonb,
    1,
    true
  ),
  (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a32',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21',
    'el-interruptor',
    'El interruptor',
    'Enciende y apaga el interruptor en un circuito ya armado y observa la ampolleta.',
    'interactive',
    '{
      "simulation": "circuit",
      "objetivo": "Enciende el interruptor y observa que la ampolleta se ilumina"
    }'::jsonb,
    2,
    true
  ),
  (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a34',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'dos-ampolletas',
    'Dos ampolletas',
    'Arma un circuito en serie con dos cargas y evita el atajo entre + y −.',
    'interactive',
    '{
      "simulation": "circuit",
      "objetivo": "Haz que las dos ampolletas se enciendan"
    }'::jsonb,
    1,
    true
  ),
  (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'corriente-y-seguridad',
    'Corriente y seguridad',
    'Quita el atajo entre + y − y arma el camino que pasa por la ampolleta. Sin el enchufe de la casa.',
    'interactive',
    '{
      "simulation": "circuit",
      "objetivo": "Quita el corto y haz que la ampolleta se encienda"
    }'::jsonb,
    2,
    true
  )
on conflict (id) do nothing;
