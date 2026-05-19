"use server";

import { createClient } from "./supabase/server";

export type RevalidateTable =
  | "products"
  | "product_images"
  | "product_variants"
  | "categories"
  | "coupons"
  | "tenants"
  | "shipping_zones";

export async function revalidateStorefront(tenantId: string, table: RevalidateTable) {
  const supabase = await createClient();

  const { data: tenant } = await supabase
    .from("tenants")
    .select("url, revalidation_secret")
    .eq("id", tenantId)
    .single();

  const storeUrl = tenant?.url || process.env.STORE_URL;
  const secret = tenant?.revalidation_secret || process.env.STORE_REVALIDATION_SECRET;

  if (!storeUrl || !secret) return;

  try {
    await fetch(`${storeUrl}/api/revalidate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify({ table }),
    });
  } catch {
    // No bloquear la operación si el sitio público no está disponible
  }
}
