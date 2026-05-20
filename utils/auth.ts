import { cache } from "react";
import { cookies } from "next/headers";
import { createClient } from "./supabase/server";

export type PlanType = "esencial" | "emprendimiento" | "empresa";

const TENANT_COOKIE = "__sh_tid";

export const getCurrentTenant = cache(async (): Promise<string | null> => {
  // Fast path: leer de cookie (evita getUser() + query en cada navegación)
  const cookieStore = await cookies();
  const cached = cookieStore.get(TENANT_COOKIE)?.value;
  if (cached) return cached;

  // Slow path: solo al primer request tras login o si la cookie fue borrada
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return null;

  const { data: userTenant, error: tenantError } = await supabase
    .from("user_tenants")
    .select("tenant_id, role")
    .eq("user_id", user.id)
    .single();

  if (tenantError || !userTenant) return null;

  return userTenant.tenant_id;
});

export const getCurrentTenantWithPlan = cache(async (): Promise<{ tenantId: string; plan: PlanType } | null> => {
  const cookieStore = await cookies();
  const cachedTenantId = cookieStore.get(TENANT_COOKIE)?.value;

  const supabase = await createClient();

  if (cachedTenantId) {
    const { data: tenant, error } = await supabase
      .from("tenants")
      .select("plan")
      .eq("id", cachedTenantId)
      .single();

    if (!error && tenant) {
      const planRaw = (tenant.plan || "").toLowerCase().trim();
      let plan: PlanType = "esencial";
      if (planRaw.includes("empresa")) plan = "empresa";
      else if (planRaw.includes("emprendimiento")) plan = "emprendimiento";
      return { tenantId: cachedTenantId, plan };
    }
  }

  // Slow path
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return null;

  const { data, error } = await supabase
    .from("user_tenants")
    .select("tenant_id, tenants(plan)")
    .eq("user_id", user.id)
    .single();

  if (error || !data?.tenant_id) return null;

  const planRaw = ((data.tenants as any)?.plan || "").toLowerCase().trim();
  let plan: PlanType = "esencial";
  if (planRaw.includes("empresa")) plan = "empresa";
  else if (planRaw.includes("emprendimiento")) plan = "emprendimiento";

  return { tenantId: data.tenant_id, plan };
});

export async function setTenantCookie(tenantId: string) {
  const cookieStore = await cookies();
  cookieStore.set(TENANT_COOKIE, tenantId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearTenantCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(TENANT_COOKIE);
}
