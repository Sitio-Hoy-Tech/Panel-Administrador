"use server";

import { createClient } from "@/utils/supabase/server";
import { getCurrentTenant } from "@/utils/auth";
import { revalidatePath, revalidateTag } from "next/cache";
import { revalidateStorefront } from "@/utils/revalidate-storefront";
import { getProductosCached, TAGS } from "@/utils/cached-queries";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/gu, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function getProductos() {
  const tenantId = await getCurrentTenant();
  if (!tenantId) return { error: "No autorizado" };

  const data = await getProductosCached(tenantId);
  if (!data) return { error: "Error al cargar los productos." };
  return { success: true, data };
}

export async function crearProducto(formData: FormData) {
  const tenantId = await getCurrentTenant();

  if (!tenantId) {
    return { error: "No autorizado" };
  }

  const supabase = await createClient();

  const { count, error: countError } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantId);

  if (countError || (count !== null && count >= 200)) {
    return { error: "Alcanzaste el límite de 200 productos de tu plan." };
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const category_id = formData.get("category_id") as string || null;
  const price = formData.get("price") ? parseFloat(formData.get("price") as string) : 0;
  const sale_price = formData.get("sale_price") ? parseFloat(formData.get("sale_price") as string) : null;
  const stock = formData.get("stock") ? parseInt(formData.get("stock") as string) : null;
  const is_sale = formData.get("is_sale") === "true" || formData.get("is_sale") === "on";
  const imageFiles = formData.getAll("images") as File[];

  if (!name) {
    return { error: "El nombre es obligatorio." };
  }

  if (!price || price <= 0) {
    return { error: "El precio es obligatorio y debe ser mayor a 0." };
  }

  const baseSlug = generateSlug(name);
  const uniqueSlug = baseSlug || crypto.randomUUID();

  const { data: maxPosData } = await supabase
    .from('products')
    .select('position')
    .eq('tenant_id', tenantId)
    .order('position', { ascending: false })
    .limit(1);

  const position = maxPosData && maxPosData.length > 0 ? (maxPosData[0].position || 0) + 1 : 1;

  const { data: productData, error: productError } = await supabase
    .from('products')
    .insert({
      tenant_id: tenantId,
      name,
      slug: uniqueSlug,
      description,
      category_id,
      price,
      sale_price,
      active: true,
      is_sale,
      position
    })
    .select()
    .single();

  if (productError) {
    console.error("Error creando producto:", productError);
    return { error: "Error al guardar el producto." };
  }

  const { error: variantError } = await supabase
    .from('product_variants')
    .insert({
      tenant_id: tenantId,
      product_id: productData.id,
      name: "Única",
      stock: stock || 0,
      price: price
    });

  if (variantError) {
    console.error("Error creando variante:", variantError);
  }

  if (imageFiles && imageFiles.length > 0) {
    let position = 0;
    for (const imageFile of imageFiles) {
      if (imageFile.size === 0) continue;

      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${tenantId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('objects')
        .upload(filePath, imageFile);

      if (uploadError) continue;

      const { data: { publicUrl } } = supabase.storage
        .from('objects')
        .getPublicUrl(filePath);

      await supabase
        .from('product_images')
        .insert({
          tenant_id: tenantId,
          product_id: productData.id,
          url: publicUrl,
          position: position
        });
      position++;
    }
  }

  revalidateTag(TAGS.productos(tenantId), 'max');
  revalidatePath("/admin/productos");
  revalidatePath("/admin");
  await revalidateStorefront(tenantId, "products");

  return { success: true, data: productData };
}

export async function eliminarProducto(productId: string) {
  const tenantId = await getCurrentTenant();
  if (!tenantId) return { error: "No autorizado" };

  const supabase = await createClient();

  await supabase.from('product_variants').delete().eq('product_id', productId).eq('tenant_id', tenantId);

  const { data: images } = await supabase
    .from('product_images')
    .select('url')
    .eq('product_id', productId)
    .eq('tenant_id', tenantId);

  if (images && images.length > 0) {
    const filePaths = images.map(img => img.url.split('/objects/')[1]).filter(Boolean);
    if (filePaths.length > 0) {
      await supabase.storage.from('objects').remove(filePaths);
    }
  }

  await supabase.from('product_images').delete().eq('product_id', productId).eq('tenant_id', tenantId);

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId)
    .eq('tenant_id', tenantId);

  if (error) return { error: "Error al eliminar el producto." };

  revalidateTag(TAGS.productos(tenantId), 'max');
  revalidatePath("/admin/productos");
  revalidatePath("/admin");
  await revalidateStorefront(tenantId, "products");
  return { success: true };
}

export async function toggleProductoActivo(productId: string, active: boolean) {
  const tenantId = await getCurrentTenant();
  if (!tenantId) return { error: "No autorizado" };

  const supabase = await createClient();
  const { error } = await supabase
    .from('products')
    .update({ active })
    .eq('id', productId)
    .eq('tenant_id', tenantId);

  if (error) return { error: "Error al actualizar estado." };

  revalidateTag(TAGS.productos(tenantId), 'max');
  revalidatePath("/admin/productos");
  revalidatePath("/admin");
  await revalidateStorefront(tenantId, "products");
  return { success: true };
}

export async function getProductoById(productId: string) {
  const tenantId = await getCurrentTenant();
  if (!tenantId) return { error: "No autorizado" };

  const supabase = await createClient();

  const { data: producto, error } = await supabase
    .from('products')
    .select(`
      id,
      name,
      description,
      price,
      sale_price,
      category_id,
      active,
      is_sale,
      product_images!fk_images_product ( id, url, position ),
      product_variants!fk_variants_product ( id, stock, name )
    `)
    .eq('id', productId)
    .eq('tenant_id', tenantId)
    .single();

  if (error) return { error: "Error al cargar el producto." };

  const firstVariant = producto.product_variants && producto.product_variants.length > 0
    ? producto.product_variants[0]
    : null;

  return {
    success: true,
    data: {
      ...producto,
      stock: firstVariant?.stock || 0
    }
  };
}

export async function actualizarProducto(productId: string, formData: FormData) {
  const tenantId = await getCurrentTenant();
  if (!tenantId) return { error: "No autorizado" };

  const supabase = await createClient();

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const category_id = formData.get("category_id") as string || null;
  const price = formData.get("price") ? parseFloat(formData.get("price") as string) : 0;
  const sale_price = formData.get("sale_price") ? parseFloat(formData.get("sale_price") as string) : null;
  const stock = formData.get("stock") ? parseInt(formData.get("stock") as string) : null;
  const is_sale = formData.get("is_sale") === "true" || formData.get("is_sale") === "on";
  const imageFiles = formData.getAll("images") as File[];
  const deletedImagesStr = formData.get("deletedImages") as string;
  const imageOrderStr = formData.get("imageOrder") as string;

  if (!name || price <= 0) return { error: "Nombre y precio son obligatorios." };

  const baseSlug = generateSlug(name);
  const updatedSlug = baseSlug || productId;

  const { error: updateError } = await supabase
    .from('products')
    .update({ name, slug: updatedSlug, description, category_id, price, sale_price, is_sale })
    .eq('id', productId)
    .eq('tenant_id', tenantId);

  if (updateError) return { error: "Error al guardar." };

  const { data: variants } = await supabase
    .from('product_variants')
    .select('id')
    .eq('product_id', productId)
    .limit(1);

  if (variants && variants.length > 0) {
    await supabase
      .from('product_variants')
      .update({ stock: stock || 0, price: price })
      .eq('id', variants[0].id);
  } else {
    await supabase
      .from('product_variants')
      .insert({
        tenant_id: tenantId,
        product_id: productId,
        name: "Única",
        stock: stock || 0,
        price: price
      });
  }

  if (deletedImagesStr) {
    try {
      const deletedImageIds = JSON.parse(deletedImagesStr) as string[];
      if (deletedImageIds.length > 0) {
        const { data: imagesToDelete } = await supabase
          .from('product_images')
          .select('url')
          .in('id', deletedImageIds)
          .eq('tenant_id', tenantId);

        if (imagesToDelete && imagesToDelete.length > 0) {
          const filePaths = imagesToDelete.map(img => img.url.split('/objects/')[1]).filter(Boolean);
          if (filePaths.length > 0) {
            await supabase.storage.from('objects').remove(filePaths);
          }
        }

        await supabase
          .from('product_images')
          .delete()
          .in('id', deletedImageIds)
          .eq('tenant_id', tenantId);
      }
    } catch (e) {
      console.error("Error al eliminar imágenes:", e);
    }
  }

  let imageOrder: any[] = [];
  if (imageOrderStr) {
    try {
      imageOrder = JSON.parse(imageOrderStr);
    } catch (e) {
      console.error("Error parsing imageOrder", e);
    }
  }

  for (const item of imageOrder) {
    if (item.type === 'existing') {
      await supabase
        .from('product_images')
        .update({ position: item.position })
        .eq('id', item.id)
        .eq('tenant_id', tenantId);
    }
  }

  if (imageFiles && imageFiles.length > 0) {
    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      if (file.size === 0) continue;

      const orderInfo = imageOrder.find(o => o.type === 'new' && o.fileIndex === i);
      const position = orderInfo ? orderInfo.position : 999;

      const filePath = `${tenantId}/${crypto.randomUUID()}.${file.name.split('.').pop()}`;
      const { error: upErr } = await supabase.storage.from('objects').upload(filePath, file);
      if (upErr) continue;

      const { data: { publicUrl } } = supabase.storage.from('objects').getPublicUrl(filePath);
      await supabase.from('product_images').insert({
        tenant_id: tenantId,
        product_id: productId,
        url: publicUrl,
        position: position
      });
    }
  }

  revalidateTag(TAGS.productos(tenantId), 'max');
  revalidatePath("/admin/productos");
  revalidatePath("/admin");
  await revalidateStorefront(tenantId, "products");
  return { success: true };
}

export async function reordenarProductos(updates: { id: string; position: number }[]) {
  const tenantId = await getCurrentTenant();

  if (!tenantId) {
    return { error: "No autorizado" };
  }

  const supabase = await createClient();

  await Promise.all(
    updates.map(update =>
      supabase
        .from('products')
        .update({ position: update.position })
        .eq('id', update.id)
        .eq('tenant_id', tenantId)
    )
  );

  revalidatePath("/admin/productos");
  await revalidateStorefront(tenantId, "products");
  return { success: true };
}
