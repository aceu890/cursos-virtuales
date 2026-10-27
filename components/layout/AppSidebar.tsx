"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { DEMO_COURSE_DETAIL } from "@/lib/courses/demo-data";
import { LEVEL_LABEL } from "@/lib/courses/types";
import {
  IconBolt,
  IconCatalog,
  IconHome,
  IconLab,
  IconPlan,
  IconSettings,
  IconUser,
} from "../ui/Icons";
import { SectionArt } from "../ui/SectionArt";
import { APP_NAV, navActive } from "./nav";

const ICONS = [IconHome, IconCatalog, IconBolt, IconPlan, IconLab, IconSettings];
const SIDEBAR_KEY = "practica-sidebar";

function IconSidebarChevron({ compact }: { compact: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden>
      <path
        d={compact ? "M9 6l6 6-6 6" : "M15 6l-6 6 6 6"}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AppSidebar() {
  return (
    <Suspense fallback={<Sidebar pathname="" />}>
      <SidebarRoute />
    </Suspense>
  );
}

function SidebarRoute() {
  const pathname = usePathname();
  return <Sidebar pathname={pathname} />;
}

function Sidebar({ pathname }: { pathname: string }) {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    setCompact(document.documentElement.dataset.sidebar === "compact");
  }, []);

  function toggleSidebar() {
    const next = !compact;
    setCompact(next);
    document.documentElement.dataset.sidebar = next ? "compact" : "full";
    try {
      localStorage.setItem(SIDEBAR_KEY, next ? "compact" : "full");
    } catch {
      /* private mode */
    }
  }

  return (
    <aside className="app-sidebar panel-dark relative hidden w-[84px] shrink-0 flex-col overflow-visible rounded-[32px] p-3 text-sidebar-text md:flex md:h-full md:min-h-0 md:self-stretch lg:w-[268px] lg:p-5">
      <button
        type="button"
        className="sidebar-toggle pressable absolute top-1/2 right-0 z-30 hidden h-7 w-7 -translate-y-1/2 translate-x-1/2 place-items-center rounded-full border border-line bg-sidebar text-sidebar-muted hover:bg-cream hover:text-sidebar-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary lg:grid"
        aria-expanded={!compact}
        aria-label={compact ? "Expandir menú" : "Comprimir menú"}
        onClick={toggleSidebar}
      >
        <IconSidebarChevron compact={compact} />
      </button>
      <div className="sidebar-head flex items-center gap-3 px-3">
        <span
          aria-hidden
          className="knob-dark grid h-12 w-12 shrink-0 place-items-center rounded-full text-lg"
        >
          <IconUser className="h-6 w-6" />
        </span>
        <div className="sidebar-copy hidden min-w-0 lg:block">
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
              className={`sidebar-link pressable flex min-h-11 items-center justify-center gap-3 rounded-2xl px-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary lg:justify-start ${
                active
                  ? "nav-3d-on"
                  : "nav-3d text-sidebar-muted hover:text-sidebar-text"
              }`}
              title={item.label}
            >
              <Icon className={`h-5 w-5 shrink-0 ${active ? "text-primary" : ""}`} />
              <span className="sidebar-copy hidden lg:inline">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="nav-3d rounded-3xl p-3 lg:p-4">
        <SectionArt
          section="course"
          size="sm"
          className="sidebar-copy mx-auto mb-2 hidden h-16 w-16 lg:block"
        />
        <p className="sidebar-copy hidden text-sm font-semibold lg:block">
          {DEMO_COURSE_DETAIL.title}
        </p>
        <p className="sidebar-copy mt-1 hidden text-xs leading-relaxed text-sidebar-muted lg:block">
          {LEVEL_LABEL[DEMO_COURSE_DETAIL.level]} · {DEMO_COURSE_DETAIL.estimatedMinutes} min
        </p>
        <Link
          href={`/cursos/${DEMO_COURSE_DETAIL.slug}`}
          className="btn-3d pressable mt-0 inline-flex min-h-10 w-full items-center justify-center rounded-full px-3 text-xs font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary lg:mt-4"
          title="Ir al curso"
        >
          <span className="sidebar-short lg:hidden">Ir</span>
          <span className="sidebar-copy hidden lg:inline">Ir al curso</span>
        </Link>
      </div>
    </aside>
  );
}
