# Practica — plataforma de cursos interactivos

PWA educativa (MVP) para aprender **practicando**, no solo mirando. El primer curso es **Fundamentos de electricidad**, con una lección interactiva de circuito simple.

El service worker usa **Serwist**, sucesor mantenido de Workbox, empaquetado con esbuild para convivir con el build Turbopack de Next.js 16.

## Cómo ejecutar

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). **No hace falta configurar Supabase**: sin variables de entorno la app corre en modo demo (catálogo de ejemplo y progreso en `localStorage`).

Otros comandos:

```bash
npm run test          # motor de circuitos (Vitest)
npm run typecheck
npm run lint
npm run build         # producción + iconos + service worker
npm start
npm run test:e2e      # opcional (Playwright; instala Chromium antes)
```

## Configurar Supabase (opcional)

1. Crea un proyecto en [Supabase](https://supabase.com).
2. Copia `.env.example` a `.env.local` y rellena:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

No uses la **service role key** en el cliente ni en ninguna variable `NEXT_PUBLIC_*`.

3. En el SQL Editor (o con la CLI), ejecuta `supabase/migrations/20241008120000_init.sql`. Crea tablas, índices, RLS, el trigger de perfil al registrarse y el seed del curso.
4. En Authentication, habilita correo/contraseña. Las páginas `/iniciar-sesion` y `/registro` ya están listas.
5. Reinicia `npm run dev`. El aviso de modo demo desaparece. El progreso de quien inicie sesión se guarda en `lesson_progress`.

## Qué incluye el MVP

- Inicio, catálogo (carga / vacío / error), página de curso y lecciones
- Lección 1 interactiva: batería, interruptor y ampolleta con React Flow
- Motor puro `evaluateCircuit` con pruebas de circuito abierto, pieza suelta, conexión inválida y éxito
- Progreso en localStorage (demo) o Supabase
- PWA: `app/manifest.ts`, iconos, página `/offline`, instalación y caché de shell + lecciones visitadas
- Touch (botones grandes) y teclado (origen/destino + Unir)

## PWA / Lighthouse

Tras `npm run build && npm start`:

- **Verificado en el repo:** manifest (`name`, iconos 192/512, `display: standalone`, `lang: es`), service worker generado en `public/sw.js`, fallback `/offline`, `theme-color`.
- **No verificado aquí:** auditoría Lighthouse PWA en Chrome (requiere HTTPS o localhost en tu máquina). Ejecuta Lighthouse sobre `http://localhost:3000` en producción local.

## Fuera de alcance

Pagos, admin, reseñas, certificados, foros y editor de cursos.
