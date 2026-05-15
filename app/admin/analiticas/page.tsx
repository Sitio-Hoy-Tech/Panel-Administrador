import { detectPlan } from "@/lib/plan-config";
import { notFound } from "next/navigation";

import EmprendimientoAnaliticas from "../_plans/emprendimiento/analiticas/page";

export default async function AnaliticasPage() {
  const plan = await detectPlan();

  switch (plan) {
    case "emprendimiento":
      return <EmprendimientoAnaliticas />;
    default:
      notFound();
  }
}
