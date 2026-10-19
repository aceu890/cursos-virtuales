-- Fundamentos de electricidad: 4 módulos × 4 lecciones (curso de enganche).
-- El contenido interactivo vive en el código (INTERACTIVE_LESSONS); aquí van
-- catálogo, slugs e IDs estables.

update public.courses
set
  description = 'Curso de enganche gratis: lo esencial en el tablero. Circuito cerrado, serie y paralelo, medición y buenas prácticas. Corto, práctico y para que pases al Laboratorio con las bases claras.',
  estimated_minutes = 90
where id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

update public.modules
set
  title = 'El circuito eléctrico',
  description = 'Fuente, interruptor, carga, el camino cerrado y la tierra.',
  sort_order = 1
where id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21';

insert into public.modules (id, course_id, title, description, sort_order) values
  (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a23',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Serie y paralelo',
    'Un camino o dos: cómo se conectan las cargas.',
    2
  ),
  (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a24',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Buenas prácticas',
    'Colores, interruptor en la fase, el tomacorriente y el paso a 220 V.',
    4
  )
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  sort_order = excluded.sort_order;

update public.modules
set
  title = 'Corriente y medición',
  description = 'Cortos, tensión y corriente: cómo se miden y cómo no.',
  sort_order = 3
where id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22';

update public.lessons
set
  module_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a23',
  sort_order = 1
where id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a34';

update public.lessons
set sort_order = 1
where id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33';

insert into public.lessons (
  id, module_id, slug, title, description, lesson_type, content, sort_order, published
) values
  (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a35',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21',
    'camino-cerrado',
    'Camino cerrado',
    'Completa el cable de retorno y cierra el círculo.',
    'interactive',
    '{"simulation":"circuit"}'::jsonb,
    3,
    true
  ),
  (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a36',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21',
    'tierra-de-proteccion',
    'Tierra de protección',
    'Une el conductor de tierra: no alimenta la luz, protege.',
    'interactive',
    '{"simulation":"circuit"}'::jsonb,
    4,
    true
  ),
  (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a37',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a23',
    'en-paralelo',
    'En paralelo',
    'Alimenta las dos ampolletas a la vez, cada una con su propio camino.',
    'interactive',
    '{"simulation":"circuit"}'::jsonb,
    2,
    true
  ),
  (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a38',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a23',
    'el-puente',
    'El puente',
    'Pon el eslabón que falta para dejar las dos cargas en serie.',
    'interactive',
    '{"simulation":"circuit"}'::jsonb,
    3,
    true
  ),
  (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a39',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a23',
    'caminos-independientes',
    'Caminos independientes',
    'Dale a la segunda ampolleta su propio ramal, sin depender de la primera.',
    'interactive',
    '{"simulation":"circuit"}'::jsonb,
    4,
    true
  ),
  (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a40',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'medir-tension',
    'Medir tensión',
    'Pon el voltímetro en paralelo y lee 220 V entre + y −.',
    'interactive',
    '{"simulation":"circuit"}'::jsonb,
    2,
    true
  ),
  (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a41',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'medir-corriente',
    'Medir corriente',
    'Inserta el amperímetro en serie, nunca a caballo de la fuente.',
    'interactive',
    '{"simulation":"circuit"}'::jsonb,
    3,
    true
  ),
  (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a42',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'tension-y-corriente',
    'Tensión y corriente',
    'Lee las dos a la vez: voltímetro en paralelo, amperímetro en serie.',
    'interactive',
    '{"simulation":"circuit"}'::jsonb,
    4,
    true
  ),
  (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a43',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a24',
    'colores-de-cables',
    'Colores de los cables',
    'Fase, neutro y tierra: el color dice qué hace cada conductor.',
    'interactive',
    '{"simulation":"circuit"}'::jsonb,
    1,
    true
  ),
  (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a24',
    'interruptor-en-fase',
    'Interruptor en la fase',
    'Corrige el cableado: el interruptor unipolar se coloca en la fase, no en el neutro.',
    'interactive',
    '{"simulation":"circuit"}'::jsonb,
    2,
    true
  ),
  (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a45',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a24',
    'el-tomacorriente',
    'El tomacorriente',
    'Llega fase, neutro y tierra al tomacorriente y enchufa el equipo.',
    'interactive',
    '{"simulation":"circuit"}'::jsonb,
    3,
    true
  ),
  (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a46',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a24',
    'de-la-pila-a-la-red',
    'De la pila a la red',
    'El mismo círculo, ahora con el poste de 220 V. Después, el Laboratorio.',
    'interactive',
    '{"simulation":"circuit"}'::jsonb,
    4,
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
