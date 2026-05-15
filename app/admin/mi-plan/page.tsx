import { getPlanType } from "@/lib/plan-config";

import EsencialMiPlan from "../_plans/esencial/mi-plan/page";
import EmprendimientoMiPlan from "../_plans/emprendimiento/mi-plan/page";
import EmpresaMiPlan from "../_plans/empresa/mi-plan/page";

export default function MiPlanPage() {
  const plan = getPlanType();

  switch (plan) {
    case "esencial":
      return <EsencialMiPlan />;
    case "emprendimiento":
      return <EmprendimientoMiPlan />;
    case "empresa":
      return <EmpresaMiPlan />;
  }
}
