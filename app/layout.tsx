import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Suspense } from "react";
import { AppShell, ShellFallback } from "@/components/layout/AppShell";
import { DemoBanner } from "@/components/layout/DemoBanner";
import { ProgressProvider } from "@/lib/progress/ProgressProvider";
import { BoardSettingsProvider } from "@/lib/settings/BoardSettingsProvider";
import { RegisterPWA } from "@/components/pwa/RegisterPWA";
import { ThemeScript } from "@/components/theme/ThemeScript";
import { ThemeSync } from "@/components/theme/ThemeSync";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Practica — Cursos interactivos",
    template: "%s · Practica",
  },
  description:
    "Aprende practicando, no solo mirando. Cursos con simulaciones interactivas; empieza por Fundamentos de electricidad.",
  applicationName: "Practica",
  appleWebApp: {
    capable: true,
    title: "Practica",
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#2e3440",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      data-term-size="md"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${plusJakarta.variable} dark h-full overflow-hidden md:overflow-auto antialiased`}
    >
      <head>
        <ThemeScript />
      </head>
      <body className="flex h-full min-h-0 flex-col overflow-hidden font-sans md:min-h-full md:overflow-visible">
        <RegisterPWA />
        <ThemeSync />
        <ProgressProvider>
          <BoardSettingsProvider>
            <DemoBanner />
            <Suspense fallback={<ShellFallback>{children}</ShellFallback>}>
              <AppShell>{children}</AppShell>
            </Suspense>
          </BoardSettingsProvider>
        </ProgressProvider>
      </body>
    </html>
  );
}
