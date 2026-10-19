import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/auth/AuthForm";
import { SectionArt } from "@/components/ui/SectionArt";

export const metadata: Metadata = { title: "Crear cuenta" };

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-md py-8">
      <SectionArt section="auth" size="sm" className="mx-auto mb-4" />
      <h1 className="font-display text-4xl tracking-tight">Crear cuenta</h1>
      <p className="mt-2 text-muted">
        Así tu avance viaja contigo entre dispositivos.
      </p>
      <div className="mt-8">
        <AuthForm mode="register" />
      </div>
      <p className="mt-6 text-sm text-muted">
        ¿Ya tienes cuenta?{" "}
        <Link href="/iniciar-sesion" className="font-semibold text-primary">
          Entrar
        </Link>
      </p>
    </div>
  );
}
