import { getPlanType } from "@/lib/plan-config";

import EsencialConfig from "../_plans/esencial/configuracion/page";
import EmprendimientoConfig from "../_plans/emprendimiento/configuracion/page";
import EmpresaConfig from "../_plans/empresa/configuracion/page";

export default async function ConfiguracionPage() {
  const plan = getPlanType();

  switch (plan) {
    case "esencial":
      return <EsencialConfig />;
    case "emprendimiento":
      return <EmprendimientoConfig />;
    case "empresa":
      return <EmpresaConfig />;
  }
}
