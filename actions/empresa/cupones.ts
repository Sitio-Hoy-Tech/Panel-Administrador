"use server";

import { createClient } from "@/utils/supabase/server";
import { getCurrentTenant } from "@/utils/auth";
import { revalidatePath } from "next/cache";

export async function getCupones() {
  const tenantId = await getCurrentTenant();
  if (!tenantId) return { error: "No autorizado" };

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('tenant_id', tenantId);

  if (error) {
    console.error("Error obteniendo cupones:", error);
    return { error: "Error al cargar los cupones." };
  }

  return { success: true, data };
}

export async function createCupon(cuponData: any) {
  const tenantId = await getCurrentTenant();
  if (!tenantId) return { error: "No autorizado" };

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('coupons')
    .insert([
      { 
        tenant_id: tenantId,
        code: cuponData.code,
        type: cuponData.type,
        value: cuponData.value,
        min_amount: cuponData.min_amount,
        max_uses: cuponData.max_uses,
        expires_at: cuponData.expires_at,
        active: cuponData.active,
        uses_count: 0
      }
    ])
    .select()
    .single();

  if (error) {
    console.error("Error creando cupón:", error);
    return { error: error.message };
  }

  revalidatePath('/admin/cupones');
  return { success: true, data };
}

export async function updateCupon(id: string, cuponData: any) {
  const tenantId = await getCurrentTenant();
  if (!tenantId) return { error: "No autorizado" };

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('coupons')
    .update({
      code: cuponData.code,
      type: cuponData.type,
      value: cuponData.value,
      min_amount: cuponData.min_amount,
      max_uses: cuponData.max_uses,
      expires_at: cuponData.expires_at,
      active: cuponData.active
    })
    .eq('id', id)
    .eq('tenant_id', tenantId)
    .select()
    .single();

  if (error) {
    console.error("Error actualizando cupón:", error);
    return { error: error.message };
  }

  revalidatePath('/admin/cupones');
  return { success: true, data };
}

export async function toggleCuponStatus(id: string, isActive: boolean) {
  const tenantId = await getCurrentTenant();
  if (!tenantId) return { error: "No autorizado" };

  const supabase = await createClient();

  const { error } = await supabase
    .from('coupons')
    .update({ active: isActive })
    .eq('id', id)
    .eq('tenant_id', tenantId);

  if (error) return { error: error.message };
  
  revalidatePath('/admin/cupones');
  return { success: true };
}

export async function deleteCupon(id: string) {
  const tenantId = await getCurrentTenant();
  if (!tenantId) return { error: "No autorizado" };

  const supabase = await createClient();

  const { error } = await supabase
    .from('coupons')
    .delete()
    .eq('id', id)
    .eq('tenant_id', tenantId);

  if (error) {
    console.error("Error eliminando cupón:", error);
    return { error: error.message };
  }

  revalidatePath('/cupones');
  return { success: true };
}
