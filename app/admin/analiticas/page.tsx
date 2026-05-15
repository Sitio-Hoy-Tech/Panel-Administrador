import { getPlanType } from "@/lib/plan-config";
import { notFound } from "next/navigation";

import EmprendimientoAnaliticas from "../_plans/emprendimiento/analiticas/page";

export default function AnaliticasPage() {
  const plan = getPlanType();

  switch (plan) {
    case "emprendimiento":
      return <EmprendimientoAnaliticas />;
    default:
      // Solo el plan emprendimiento tiene la ruta /analiticas
      notFound();
  }
}
