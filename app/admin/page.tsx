import { getPlanType } from "@/lib/plan-config";

import EsencialDashboard from "./_plans/esencial/DashboardPage";
import EmprendimientoDashboard from "./_plans/emprendimiento/DashboardPage";
import EmpresaDashboard from "./_plans/empresa/DashboardPage";

export default async function Dashboard() {
  const plan = getPlanType();

  switch (plan) {
    case "esencial":
      return <EsencialDashboard />;
    case "emprendimiento":
      return <EmprendimientoDashboard />;
    case "empresa":
      return <EmpresaDashboard />;
  }
}
