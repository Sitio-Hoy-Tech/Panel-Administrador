import { createClient } from "./supabase/server";

export type PlanType = "esencial" | "emprendimiento" | "empresa";

export async function getCurrentTenant() {
  const supabase = await createClient();
  
  // Obtenemos el usuario logueado
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return null;
  }

  // Obtenemos el tenant asociado a este usuario
  const { data: userTenant, error: tenantError } = await supabase
    .from('user_tenants')
    .select('tenant_id, role')
    .eq('user_id', user.id)
    .single();

  if (tenantError || !userTenant) {
    return null;
  }

  return userTenant.tenant_id;
}

export async function getCurrentTenantWithPlan(): Promise<{ tenantId: string; plan: PlanType } | null> {
  const supabase = await createClient();
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return null;
  }

  const { data: userTenant, error: tenantError } = await supabase
    .from('user_tenants')
    .select('tenant_id')
    .eq('user_id', user.id)
    .single();

  if (tenantError || !userTenant) {
    return null;
  }

  const { data: tenant, error: planError } = await supabase
    .from('tenants')
    .select('plan')
    .eq('id', userTenant.tenant_id)
    .single();

  if (planError || !tenant) {
    return null;
  }

  // Normalizar el plan (por si viene con mayúsculas o variaciones)
  const planRaw = (tenant.plan || "").toLowerCase().trim();
  let plan: PlanType = "esencial"; // default
  if (planRaw.includes("empresa")) {
    plan = "empresa";
  } else if (planRaw.includes("emprendimiento")) {
    plan = "emprendimiento";
  }

  return { tenantId: userTenant.tenant_id, plan };
}

