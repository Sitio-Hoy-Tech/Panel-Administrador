"use server";

import { createClient } from "@/utils/supabase/server";
import { getCurrentTenant } from "@/utils/auth";
import { revalidatePath, revalidateTag } from "next/cache";
import { revalidateStorefront } from "@/utils/revalidate-storefront";
import { getCategoriasCached, TAGS } from "@/utils/cached-queries";

export async function getCategorias() {
  const tenantId = await getCurrentTenant();
  if (!tenantId) return { error: "No autorizado" };

  const data = await getCategoriasCached(tenantId);
  if (!data) return { error: "Error al cargar categorías." };
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

  revalidateTag(TAGS.categorias(tenantId), 'max');
  revalidateTag(TAGS.productos(tenantId), 'max');
  revalidatePath("/admin/categorias");
  revalidatePath("/admin/productos");
  await revalidateStorefront(tenantId, "categories");
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

  revalidateTag(TAGS.categorias(tenantId), 'max');
  revalidateTag(TAGS.productos(tenantId), 'max');
  revalidatePath("/admin/categorias");
  revalidatePath("/admin/productos");
  await revalidateStorefront(tenantId, "categories");
  return { success: true };
}

export async function eliminarCategoria(id: string) {
  const tenantId = await getCurrentTenant();
  if (!tenantId) return { error: "No autorizado" };

  const supabase = await createClient();
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)
    .eq('tenant_id', tenantId);

  if (error) return { error: "Error al eliminar la categoría." };

  revalidateTag(TAGS.categorias(tenantId), 'max');
  revalidateTag(TAGS.productos(tenantId), 'max');
  revalidatePath("/admin/categorias");
  revalidatePath("/admin/productos");
  await revalidateStorefront(tenantId, "categories");
  return { success: true };
}

function buildSubcategorySlug(base: string) {
  return base.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
}

export async function crearSubcategoria(categoryId: string, formData: FormData) {
  const tenantId = await getCurrentTenant();
  if (!tenantId) return { error: "No autorizado" };

  const name = formData.get("name") as string;
  if (!name) return { error: "El nombre es obligatorio." };

  const supabase = await createClient();

  // Obtener slug de la categoría padre para prefijar y evitar colisiones
  const { data: parent } = await supabase
    .from('categories')
    .select('slug')
    .eq('id', categoryId)
    .eq('tenant_id', tenantId)
    .single();

  const baseSlug = buildSubcategorySlug(name);
  const prefixed = parent ? `${parent.slug}-${baseSlug}` : baseSlug;

  let slug = prefixed;
  let attempt = 1;
  let insertError: any = null;

  while (attempt <= 10) {
    const { error } = await supabase
      .from('subcategories')
      .insert({ tenant_id: tenantId, category_id: categoryId, name, slug, active: true });

    if (!error) {
      revalidateTag(TAGS.categorias(tenantId), 'max');
      revalidateTag(TAGS.productos(tenantId), 'max');
      revalidatePath("/admin/categorias");
      revalidatePath("/admin/productos");
      await revalidateStorefront(tenantId, "categories");
      return { success: true };
    }

    if (error.code === '23505') {
      attempt++;
      slug = `${prefixed}-${attempt}`;
      insertError = error;
    } else {
      return { error: "Error al crear la subcategoría." };
    }
  }

  return { error: "No se pudo generar un slug único para la subcategoría." };
}

export async function actualizarSubcategoria(id: string, formData: FormData) {
  const tenantId = await getCurrentTenant();
  if (!tenantId) return { error: "No autorizado" };

  const name = formData.get("name") as string;
  const active = formData.get("active") === "true";

  if (!name) return { error: "El nombre es obligatorio." };

  const supabase = await createClient();
  const { error } = await supabase
    .from('subcategories')
    .update({ name, active })
    .eq('id', id)
    .eq('tenant_id', tenantId);

  if (error) return { error: "Error al actualizar la subcategoría." };

  revalidateTag(TAGS.categorias(tenantId), 'max');
  revalidateTag(TAGS.productos(tenantId), 'max');
  revalidatePath("/admin/categorias");
  revalidatePath("/admin/productos");
  await revalidateStorefront(tenantId, "categories");
  return { success: true };
}

export async function eliminarSubcategoria(id: string) {
  const tenantId = await getCurrentTenant();
  if (!tenantId) return { error: "No autorizado" };

  const supabase = await createClient();
  const { error } = await supabase
    .from('subcategories')
    .delete()
    .eq('id', id)
    .eq('tenant_id', tenantId);

  if (error) return { error: "Error al eliminar la subcategoría." };

  revalidateTag(TAGS.categorias(tenantId), 'max');
  revalidateTag(TAGS.productos(tenantId), 'max');
  revalidatePath("/admin/categorias");
  revalidatePath("/admin/productos");
  await revalidateStorefront(tenantId, "categories");
  return { success: true };
}
