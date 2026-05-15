import { createClient } from "./supabase/server";

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
