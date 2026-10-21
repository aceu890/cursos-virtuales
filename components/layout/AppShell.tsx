"use client";

import { usePathname } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { UserMenu } from "../auth/UserMenu";
import { InstallPrompt } from "../pwa/InstallPrompt";
import { ThemeToggle } from "../theme/ThemeToggle";
import { AppSidebar } from "./AppSidebar";
import { MobileNav } from "./MobileNav";
import { sectionTitle } from "./nav";

function ShellFrame({
  title,
  children,
}: {
  title?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden md:min-h-full md:overflow-visible md:p-3 lg:p-4">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground"
      >
        Saltar al contenido
      </a>
      <div className="flex min-h-0 w-full flex-1 gap-4 overflow-hidden md:overflow-visible">
        <AppSidebar />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden md:overflow-visible">
          <header className="flex shrink-0 items-center justify-between gap-3 px-4 pb-2 pt-4 md:px-2 md:pt-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                Practica
              </p>
              <p className="text-lg font-semibold tracking-tight">
                {title ?? "Inicio"}
              </p>
            </div>
            <div className="mobile-tools">
              <ThemeToggle />
              <InstallPrompt variant="icon" />
              <UserMenu />
            </div>
          </header>
          <main
            id="contenido"
            className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-4 md:px-2 md:pb-6"
          >
            {children}
          </main>
        </div>
      </div>
      <MobileNav />
    </div>
  );
}

export function ShellFallback({ children }: { children: ReactNode }) {
  return <ShellFrame>{children}</ShellFrame>;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ShellFrame
      title={
        <Suspense fallback="Inicio">
          <ShellTitle />
        </Suspense>
      }
    >
      {children}
    </ShellFrame>
  );
}

function ShellTitle() {
  const pathname = usePathname();
  return sectionTitle(pathname);
}
