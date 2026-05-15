import { getPlanType } from "@/lib/plan-config";

import EsencialLogin from "../_plans/esencial/login/page";
import EmprendimientoLogin from "../_plans/emprendimiento/login/page";
import EmpresaLogin from "../_plans/empresa/login/page";

export default function LoginPage() {
  const plan = getPlanType();

  switch (plan) {
    case "esencial":
      return <EsencialLogin />;
    case "emprendimiento":
      return <EmprendimientoLogin />;
    case "empresa":
      return <EmpresaLogin />;
  }
}
