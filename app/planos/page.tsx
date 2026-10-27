import type { Metadata } from "next";
import { PlanosView } from "@/components/planos/PlanosView";

export const metadata: Metadata = {
  title: "Planos",
  description:
    "Plano de una casa pequeña para colocar símbolos eléctricos.",
};

export default function PlanosPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <h1 className="sr-only">Planos</h1>
      <PlanosView />
    </div>
  );
}
