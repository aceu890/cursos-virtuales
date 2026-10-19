"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DEMO_COURSE_DETAIL } from "@/lib/courses/demo-data";
import { LEVEL_LABEL } from "@/lib/courses/types";
import {
  IconBolt,
  IconCatalog,
  IconHome,
  IconLab,
  IconSettings,
  IconUser,
} from "../ui/Icons";
import { SectionArt } from "../ui/SectionArt";
import { APP_NAV, navActive } from "./nav";

const ICONS = [IconHome, IconCatalog, IconBolt, IconLab, IconSettings];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="panel-dark hidden w-[84px] shrink-0 flex-col rounded-[32px] p-3 text-sidebar-text md:flex lg:w-[268px] lg:p-5">
      <div className="flex items-center gap-3 px-1">
        <span
          aria-hidden
          className="knob-dark grid h-12 w-12 shrink-0 place-items-center rounded-full text-lg"
        >
          <IconUser className="h-6 w-6" />
        </span>
        <div className="hidden min-w-0 lg:block">
          <p className="text-sm font-semibold">Hola</p>
          <p className="text-xs text-sidebar-muted">
            Cursos para hacer, no solo ver
          </p>
        </div>
      </div>

      <nav aria-label="Principal" className="mt-8 flex flex-1 flex-col gap-3">
        {APP_NAV.map((item, index) => {
          const Icon = ICONS[index];
          const active = navActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`pressable flex min-h-11 items-center justify-center gap-3 rounded-2xl px-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary lg:justify-start ${
                active
                  ? "nav-3d-on text-white"
                  : "nav-3d text-sidebar-muted hover:text-sidebar-text"
              }`}
              title={item.label}
            >
              <Icon className={`h-5 w-5 shrink-0 ${active ? "text-primary" : ""}`} />
              <span className="hidden lg:inline">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="nav-3d rounded-3xl p-3 lg:p-4">
        <SectionArt
          section="course"
          size="sm"
          className="mx-auto mb-2 hidden h-16 w-16 lg:block"
        />
        <p className="hidden text-sm font-semibold lg:block">
          {DEMO_COURSE_DETAIL.title}
        </p>
        <p className="mt-1 hidden text-xs leading-relaxed text-sidebar-muted lg:block">
          {LEVEL_LABEL[DEMO_COURSE_DETAIL.level]} · {DEMO_COURSE_DETAIL.estimatedMinutes} min
        </p>
        <Link
          href={`/cursos/${DEMO_COURSE_DETAIL.slug}`}
          className="btn-3d pressable mt-0 inline-flex min-h-10 w-full items-center justify-center rounded-full px-3 text-xs font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary lg:mt-4"
        >
          <span className="lg:hidden">Ir</span>
          <span className="hidden lg:inline">Ir al curso</span>
        </Link>
      </div>
    </aside>
  );
}
