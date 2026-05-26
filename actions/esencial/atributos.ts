"use server";

import { createAdminClient } from "@/utils/supabase/server";
import { getCurrentTenant } from "@/utils/auth";

export type ProductAttributeWithValues = {
  id: string;
  name: string;
  position: number;
  values: { id: string; value: string; position: number }[];
};

export async function getAtributosProducto(productId: string): Promise<ProductAttributeWithValues[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("product_attributes")
    .select("id, name, position, product_attribute_values(id, value, position)")
    .eq("product_id", productId)
    .order("position", { ascending: true });

  if (error || !data) return [];

  return data.map((a: any) => ({
    id: a.id,
    name: a.name,
    position: a.position,
    values: (a.product_attribute_values ?? []).sort((x: any, y: any) => x.position - y.position),
  }));
}

type SerializedValue = { id?: string; value: string };
type SerializedAttribute = { id?: string; name: string; values: SerializedValue[] };

/** Reemplaza todos los atributos de un producto con los enviados en el form. */
export async function syncAtributosProducto(productId: string, attributesJson: string) {
  const tenantId = await getCurrentTenant();
  if (!tenantId) return;

  let attrs: SerializedAttribute[] = [];
  try {
    attrs = JSON.parse(attributesJson);
  } catch {
    return;
  }

  const supabase = createAdminClient();

  // Borrar todo y reinsertar — atributos son puramente descriptivos, sin refs externas
  await supabase.from("product_attributes").delete().eq("product_id", productId).eq("tenant_id", tenantId);

  for (let i = 0; i < attrs.length; i++) {
    const attr = attrs[i];
    const name = attr.name.trim();
    if (!name) continue;

    const { data: inserted } = await supabase
      .from("product_attributes")
      .insert({ tenant_id: tenantId, product_id: productId, name, position: i })
      .select("id")
      .single();

    if (!inserted) continue;

    const validValues = attr.values
      .map((v, j) => ({ value: v.value.trim(), position: j }))
      .filter((v) => v.value.length > 0);

    if (validValues.length > 0) {
      await supabase.from("product_attribute_values").insert(
        validValues.map((v) => ({
          tenant_id: tenantId,
          product_attribute_id: inserted.id,
          value: v.value,
          position: v.position,
        }))
      );
    }
  }
}
