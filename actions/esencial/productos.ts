"use server";

import { createClient } from "@/utils/supabase/server";
import { getCurrentTenant } from "@/utils/auth";
import { revalidatePath } from "next/cache";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/gu, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function getProductos() {
  const tenantId = await getCurrentTenant();
  
  if (!tenantId) {
    return { error: "No autorizado" };
  }

  const supabase = await createClient();
  
  const { data: productos, error } = await supabase
    .from('products')
    .select(`
      id,
      name,
      description,
      price,
      sale_price,
      active,
      is_sale,
      product_images!fk_images_product ( url ),
      product_variants!fk_variants_product ( stock )
    `)
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error obteniendo productos:", error);
    return { error: "Error al cargar los productos." };
  }

  // Acomodamos la data para la vista
  const formattedProducts = productos.map(p => {
    // Sumamos el stock de todas las variantes
    const totalStock = p.product_variants && p.product_variants.length > 0 
      ? p.product_variants.reduce((acc: number, curr: any) => acc + (curr.stock || 0), 0)
      : null;

    return {
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      sale_price: p.sale_price,
      active: p.active,
      is_sale: p.is_sale || false,
      stock: totalStock,
      image: p.product_images && p.product_images.length > 0 ? p.product_images[0].url : null
    };
  });

  return { success: true, data: formattedProducts };
}

export async function crearProducto(formData: FormData) {
  const tenantId = await getCurrentTenant();
  
  if (!tenantId) {
    return { error: "No autorizado" };
  }

  const supabase = await createClient();
  
  // Validar límite de 50 productos
  const { count, error: countError } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantId);
    
  if (countError || (count !== null && count >= 50)) {
    return { error: "Alcanzaste el límite de 50 productos de tu plan." };
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const price = formData.get("price") ? parseFloat(formData.get("price") as string) : 0;
  const sale_price = formData.get("sale_price") ? parseFloat(formData.get("sale_price") as string) : null;
  const stock = formData.get("stock") ? parseInt(formData.get("stock") as string) : null;
  const is_sale = formData.get("is_sale") === "true" || formData.get("is_sale") === "on";
  const imageFiles = formData.getAll("images") as File[];

  if (!name) {
    return { error: "El nombre es obligatorio." };
  }

  if (stock === null) {
    return { error: "El stock es obligatorio." };
  }

  // Generar slug único a partir del nombre
  const baseSlug = generateSlug(name);
  const uniqueSlug = baseSlug || crypto.randomUUID();

  // 1. Insertar el producto primero
  const { data: productData, error: productError } = await supabase
    .from('products')
    .insert({
      tenant_id: tenantId,
      name,
      slug: uniqueSlug,
      description,
      price,
      sale_price,
      is_sale,
      active: true
    })
    .select()
    .single();

  if (productError) {
    console.error("Error creando producto:", productError);
    return { error: "Error al guardar el producto." };
  }

  // 1.5 Crear una variante por defecto para el stock
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

  // 2. Si hay imágenes, las procesamos
  if (imageFiles && imageFiles.length > 0) {
    let position = 0;
    for (const imageFile of imageFiles) {
      if (imageFile.size === 0) continue;

      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${tenantId}/${fileName}`;

      // Subir al bucket 'objects'
      const { error: uploadError } = await supabase.storage
        .from('objects')
        .upload(filePath, imageFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error("Error subiendo imagen:", uploadError);
        continue;
      }

      // Obtener la URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('objects')
        .getPublicUrl(filePath);

      // Insertar la relación en product_images
      const { error: imageError } = await supabase
        .from('product_images')
        .insert({
          tenant_id: tenantId,
          product_id: productData.id,
          url: publicUrl,
          position: position
        });

      if (imageError) {
        console.error("Error guardando referencia de imagen:", imageError);
      } else {
        position++;
      }
    }
  }

  // Revalidar las rutas del frontend
  revalidatePath("/productos");
  revalidatePath("/");
  
  return { success: true, data: productData };
}

export async function eliminarProducto(productId: string) {
  const tenantId = await getCurrentTenant();
  
  if (!tenantId) {
    return { error: "No autorizado" };
  }

  const supabase = await createClient();

  // 1. Obtener las imágenes asociadas al producto
  const { data: images } = await supabase
    .from('product_images')
    .select('url')
    .eq('product_id', productId)
    .eq('tenant_id', tenantId);

  // 2. Extraer los paths y eliminarlas del Storage
  if (images && images.length > 0) {
    const filePaths = images.map(img => {
      // Las URLs públicas de Supabase terminan en /storage/v1/object/public/objects/TENANT_ID/ARCHIVO.ext
      const urlParts = img.url.split('/objects/');
      if (urlParts.length > 1) {
        return urlParts[1]; // Esto nos da "TENANT_ID/ARCHIVO.ext", que es exactamente el filePath a borrar
      }
      return null;
    }).filter(Boolean) as string[];

    if (filePaths.length > 0) {
      const { error: storageError } = await supabase.storage
        .from('objects')
        .remove(filePaths);
        
      if (storageError) {
        console.error("Error borrando imágenes del storage:", storageError);
        // Continuamos igual para asegurarnos de que el producto se borre
      }
    }
  }

  // 3. Eliminar referencias de imágenes explícitamente (por si no hay ON DELETE CASCADE)
  await supabase
    .from('product_images')
    .delete()
    .eq('product_id', productId)
    .eq('tenant_id', tenantId);

  // 4. Eliminar el producto de la base de datos
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId)
    .eq('tenant_id', tenantId); // Seguridad adicional

  if (error) {
    console.error("Error eliminando producto:", error);
    return { error: "Error al eliminar el producto." };
  }

  revalidatePath("/productos");
  revalidatePath("/");
  
  return { success: true };
}

export async function toggleProductoActivo(productId: string, active: boolean) {
  const tenantId = await getCurrentTenant();
  
  if (!tenantId) {
    return { error: "No autorizado" };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from('products')
    .update({ active })
    .eq('id', productId)
    .eq('tenant_id', tenantId);

  if (error) {
    console.error("Error actualizando producto:", error);
    return { error: "Error al actualizar el estado del producto." };
  }

  revalidatePath("/productos");
  revalidatePath("/");
  
  return { success: true };
}

export async function getProductoById(productId: string) {
  const tenantId = await getCurrentTenant();
  
  if (!tenantId) {
    return { error: "No autorizado" };
  }

  const supabase = await createClient();
  
  const { data: producto, error } = await supabase
    .from('products')
    .select(`
      id,
      name,
      description,
      price,
      sale_price,
      active,
      is_sale,
      product_images!fk_images_product ( id, url, position ),
      product_variants!fk_variants_product ( id, stock, name )
    `)
    .eq('id', productId)
    .eq('tenant_id', tenantId)
    .single();

  if (error) {
    console.error("Error obteniendo producto:", error);
    return { error: "Error al cargar el producto." };
  }

  // Mapeamos para que la UI de edición simple encuentre el stock
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
  
  if (!tenantId) {
    return { error: "No autorizado" };
  }

  const supabase = await createClient();

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const price = formData.get("price") ? parseFloat(formData.get("price") as string) : 0;
  const sale_price = formData.get("sale_price") ? parseFloat(formData.get("sale_price") as string) : null;
  const stock = formData.get("stock") ? parseInt(formData.get("stock") as string) : null;
  const is_sale = formData.get("is_sale") === "true" || formData.get("is_sale") === "on";
  const imageFiles = formData.getAll("images") as File[];

  if (!name) {
    return { error: "El nombre es obligatorio." };
  }

  if (stock === null) {
    return { error: "El stock es obligatorio." };
  }

  // Regenerar slug al actualizar nombre
  const baseSlug = generateSlug(name);
  const updatedSlug = baseSlug || productId;

  // 1. Actualizar datos básicos
  const { error: updateError } = await supabase
    .from('products')
    .update({
      name,
      slug: updatedSlug,
      description,
      price,
      sale_price,
      is_sale
    })
    .eq('id', productId)
    .eq('tenant_id', tenantId);

  if (updateError) {
    console.error("Error actualizando producto:", updateError);
    return { error: "Error al guardar el producto." };
  }

  // 1.5 Actualizar stock en la variante principal
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
    // Si no existía variante, la creamos
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

  // 2. Si hay nuevas imágenes, agregarlas
  if (imageFiles && imageFiles.length > 0) {
    // Buscar la posición máxima actual
    const { data: existingImages } = await supabase
      .from('product_images')
      .select('position')
      .eq('product_id', productId)
      .order('position', { ascending: false })
      .limit(1);
      
    let position = existingImages && existingImages.length > 0 ? existingImages[0].position + 1 : 0;

    for (const imageFile of imageFiles) {
      if (imageFile.size === 0) continue;

      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${tenantId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('objects')
        .upload(filePath, imageFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error("Error subiendo nueva imagen:", uploadError);
        continue;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('objects')
        .getPublicUrl(filePath);

      const { error: imageError } = await supabase
        .from('product_images')
        .insert({
          tenant_id: tenantId,
          product_id: productId,
          url: publicUrl,
          position: position
        });

      if (imageError) {
        console.error("Error guardando referencia de imagen:", imageError);
      } else {
        position++;
      }
    }
  }

  revalidatePath("/productos");
  revalidatePath("/");
  
  return { success: true };
}
