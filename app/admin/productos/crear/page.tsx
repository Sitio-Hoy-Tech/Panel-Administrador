import { detectPlan } from "@/lib/plan-config";

import EsencialCrear from "../../_plans/esencial/productos/crear/page";
import EmprendimientoCrear from "../../_plans/emprendimiento/productos/crear/page";
import EmpresaCrear from "../../_plans/empresa/productos/crear/page";

export default async function CrearProductoPage() {
  const plan = await detectPlan();

  switch (plan) {
    case "esencial":
      return <EsencialCrear />;
    case "emprendimiento":
      return <EmprendimientoCrear />;
    case "empresa":
      return <EmpresaCrear />;
  }
}
