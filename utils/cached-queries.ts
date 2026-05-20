import { unstable_cache } from "next/cache";
import { createAdminClient } from "./supabase/server";

// Tags por recurso — usados tanto para invalidar como para identificar el caché
export const TAGS = {
  productos:  (id: string) => `t:${id}:productos`,
  categorias: (id: string) => `t:${id}:categorias`,
  ordenes:    (id: string) => `t:${id}:ordenes`,
  cupones:    (id: string) => `t:${id}:cupones`,
  zonasEnvio: (id: string) => `t:${id}:zonas-envio`,
};

// Los callbacks de unstable_cache NO pueden usar cookies(), por eso usamos
// createAdminClient() (service role) en lugar del cliente de sesión.
// La seguridad se mantiene porque tenantId fue validado antes de llegar acá.

export function getProductosCached(tenantId: string) {
  return unstable_cache(
    async () => {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from("products")
        .select(`
          id, name, description, price, sale_price, active, is_sale, position, category_id,
          product_images!fk_images_product ( url ),
          product_variants!fk_variants_product ( stock )
        `)
        .eq("tenant_id", tenantId)
        .order("position", { ascending: true });

      if (error) return null;

      return data.map((p: any) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        sale_price: p.sale_price,
        active: p.active,
        is_sale: p.is_sale || false,
        position: p.position,
        category_id: p.category_id ?? null,
        stock:
          p.product_variants?.length > 0
            ? p.product_variants.reduce((acc: number, v: any) => acc + (v.stock || 0), 0)
            : null,
        image: p.product_images?.[0]?.url ?? null,
      }));
    },
    [`productos:${tenantId}`],
    { tags: [TAGS.productos(tenantId)] }
  )();
}

export function getCategoriasCached(tenantId: string) {
  return unstable_cache(
    async () => {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("position", { ascending: true });

      if (error) return null;
      return data;
    },
    [`categorias:${tenantId}`],
    { tags: [TAGS.categorias(tenantId)] }
  )();
}

type OrdenesFiltros = { search?: string; status?: string; payment?: string };

export function getOrdenesCached(tenantId: string, filters: OrdenesFiltros = {}) {
  const filterKey = JSON.stringify(filters);
  return unstable_cache(
    async () => {
      const supabase = createAdminClient();
      let query = supabase
        .from("orders")
        .select("*")
        .eq("tenant_id", tenantId);

      if (filters.status && filters.status !== "all") {
        query = query.eq("status", filters.status);
      }
      if (filters.payment && filters.payment !== "all") {
        if (filters.payment === "paid") query = query.not("mp_payment_id", "is", null);
        else if (filters.payment === "pending") query = query.is("mp_payment_id", null);
      }
      if (filters.search) {
        const s = filters.search.toLowerCase();
        query = query.or(
          `customer_first_name.ilike.%${s}%,customer_last_name.ilike.%${s}%,payer_email.ilike.%${s}%,id.ilike.%${s}%`
        );
      }

      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) return null;
      return data;
    },
    [`ordenes:${tenantId}:${filterKey}`],
    // revalidate: 60 como fallback por si llegan órdenes desde fuera del panel
    { tags: [TAGS.ordenes(tenantId)], revalidate: 60 }
  )();
}

export function getCuponesCached(tenantId: string) {
  return unstable_cache(
    async () => {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("tenant_id", tenantId);

      if (error) return null;
      return data;
    },
    [`cupones:${tenantId}`],
    { tags: [TAGS.cupones(tenantId)] }
  )();
}

export function getZonasEnvioCached(tenantId: string) {
  return unstable_cache(
    async () => {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from("shipping_zones")
        .select("id, name, price")
        .eq("tenant_id", tenantId)
        .order("name", { ascending: true });

      if (error) return null;
      return data as { id: string; name: string; price: number }[];
    },
    [`zonas-envio:${tenantId}`],
    { tags: [TAGS.zonasEnvio(tenantId)] }
  )();
}
