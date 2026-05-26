"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Upload, X, Loader2, ImagePlus } from "lucide-react";
import { actualizarProducto } from "@/actions/empresa/productos";
import { useRouter } from "next/navigation";
import imageCompression from "browser-image-compression";
import { CustomNumberInput } from "@/components/empresa/CustomNumberInput";
import { AttributeSelector } from "@/components/esencial/AttributeSelector";

interface ProductEditFormProps {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    category_id?: string | null;
    stock?: number | null;
    is_sale?: boolean;
    sale_price?: number | null;
    product_images: { id: string; url: string; position: number }[];
    attributes?: { id: string; name: string; values: { id: string; value: string }[] }[];
  };
  categories: any[];
}

export function ProductEditForm({ product, categories }: ProductEditFormProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSale, setIsSale] = useState(product.is_sale || false);

  interface DisplayImage {
    id: string;
    isExisting: boolean;
    url: string;
    dbId?: string;
    file?: File;
  }

  const [images, setImages] = useState<DisplayImage[]>(() => {
    const sorted = [...(product.product_images || [])].sort((a, b) => (a.position || 0) - (b.position || 0));
    return sorted.map(img => ({
      id: img.id,
      isExisting: true,
      url: img.url,
      dbId: img.id,
    }));
  });
  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsCompressing(true);
      const addedFiles = Array.from(e.target.files);
      const compressedFiles: File[] = [];

      const options = {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1200,
        useWebWorker: true,
      };

      for (const file of addedFiles) {
        try {
          const compressedBlob = await imageCompression(file, options);
          const compressedFile = new File([compressedBlob], file.name, {
            type: compressedBlob.type,
            lastModified: Date.now(),
          });
          compressedFiles.push(compressedFile);
        } catch (err) {
          console.error("Error al comprimir la imagen:", err);
          compressedFiles.push(file);
        }
      }

      setImages(prev => [
        ...prev,
        ...compressedFiles.map((file, i) => ({
          id: `new-${Date.now()}-${i}`,
          isExisting: false,
          url: URL.createObjectURL(file),
          file,
        }))
      ]);

      setIsCompressing(false);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    const img = images[index];
    if (img.isExisting && img.dbId) {
      setDeletedImageIds(prev => [...prev, img.dbId!]);
    } else if (!img.isExisting) {
      URL.revokeObjectURL(img.url);
    }
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    const imgData = images[index];
    const newSize = 120;
    
    // Crear una imagen limpia para evitar bugs visuales del navegador al clonar elementos complejos
    const dragImg = document.createElement("img");
    dragImg.src = imgData.url;
    dragImg.id = "drag-ghost-clone";
    dragImg.style.width = `${newSize}px`;
    dragImg.style.height = `${newSize}px`;
    dragImg.style.objectFit = "cover";
    dragImg.style.borderRadius = "16px";
    dragImg.style.border = "4px solid #ffffff";
    dragImg.style.position = "absolute";
    dragImg.style.top = "-9999px";
    dragImg.style.left = "-9999px";
    dragImg.style.zIndex = "9999";
    dragImg.style.backgroundColor = "#000000";
    
    document.body.appendChild(dragImg);
    e.dataTransfer.setDragImage(dragImg, newSize / 2, newSize / 2);
    e.dataTransfer.effectAllowed = "move";

    setTimeout(() => setDraggedIndex(index), 0);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    const newImages = [...images];
    const draggedImg = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, draggedImg);
    
    setDraggedIndex(index);
    setImages(newImages);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    const clone = document.getElementById("drag-ghost-clone");
    if (clone) clone.remove();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.delete("images");

    let newFileCount = 0;
    const imageOrder = images.map((img, index) => {
      if (img.isExisting) {
        return { type: 'existing', id: img.dbId, position: index + 1 };
      } else {
        const orderInfo = { type: 'new', fileIndex: newFileCount, position: index + 1 };
        newFileCount++;
        return orderInfo;
      }
    });

    images.forEach(img => {
      if (!img.isExisting && img.file) {
        formData.append("images", img.file);
      }
    });

    formData.append("deletedImages", JSON.stringify(deletedImageIds));
    formData.append("imageOrder", JSON.stringify(imageOrder));

    const res = await actualizarProducto(product.id, formData);

    if (res?.error) {
      setError(res.error);
      setIsPending(false);
    } else {
      router.push("/admin/productos");
    }
  };

  return (
    <div className="glass-panel p-6 md:p-8">
      <form onSubmit={handleSubmit} className="space-y-6">

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-foreground">Nombre del Producto</label>
            <input
              id="name"
              name="name"
              type="text"
              required
              defaultValue={product.name}
              placeholder="Ej. Remera Oversize Negra"
              className="glass-input px-4 py-3"
              disabled={isPending}
              suppressHydrationWarning
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="category_id" className="text-sm font-medium text-foreground">Categoría</label>
            <select
              id="category_id"
              name="category_id"
              defaultValue={product.category_id || ""}
              className="glass-input px-4 py-3 appearance-none bg-slate-900/50 cursor-pointer"
              disabled={isPending}
            >
              <option value="">Sin categoría</option>
              {categories.map((cat: any) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="price" className="text-sm font-medium text-foreground">Precio (ARS) *</label>
            <CustomNumberInput
              id="price"
              name="price"
              required
              min={1}
              defaultValue={product.price || ""}
              placeholder="15000"
              disabled={isPending}
              prefix="$"
            />
            <p className="text-xs text-slate-500">El precio que verá tu cliente. El cobro se hace por MercadoPago.</p>
          </div>

          <div className="space-y-2 flex flex-col justify-center">
            <label className="text-sm font-medium text-foreground">En oferta</label>
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  name="is_sale"
                  checked={isSale}
                  onChange={(e) => setIsSale(e.target.checked)}
                  className="sr-only peer"
                  disabled={isPending}
                  suppressHydrationWarning
                />
                <div className="w-11 h-6 bg-red-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </div>
            </label>
            <p className="text-xs text-slate-500">Si está activo, mostrará un distintivo en la tienda.</p>
          </div>
        </div>

        {isSale && (
          <div className="space-y-2">
            <label htmlFor="sale_price" className="text-sm font-medium text-emerald-400">Precio de Oferta (ARS) *</label>
            <CustomNumberInput
              id="sale_price"
              name="sale_price"
              required={isSale}
              min={1}
              defaultValue={product.sale_price || ""}
              placeholder="12000"
              disabled={isPending}
              prefix="$"
              suppressHydrationWarning
            />
            <p className="text-xs text-slate-500">El precio final que pagará el cliente. El precio original aparecerá tachado.</p>
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="stock" className="text-sm font-medium text-foreground">Stock *</label>
          <CustomNumberInput
            id="stock"
            name="stock"
            min={0}
            required
            defaultValue={product.stock ?? ""}
            placeholder="Ej. 10"
            disabled={isPending}
          />
          <p className="text-xs text-slate-500">Indicá cuántas unidades tenés disponibles.</p>
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium text-foreground">Descripción</label>
          <textarea
            id="description"
            name="description"
            rows={4}
            defaultValue={product.description || ""}
            placeholder="Describí tu producto, materiales, talles disponibles, etc..."
            className="glass-input px-4 py-3 resize-none"
            disabled={isPending}
            suppressHydrationWarning
          />
        </div>

        <AttributeSelector
          initialAttributes={product.attributes ?? []}
          disabled={isPending}
        />

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Fotos</label>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((img, i) => (
              <div
                key={img.id}
                draggable
                onDragStart={(e) => handleDragStart(e, i)}
                onDragOver={(e) => handleDragOver(e, i)}
                onDragEnd={handleDragEnd}
                className={`relative aspect-square rounded-2xl overflow-hidden group border cursor-grab active:cursor-grabbing hover:scale-[1.02] transition-all duration-300 ease-out shadow-sm hover:shadow-md ${draggedIndex === i ? 'opacity-20 scale-95 border-2 border-dashed border-white/30 bg-black/50' : 'opacity-100 border-white/[0.07] bg-black/20'}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={`Imagen ${i}`} className="object-cover w-full h-full pointer-events-none" />
                <div className={`absolute top-2 right-2 px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider shadow-lg ${img.isExisting ? 'bg-black/60 backdrop-blur-md text-white' : 'bg-primary text-primary-foreground'}`}>
                  {img.isExisting ? 'Guardada' : 'Nueva'}
                </div>
                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider text-white shadow-lg">
                  {i + 1}
                </div>
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="p-2 bg-red-500/80 text-white rounded-full hover:bg-red-600 hover:scale-110 transition-all"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}

            <label className={`aspect-square border-2 border-dashed border-white/[0.07] bg-background/30 rounded-2xl flex flex-col items-center justify-center text-center transition-all duration-300 relative overflow-hidden group ${isCompressing ? 'opacity-50 cursor-wait' : 'hover:bg-white/[0.02] hover:border-primary/30 cursor-pointer'}`}>
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              {isCompressing ? (
                <>
                  <Loader2 className="h-6 w-6 text-primary animate-spin mb-2" />
                  <p className="text-xs text-primary font-medium">Optimizando...</p>
                </>
              ) : images.length === 0 ? (
                <>
                  <Upload className="h-6 w-6 text-slate-500 mb-2 group-hover:text-primary group-hover:-translate-y-1 transition-all duration-300" />
                  <p className="text-xs text-foreground font-medium group-hover:text-primary transition-colors">Subir fotos</p>
                </>
              ) : (
                <>
                  <ImagePlus className="h-6 w-6 text-slate-500 mb-2 group-hover:text-primary transition-all duration-300" />
                  <p className="text-xs text-slate-500 font-medium">Añadir foto</p>
                </>
              )}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                disabled={isPending || isCompressing}
                suppressHydrationWarning
              />
            </label>
          </div>
          <p className="text-xs text-slate-500 mt-2">Puedes añadir más imágenes. PNG, JPG o WEBP se optimizan automáticamente.</p>
        </div>

        <div className="pt-6 mt-8 border-t border-white/[0.05] flex justify-end gap-4 relative z-10">
          <Link
            href="/admin/productos"
            className="px-6 py-3 rounded-lg font-medium text-slate-400 hover:text-foreground hover:bg-white/5 transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={isPending || isCompressing}
            className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-white/10"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {isPending ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>

      </form>
    </div>
  );
}
