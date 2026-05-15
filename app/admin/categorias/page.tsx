import { getPlanType } from "@/lib/plan-config";
import { notFound } from "next/navigation";

import EmprendimientoCategorias from "../_plans/emprendimiento/categorias/page";
import EmpresaCategorias from "../_plans/empresa/categorias/page";

export default async function CategoriasPage() {
  const plan = getPlanType();

  switch (plan) {
    case "emprendimiento":
      return <EmprendimientoCategorias />;
    case "empresa":
      return <EmpresaCategorias />;
    default:
      // Plan esencial no tiene categorías
      notFound();
  }
}
