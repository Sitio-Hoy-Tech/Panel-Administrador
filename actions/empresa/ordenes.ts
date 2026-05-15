"use server";

import { createClient } from "@/utils/supabase/server";
import { getCurrentTenant } from "@/utils/auth";
import { revalidatePath } from "next/cache";

export async function getOrdenes(filters?: { search?: string; status?: string; payment?: string }) {
  const tenantId = await getCurrentTenant();
  if (!tenantId) return { error: "No autorizado" };

  const supabase = await createClient();
  let query = supabase
    .from('orders')
    .select('*')
    .eq('tenant_id', tenantId);

  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }

  if (filters?.payment && filters.payment !== 'all') {
    if (filters.payment === 'paid') {
      query = query.not('mp_payment_id', 'is', null);
    } else if (filters.payment === 'pending') {
      query = query.is('mp_payment_id', null);
    }
  }

  if (filters?.search) {
    const s = filters.search.toLowerCase();
    query = query.or(`customer_first_name.ilike.%${s}%,customer_last_name.ilike.%${s}%,payer_email.ilike.%${s}%,id.ilike.%${s}%`);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error("Error obteniendo ordenes:", error);
    return { error: "Error al cargar las ordenes." };
  }

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
