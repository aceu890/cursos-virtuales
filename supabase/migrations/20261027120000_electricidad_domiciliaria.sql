-- Electricidad domiciliaria: curso de pago, 4 módulos y 13 lecciones.
-- El tablero de cada lección vive en el código (DOMICILIARIA_LESSONS).

insert into public.courses (
  id, slug, title, description, level, estimated_minutes, cover_image, published, sort_order
) values (
  'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b11',
  'electricidad-domiciliaria',
  'Electricidad domiciliaria',
  'Curso de pago. De la acometida al tablero de la vivienda: protecciones, punto de luz, enchufe, medición y los fallos que hay que corregir. Cada lección se arma y se comprueba en el tablero. En esta práctica puedes recorrerlo entero.',
  'intermedio',
  180,
  '/illustrations/curso-electricidad.png',
  true,
  2
) on conflict (id) do update set
  slug = excluded.slug,
  title = excluded.title,
  description = excluded.description,
  level = excluded.level,
  estimated_minutes = excluded.estimated_minutes,
  cover_image = excluded.cover_image,
  published = excluded.published,
  sort_order = excluded.sort_order;

insert into public.modules (id, course_id, title, description, sort_order) values
  (
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b21',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b11',
    'La acometida y el tablero',
    'Del poste al automático: el orden en que la energía entra a la casa.',
    1
  ),
  (
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b11',
    'Circuitos de la vivienda',
    'Punto de luz, enchufe y los dos en el mismo automático.',
    2
  ),
  (
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b23',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b11',
    'Medir en casa',
    'Tensión en el tomacorriente y corriente en el camino de la fase.',
    3
  ),
  (
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b24',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b11',
    'Fallos y obra terminada',
    'Tierra que falta, interruptor en el neutro, una fuga y el tablero completo.',
    4
  )
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  sort_order = excluded.sort_order;

insert into public.lessons (
  id, module_id, slug, title, description, lesson_type, content, sort_order, published
) values
  (
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b31',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b21',
    'la-acometida',
    'La acometida',
    'Trae la fase y el neutro del poste hasta una lámpara, con el interruptor en la fase.',
    'interactive',
    '{"simulation":"circuit"}'::jsonb,
    1,
    true
  ),
  (
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b32',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b21',
    'el-interruptor-general',
    'El interruptor general',
    'Corta fase y neutro juntos: es el primer aparato del tablero.',
    'interactive',
    '{"simulation":"circuit"}'::jsonb,
    2,
    true
  ),
  (
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b33',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b21',
    'el-diferencial',
    'El diferencial',
    'Después del general va el diferencial: vigila que la corriente que sale vuelva.',
    'interactive',
    '{"simulation":"circuit"}'::jsonb,
    3,
    true
  ),
  (
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b34',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b21',
    'el-automatico',
    'El automático',
    'El automático protege el cable del circuito: si hay demasiada corriente, abre.',
    'interactive',
    '{"simulation":"circuit"}'::jsonb,
    4,
    true
  ),
  (
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b35',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22',
    'punto-de-luz',
    'Punto de luz',
    'Un automático alimenta una lámpara, y el interruptor de pared corta solo la fase.',
    'interactive',
    '{"simulation":"circuit"}'::jsonb,
    1,
    true
  ),
  (
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b36',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22',
    'el-enchufe-de-la-vivienda',
    'El enchufe',
    'Lleva fase, neutro y tierra a un tomacorriente y enchufa el equipo.',
    'interactive',
    '{"simulation":"circuit"}'::jsonb,
    2,
    true
  ),
  (
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b37',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22',
    'luz-y-enchufe',
    'Luz y enchufe',
    'Un mismo automático alimenta la lámpara conmutada y el tomacorriente siempre vivo.',
    'interactive',
    '{"simulation":"circuit"}'::jsonb,
    3,
    true
  ),
  (
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b38',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b23',
    'tension-en-el-enchufe',
    'Tensión en el enchufe',
    'Mide 220 V entre fase y neutro del tomacorriente, en paralelo.',
    'interactive',
    '{"simulation":"circuit"}'::jsonb,
    1,
    true
  ),
  (
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b39',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b23',
    'corriente-del-circuito',
    'Corriente del circuito',
    'Inserta el medidor de corriente en la fase, en serie, antes del automático.',
    'interactive',
    '{"simulation":"circuit"}'::jsonb,
    2,
    true
  ),
  (
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b40',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b24',
    'la-tierra-que-falta',
    'La tierra que falta',
    'El enchufe funciona, pero no tiene protección. Agrega el conductor de tierra.',
    'interactive',
    '{"simulation":"circuit"}'::jsonb,
    1,
    true
  ),
  (
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b41',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b24',
    'cortar-la-fase',
    'Cortar la fase',
    'La luz se apaga, pero el interruptor está en el neutro. Pásalo a la fase.',
    'interactive',
    '{"simulation":"circuit"}'::jsonb,
    2,
    true
  ),
  (
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b42',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b24',
    'la-fuga',
    'La fuga',
    'Un cable une la fase con la tierra. El diferencial lo acusa: quita esa unión.',
    'interactive',
    '{"simulation":"circuit"}'::jsonb,
    3,
    true
  ),
  (
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b43',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b24',
    'tablero-de-la-vivienda',
    'Tablero de la vivienda',
    'Arma la casa completa: protecciones, punto de luz y enchufe con tierra.',
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
