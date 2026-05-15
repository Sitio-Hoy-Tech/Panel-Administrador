"use server";

import { createClient } from "@/utils/supabase/server";
import { getCurrentTenant } from "@/utils/auth";
import { revalidatePath } from "next/cache";

export async function getCategorias() {
  const tenantId = await getCurrentTenant();
  if (!tenantId) return { error: "No autorizado" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('position', { ascending: true });

  if (error) return { error: "Error al cargar categorías." };
  return { success: true, data };
}

export async function crearCategoria(formData: FormData) {
  const tenantId = await getCurrentTenant();
  if (!tenantId) return { error: "No autorizado" };

  const name = formData.get("name") as string;
  if (!name) return { error: "El nombre es obligatorio." };

  const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

  const supabase = await createClient();
  const { error } = await supabase
    .from('categories')
    .insert({
      tenant_id: tenantId,
      name,
      slug,
      active: true
    });

  if (error) return { error: "Error al crear la categoría." };

  revalidatePath("/admin/categorias");
  revalidatePath("/admin/productos");
  return { success: true };
}

export async function actualizarCategoria(id: string, formData: FormData) {
  const tenantId = await getCurrentTenant();
  if (!tenantId) return { error: "No autorizado" };

  const name = formData.get("name") as string;
  const active = formData.get("active") === "true";

  if (!name) return { error: "El nombre es obligatorio." };

  const supabase = await createClient();
  const { error } = await supabase
    .from('categories')
    .update({ name, active })
    .eq('id', id)
    .eq('tenant_id', tenantId);

  if (error) return { error: "Error al actualizar la categoría." };

  revalidatePath("/admin/categorias");
  revalidatePath("/admin/productos");
  return { success: true };
}

export async function eliminarCategoria(id: string) {
  const tenantId = await getCurrentTenant();
  if (!tenantId) return { error: "No autorizado" };

  const supabase = await createClient();
  
  // Opcional: Podríamos verificar si hay productos usando esta categoría
  // Pero por ahora solo borramos la categoría
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)
    .eq('tenant_id', tenantId);

  if (error) return { error: "Error al eliminar la categoría." };

  revalidatePath("/admin/categorias");
  revalidatePath("/admin/productos");
  return { success: true };
}
