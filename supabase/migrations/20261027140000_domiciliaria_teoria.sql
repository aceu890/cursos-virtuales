-- Teoría de Electricidad domiciliaria. El texto vive en el código
-- (DOMICILIARIA_ARTICLES); aquí quedan catálogo, orden y slugs.

update public.courses
set
  description = 'Curso de pago. Primero la teoría: tensión, corriente, resistencia, potencia y la red alterna. Después, en el tablero, la acometida, las protecciones, la luz, el enchufe, la medición y los fallos de una vivienda. En esta práctica puedes recorrerlo entero.',
  estimated_minutes = 240
where id = 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b11';

update public.modules set sort_order = 2 where id = 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b21';
update public.modules set sort_order = 3 where id = 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22';
update public.modules set sort_order = 4 where id = 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b23';
update public.modules set sort_order = 5 where id = 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b24';

update public.modules
set
  description = 'Fase, neutro y tierra, y el orden en que la energía entra a la casa.'
where id = 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b21';

update public.modules
set
  description = 'Serie y paralelo en la casa, el punto de luz y el enchufe.'
where id = 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22';

update public.modules
set
  description = 'Cómo se mide, y después la tensión del enchufe y la corriente de la fase.'
where id = 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b23';

update public.modules
set
  description = 'Qué hace cada protección, y después los fallos y el tablero completo.'
where id = 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b24';

insert into public.modules (id, course_id, title, description, sort_order) values (
  'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b25',
  'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b11',
  'Las magnitudes',
  'Tensión, corriente, resistencia, potencia y la red alterna de la vivienda.',
  1
) on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  sort_order = excluded.sort_order;

insert into public.lessons (
  id, module_id, slug, title, description, lesson_type, content, sort_order, published
) values
  (
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b44',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b25',
    'que-es-la-tension',
    'Qué es la tensión',
    'El voltaje es una diferencia entre dos puntos. En casa, 220 V entre fase y neutro.',
    'article',
    '{"article":true}'::jsonb,
    1,
    true
  ),
  (
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b45',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b25',
    'que-es-la-corriente',
    'Qué es la corriente',
    'El ampere mide cuánta carga pasa por el circuito. Sin camino cerrado, no hay corriente.',
    'article',
    '{"article":true}'::jsonb,
    2,
    true
  ),
  (
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b46',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b25',
    'resistencia-y-ohm',
    'Resistencia y la ley de Ohm',
    'V = I × R. La red pone la tensión; la carga pone la resistencia; de ahí sale la corriente.',
    'article',
    '{"article":true}'::jsonb,
    3,
    true
  ),
  (
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b47',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b25',
    'potencia-y-energia',
    'Potencia y energía',
    'Los watts son el ritmo. Los kilowatts-hora son lo que cuenta el medidor de la compañía.',
    'article',
    '{"article":true}'::jsonb,
    4,
    true
  ),
  (
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b48',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b25',
    'la-corriente-alterna',
    'La corriente alterna',
    'La red no es una pila: 220 V eficaces y 50 ciclos por segundo, entre fase y neutro.',
    'article',
    '{"article":true}'::jsonb,
    5,
    true
  ),
  (
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b49',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b21',
    'fase-neutro-y-tierra',
    'Fase, neutro y tierra',
    'Tres conductores, tres oficios. Solo dos llevan la corriente de las cargas.',
    'article',
    '{"article":true}'::jsonb,
    1,
    true
  ),
  (
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b4a',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b21',
    'seguridad-en-la-vivienda',
    'Seguridad en la vivienda',
    '220 V alcanzan para ser graves. En la casa real se corta y se comprueba; aquí se practica el orden.',
    'article',
    '{"article":true}'::jsonb,
    2,
    true
  ),
  (
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b4b',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22',
    'serie-y-paralelo-en-casa',
    'Serie y paralelo en la casa',
    'Las protecciones van en serie. La luz y el enchufe del mismo circuito van en paralelo.',
    'article',
    '{"article":true}'::jsonb,
    1,
    true
  ),
  (
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b4c',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b23',
    'como-se-mide',
    'Cómo se mide',
    'El voltímetro va en paralelo. El amperímetro va en serie. Cambiarlos de lugar es un corto.',
    'article',
    '{"article":true}'::jsonb,
    1,
    true
  ),
  (
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b4d',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b24',
    'las-protecciones',
    'Las protecciones',
    'El general aísla, el diferencial vigila fugas y el automático cuida el cable.',
    'article',
    '{"article":true}'::jsonb,
    1,
    true
  )
on conflict (id) do update set
  module_id = excluded.module_id,
  slug = excluded.slug,
  title = excluded.title,
  description = excluded.description,
  lesson_type = excluded.lesson_type,
  content = excluded.content,
  sort_order = excluded.sort_order,
  published = excluded.published;

update public.lessons set sort_order = 3 where id = 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b31';
update public.lessons set sort_order = 4 where id = 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b32';
update public.lessons set sort_order = 5 where id = 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b33';
update public.lessons set sort_order = 6 where id = 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b34';
update public.lessons set sort_order = 2 where id = 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b35';
update public.lessons set sort_order = 3 where id = 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b36';
update public.lessons set sort_order = 4 where id = 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b37';
update public.lessons set sort_order = 2 where id = 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b38';
update public.lessons set sort_order = 3 where id = 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b39';
update public.lessons set sort_order = 2 where id = 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b40';
update public.lessons set sort_order = 3 where id = 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b41';
update public.lessons set sort_order = 4 where id = 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b42';
update public.lessons set sort_order = 5 where id = 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b43';
