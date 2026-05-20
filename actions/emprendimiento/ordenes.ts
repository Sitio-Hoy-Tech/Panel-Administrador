"use server";

import { createClient } from "@/utils/supabase/server";
import { getCurrentTenant } from "@/utils/auth";
import { revalidatePath, revalidateTag } from "next/cache";
import { getOrdenesCached, TAGS } from "@/utils/cached-queries";

export async function getOrdenes(filters?: { search?: string; status?: string; payment?: string }) {
  const tenantId = await getCurrentTenant();
  if (!tenantId) return { error: "No autorizado" };

  const data = await getOrdenesCached(tenantId, filters ?? {});
  if (!data) return { error: "Error al cargar las ordenes." };
  return { success: true, data };
}

export async function actualizarEstadoOrden(orderId: string, status: string) {
  const tenantId = await getCurrentTenant();
  if (!tenantId) return { error: "No autorizado" };

  const supabase = await createClient();
  const { error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', orderId)
    .eq('tenant_id', tenantId);

  if (error) {
    console.error("Error actualizando la orden:", error);
    return { error: "No se pudo actualizar el estado." };
  }

  revalidateTag(TAGS.ordenes(tenantId), 'max');
  revalidatePath("/admin/ordenes");
  revalidatePath("/admin");
  return { success: true };
}

export async function getOrdenById(orderId: string) {
  const tenantId = await getCurrentTenant();
  if (!tenantId) return { error: "No autorizado" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items!fk_order_items_order (*)
    `)
    .eq('id', orderId)
    .eq('tenant_id', tenantId)
    .single();

  if (error) return { error: "Error al cargar el detalle de la orden." };
  return { success: true, data };
}
