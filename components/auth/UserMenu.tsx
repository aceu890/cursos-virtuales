"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { isSupabaseConfigured } from "@/lib/env";
import { createBrowserSupabase } from "@/lib/supabase/browser";

export function UserMenu() {
  const configured = isSupabaseConfigured();
  const [email, setEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(!configured);

  useEffect(() => {
    if (!configured) {
      return;
    }
    const supabase = createBrowserSupabase();
    if (!supabase) {
      Promise.resolve().then(() => setReady(true));
      return;
    }

    void supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
      setReady(true);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user.email ?? null);
    });

    return () => data.subscription.unsubscribe();
  }, [configured]);

  if (!configured) {
    return null;
  }

  if (!ready) {
    return (
      <span className="h-9 w-20 animate-pulse rounded-full bg-line/80" />
    );
  }

  if (!email) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/iniciar-sesion"
          className="btn-3d-soft pressable rounded-full px-3 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Entrar
        </Link>
        <Link
          href="/registro"
          className="btn-3d pressable rounded-full px-4 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Crear cuenta
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="hidden max-w-40 truncate text-xs text-muted sm:inline">
        {email}
      </span>
      <button
        type="button"
        className="btn-3d-soft pressable rounded-full px-3 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        onClick={async () => {
          const supabase = createBrowserSupabase();
          await supabase?.auth.signOut();
        }}
      >
        Salir
      </button>
    </div>
  );
}
