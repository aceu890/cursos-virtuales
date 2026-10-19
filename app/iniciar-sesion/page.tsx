import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/auth/AuthForm";
import { SectionArt } from "@/components/ui/SectionArt";

export const metadata: Metadata = { title: "Iniciar sesión" };

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md py-8">
      <SectionArt section="auth" size="sm" className="mx-auto mb-4" />
      <h1 className="font-display text-4xl tracking-tight">Iniciar sesión</h1>
      <p className="mt-2 text-muted">
        Guarda tu progreso en la nube cuando Supabase esté configurado.
      </p>
      <div className="mt-8">
        <AuthForm mode="login" />
      </div>
      <p className="mt-6 text-sm text-muted">
        ¿No tienes cuenta?{" "}
        <Link href="/registro" className="font-semibold text-primary">
          Crear una
        </Link>
      </p>
    </div>
  );
}
