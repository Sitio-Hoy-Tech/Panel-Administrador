import { detectPlan } from "@/lib/plan-config";
import { notFound } from "next/navigation";

import EmpresaClientes from "../_plans/empresa/clientes/page";

export default async function ClientesPage() {
  const plan = await detectPlan();

  switch (plan) {
    case "empresa":
      return <EmpresaClientes />;
    default:
      notFound();
  }
}
