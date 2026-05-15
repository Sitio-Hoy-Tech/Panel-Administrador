// Configuración central del plan - determinada por variable de entorno
export type PlanType = "esencial" | "emprendimiento" | "empresa";

export function getPlanType(): PlanType {
  const plan = process.env.NEXT_PUBLIC_PLAN_TYPE as PlanType;
  if (!plan || !["esencial", "emprendimiento", "empresa"].includes(plan)) {
    throw new Error(
      "NEXT_PUBLIC_PLAN_TYPE debe ser 'esencial', 'emprendimiento' o 'empresa'. Configuralo en .env.local"
    );
  }
  return plan;
}
