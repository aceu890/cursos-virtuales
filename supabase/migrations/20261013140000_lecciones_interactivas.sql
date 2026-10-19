update public.lessons
set
  lesson_type = 'interactive',
  description = 'Enciende y apaga el interruptor en un circuito ya armado y observa la ampolleta.',
  content = '{
    "simulation": "circuit",
    "objetivo": "Enciende el interruptor y observa que la ampolleta se ilumina"
  }'::jsonb
where id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a32';

update public.lessons
set
  lesson_type = 'interactive',
  description = 'Quita el atajo entre + y − y arma el camino que pasa por la ampolleta. Sin el enchufe de la casa.',
  content = '{
    "simulation": "circuit",
    "objetivo": "Quita el corto y haz que la ampolleta se encienda"
  }'::jsonb
where id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33';
