"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: "Credenciales incorrectas o usuario inexistente." };
  }

  // Verificar si el usuario tiene un tenant asignado
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: userTenant } = await supabase
      .from('user_tenants')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!userTenant) {
      // Cerrar la sesión si no tiene permisos
      await supabase.auth.signOut();
      return { error: "Tu cuenta no tiene un panel asignado." };
    }
  }

  // Redirigir al dashboard si todo sale bien
  redirect("/admin");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
