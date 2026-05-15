import { getCurrentTenantWithPlan, type PlanType } from "@/utils/auth";
import { redirect } from "next/navigation";

/**
 * Detecta el plan del tenant actual desde la base de datos.
 * Redirige a login si no hay sesión.
 */
export async function detectPlan(): Promise<PlanType> {
  const tenantData = await getCurrentTenantWithPlan();
  if (!tenantData) {
    redirect("/admin/login");
  }
  return tenantData.plan;
}
