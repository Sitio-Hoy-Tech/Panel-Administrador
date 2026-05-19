"use server";

import { createClient, createAdminClient } from "@/utils/supabase/server";

export type SupportRequestState = {
  success: boolean;
  message?: string;
  error?: string;
};

const VALID_TYPES = [
  "support_technical",
  "support_configuration",
  "support_billing",
  "support_other",
] as const;

export async function submitSupportRequest(
  _prevState: SupportRequestState,
  formData: FormData
): Promise<SupportRequestState> {
  const type = formData.get("type") as string;
  const message = (formData.get("message") as string)?.trim();

  if (!VALID_TYPES.includes(type as (typeof VALID_TYPES)[number])) {
    return { success: false, error: "Seleccioná un tipo de consulta." };
  }

  if (!message || message.length < 10) {
    return { success: false, error: "El mensaje debe tener al menos 10 caracteres." };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.email) {
    return { success: false, error: "No hay sesión activa." };
  }

  const { data: userTenant } = await supabase
    .from("user_tenants")
    .select("tenant_id")
    .eq("user_id", user.id)
    .single();

  if (!userTenant?.tenant_id) {
    return { success: false, error: "No se encontró el tenant asociado." };
  }

  const { data: tenant } = await supabase
    .from("tenants")
    .select("name")
    .eq("id", userTenant.tenant_id)
    .single();

  const adminClient = createAdminClient();
  const { error } = await adminClient.from("contact_messages").insert({
    tenant_id: userTenant.tenant_id,
    name: tenant?.name ?? user.email,
    email: user.email,
    message,
    source: type,
    status: "new",
  });

  if (error) {
    return { success: false, error: "No se pudo enviar la consulta. Intentá de nuevo." };
  }

  return { success: true, message: "Consulta enviada. Te responderemos pronto." };
}
