"use server";

import { createClient } from "@/utils/supabase/server";
import { getCurrentTenant } from "@/utils/auth";
import { revalidatePath } from "next/cache";

export type ActionState = {
  success: boolean;
  message?: string;
  error?: string;
};

export async function updatePhone(prevState: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const tenantId = await getCurrentTenant();
    if (!tenantId) {
      return { success: false, error: "No tienes una sesión activa o no perteneces a un negocio." };
    }

    const phone = formData.get("phone") as string;
    if (!phone || phone.trim() === "") {
      return { success: false, error: "El teléfono no puede estar vacío." };
    }

    const supabase = await createClient();
    
    // Limpiamos un poco los espacios extra antes de guardar
    const cleanPhone = phone.trim();

    const { error } = await supabase
      .from("tenants")
      .update({ origin_phone: cleanPhone })
      .eq("id", tenantId);

    if (error) {
      console.error("Error actualizando teléfono:", error);
      return { success: false, error: "Error de base de datos al guardar los cambios." };
    }

    revalidatePath("/");
    revalidatePath("/configuracion");
    
    return { success: true, message: "Teléfono guardado exitosamente." };
  } catch (error) {
    console.error("Error inesperado en updatePhone:", error);
    return { success: false, error: "Ocurrió un error inesperado al procesar la solicitud." };
  }
}
