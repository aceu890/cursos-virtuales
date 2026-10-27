import { DEMO_COURSE_DETAIL } from "@/lib/courses/demo-data";

export const APP_NAV = [
  { href: "/", label: "Inicio" },
  { href: "/catalogo", label: "Cursos" },
  {
    href: `/cursos/${DEMO_COURSE_DETAIL.slug}`,
    label: "Mis cursos",
  },
  { href: "/planos", label: "Planos" },
  { href: "/laboratorio", label: "Laboratorio" },
  { href: "/configuracion", label: "Configuración" },
] as const;

export function sectionTitle(pathname: string): string {
  if (pathname.startsWith("/catalogo")) return "Cursos";
  if (pathname.includes("/lecciones/")) return "Lección";
  if (pathname.startsWith("/cursos/")) return "Mis cursos";
  if (pathname.startsWith("/iniciar-sesion")) return "Iniciar sesión";
  if (pathname.startsWith("/registro")) return "Crear cuenta";
  if (pathname.startsWith("/planos")) return "Planos";
  if (pathname.startsWith("/laboratorio")) return "Laboratorio";
  if (pathname.startsWith("/configuracion")) return "Configuración";
  if (pathname.startsWith("/offline")) return "Sin conexión";
  return "Inicio";
}

export function navActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
