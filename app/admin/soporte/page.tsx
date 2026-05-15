import { detectPlan } from "@/lib/plan-config";

import EsencialSoporte from "../_plans/esencial/soporte/page";
import EmprendimientoSoporte from "../_plans/emprendimiento/soporte/page";
import EmpresaSoporte from "../_plans/empresa/soporte/page";

export default async function SoportePage() {
  const plan = await detectPlan();

  switch (plan) {
    case "esencial":
      return <EsencialSoporte />;
    case "emprendimiento":
      return <EmprendimientoSoporte />;
    case "empresa":
      return <EmpresaSoporte />;
  }
}
