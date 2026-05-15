import { getCurrentTenantWithPlan } from "@/utils/auth";
import { redirect } from "next/navigation";

import EsencialDashboard from "./_plans/esencial/DashboardPage";
import EmprendimientoDashboard from "./_plans/emprendimiento/DashboardPage";
import EmpresaDashboard from "./_plans/empresa/DashboardPage";

export default async function Dashboard() {
  const tenantData = await getCurrentTenantWithPlan();

  if (!tenantData) {
    redirect("/admin/login");
  }

  switch (tenantData.plan) {
    case "esencial":
      return <EsencialDashboard />;
    case "emprendimiento":
      return <EmprendimientoDashboard />;
    case "empresa":
      return <EmpresaDashboard />;
  }
}
