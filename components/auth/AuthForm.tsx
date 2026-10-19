"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/env";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import { Button } from "../ui/Button";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (!isSupabaseConfigured()) {
    return (
      <p className="neu rounded-[24px] p-6 text-muted">
        El modo demo no usa cuentas. Explora el catálogo; tu progreso queda en
        este dispositivo.
      </p>
    );
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setPending(true);
    const supabase = createBrowserSupabase();
    if (!supabase) {
      setError("Supabase no está configurado.");
      setPending(false);
      return;
    }

    if (mode === "login") {
      const { error: signError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signError) {
        setError("No se pudo entrar. Revisa el correo y la contraseña.");
      } else {
        router.push("/catalogo");
        router.refresh();
      }
    } else {
      const { error: signError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (signError) {
        setError("No se pudo crear la cuenta. Prueba con otro correo.");
      } else {
        setMessage(
          "Cuenta creada. Si tu proyecto pide confirmar el correo, revisa la bandeja; si no, ya puedes entrar.",
        );
      }
    }
    setPending(false);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Correo
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="neu-inset mt-1 w-full rounded-2xl px-4 py-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="neu-inset mt-1 w-full rounded-2xl px-4 py-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        />
      </div>
      {error ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}
      {message ? (
        <p role="status" className="text-sm text-success">
          {message}
        </p>
      ) : null}
      <Button type="submit" disabled={pending} className="w-full">
        {pending
          ? "Un momento…"
          : mode === "login"
            ? "Entrar"
            : "Crear cuenta"}
      </Button>
    </form>
  );
}
