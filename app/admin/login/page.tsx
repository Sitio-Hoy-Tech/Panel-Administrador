import { detectPlan } from "@/lib/plan-config";

import EsencialLogin from "../_plans/esencial/login/page";
import EmprendimientoLogin from "../_plans/emprendimiento/login/page";
import EmpresaLogin from "../_plans/empresa/login/page";

export default async function LoginPage() {
  // En login no hay sesión, usamos env var como fallback
  const plan = process.env.NEXT_PUBLIC_PLAN_TYPE || "empresa";

  switch (plan) {
    case "esencial":
      return <EsencialLogin />;
    case "emprendimiento":
      return <EmprendimientoLogin />;
    case "empresa":
    default:
      return <EmpresaLogin />;
  }
}
