import { getPlanType } from "@/lib/plan-config";
import { notFound } from "next/navigation";

import EmpresaClientes from "../_plans/empresa/clientes/page";

export default async function ClientesPage() {
  const plan = getPlanType();

  switch (plan) {
    case "empresa":
      return <EmpresaClientes />;
    default:
      // Solo el plan empresa tiene clientes
      notFound();
  }
}
