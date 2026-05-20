"use server";

import { createClient } from "@/utils/supabase/server";
import { getCurrentTenant } from "@/utils/auth";
import { revalidatePath, revalidateTag } from "next/cache";
import { revalidateStorefront } from "@/utils/revalidate-storefront";
import { TAGS } from "@/utils/cached-queries";

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
    
    const cleanPhone = phone.trim();

    const { error } = await supabase
      .from("tenants")
      .update({ origin_phone: cleanPhone })
      .eq("id", tenantId);

    if (error) {
      console.error("Error actualizando teléfono:", error);
      return { success: false, error: "Error de base de datos al guardar los cambios." };
    }

    revalidatePath("/admin");
    revalidatePath("/admin/configuracion");
    await revalidateStorefront(tenantId, "tenants");

    return { success: true, message: "Teléfono guardado exitosamente." };
  } catch (error) {
    console.error("Error inesperado en updatePhone:", error);
    return { success: false, error: "Ocurrió un error inesperado al procesar la solicitud." };
  }
}

// Tipos para zonas de envío
export type ShippingZone = {
  id: string;
  name: string;
  price: number;
};

export async function getShippingZones(): Promise<{ success: boolean; data?: ShippingZone[]; error?: string }> {
  const tenantId = await getCurrentTenant();
  if (!tenantId) {
    return { success: false, error: "No autorizado" };
  }

  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('shipping_zones')
    .select('id, name, price')
    .eq('tenant_id', tenantId)
    .order('name', { ascending: true });

  if (error) {
    console.error("Error obteniendo zonas de envío:", error);
    return { success: false, error: "Error al cargar las zonas de envío." };
  }

  return { success: true, data: data || [] };
}

export async function saveShippingZone(prevState: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const tenantId = await getCurrentTenant();
    if (!tenantId) {
      return { success: false, error: "No autorizado" };
    }

    const name = formData.get("zone_name") as string;
    const price = parseFloat(formData.get("zone_price") as string);

    if (!name || name.trim() === "") {
      return { success: false, error: "El nombre de la zona es obligatorio." };
    }

    if (isNaN(price) || price < 0) {
      return { success: false, error: "El precio debe ser un número válido." };
    }

    const supabase = await createClient();

    const { error } = await supabase
      .from('shipping_zones')
      .insert({
        tenant_id: tenantId,
        name: name.trim(),
        price
      });

    if (error) {
      console.error("Error guardando zona de envío:", error);
      return { success: false, error: "Error al guardar la zona de envío." };
    }

    revalidateTag(TAGS.zonasEnvio(tenantId), 'max');
    revalidatePath("/admin/configuracion");
    await revalidateStorefront(tenantId, "shipping_zones");
    return { success: true, message: "Zona de envío creada exitosamente." };
  } catch (error) {
    console.error("Error inesperado en saveShippingZone:", error);
    return { success: false, error: "Ocurrió un error inesperado." };
  }
}

export async function deleteShippingZone(zoneId: string) {
  const tenantId = await getCurrentTenant();
  if (!tenantId) {
    return { error: "No autorizado" };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from('shipping_zones')
    .delete()
    .eq('id', zoneId)
    .eq('tenant_id', tenantId);

  if (error) {
    console.error("Error eliminando zona de envío:", error);
    return { error: "Error al eliminar la zona de envío." };
  }

  revalidatePath("/admin/configuracion");
  await revalidateStorefront(tenantId, "shipping_zones");
  return { success: true };
}
