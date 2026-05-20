"use server";

import { createClient } from "@/utils/supabase/server";
import { setTenantCookie, clearTenantCookie } from "@/utils/auth";
import { revalidatePath } from "next/cache";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Credenciales incorrectas o usuario inexistente." };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: userTenant } = await supabase
      .from("user_tenants")
      .select("tenant_id")
      .eq("user_id", user.id)
      .single();

    if (!userTenant) {
      await supabase.auth.signOut();
      return { error: "Tu cuenta no tiene un panel asignado." };
    }

    await setTenantCookie(userTenant.tenant_id);
  }

  revalidatePath('/admin', 'layout');
  return { success: true };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  await clearTenantCookie();
  revalidatePath('/admin', 'layout');
  return { success: true };
}
