"use server";

import { createClient } from "@/utils/supabase/server";
import { sendTicketToCRM } from "@/utils/crm";
import { login as empresaLogin, logout as empresaLogout } from "./empresa/auth";

export async function login(formData: FormData) {
  return empresaLogin(formData);
}

export async function logout() {
  return empresaLogout();
}

export type PasswordActionState = {
  success: boolean;
  message?: string;
  error?: string;
};

export async function updatePassword(
  _prevState: PasswordActionState,
  formData: FormData
): Promise<PasswordActionState> {
  const currentPassword = formData.get("current_password") as string;
  const newPassword = formData.get("new_password") as string;
  const confirmPassword = formData.get("confirm_password") as string;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { success: false, error: "Completá todos los campos." };
  }

  if (newPassword.length < 6) {
    return { success: false, error: "La nueva contraseña debe tener al menos 6 caracteres." };
  }

  if (newPassword !== confirmPassword) {
    return { success: false, error: "Las contraseñas nuevas no coinciden." };
  }

  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) {
    return { success: false, error: "No hay sesión activa." };
  }

  // Verificar la contraseña actual re-autenticando
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });

  if (signInError) {
    return { success: false, error: "La contraseña actual es incorrecta." };
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) {
    return { success: false, error: "No se pudo actualizar la contraseña. Intentá de nuevo." };
  }

  return { success: true, message: "Contraseña actualizada correctamente." };
}

export type ResetRequestState = {
  success: boolean;
  message?: string;
  error?: string;
};

export async function requestPasswordReset(): Promise<ResetRequestState> {
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

  await sendTicketToCRM({
    tenant_id: userTenant.tenant_id,
    name: tenant?.name ?? user.email,
    email: user.email,
    message: `El usuario solicita un restablecimiento de contraseña para su panel de administración.`,
    source: "password_reset_request",
  });

  return { success: true, message: "Solicitud enviada. El equipo de SitioHoy te contactará pronto." };
}
