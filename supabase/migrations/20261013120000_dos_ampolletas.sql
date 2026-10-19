update public.courses
set estimated_minutes = 60
where id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

update public.lessons
set sort_order = 2
where id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33';

insert into public.lessons (
  id, module_id, slug, title, description, lesson_type, content, sort_order, published
) values (
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
)
on conflict (id) do nothing;
