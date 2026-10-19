"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconBolt, IconCatalog, IconHome, IconLab, IconSettings } from "../ui/Icons";
import { APP_NAV, navActive } from "./nav";

const ICONS = [IconHome, IconCatalog, IconBolt, IconLab, IconSettings];
const TAB_LABELS = ["Inicio", "Cursos", "Míos", "Lab", "Ajustes"] as const;

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Principal" className="mobile-dock md:hidden">
      <div className="mobile-dock-bar">
        {APP_NAV.map((item, index) => {
          const Icon = ICONS[index];
          const active = navActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              aria-label={item.label}
              className="mobile-dock-item focus-visible:-outline-offset-4 focus-visible:outline-2 focus-visible:outline-primary"
            >
              <Icon className="h-5 w-5" />
              <span className="mobile-dock-label">
                {TAB_LABELS[index] ?? item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
