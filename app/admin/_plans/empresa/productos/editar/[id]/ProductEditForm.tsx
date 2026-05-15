"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Upload, X, Loader2, ImagePlus } from "lucide-react";
import { actualizarProducto } from "@/actions/empresa/productos";
import { useRouter } from "next/navigation";
import imageCompression from "browser-image-compression";
import { CustomNumberInput } from "@/components/empresa/CustomNumberInput";

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
  };
  categories: any[];
}

export function ProductEditForm({ product, categories }: ProductEditFormProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSale, setIsSale] = useState(product.is_sale || false);

  const [existingImages] = useState(product.product_images || []);

  const [newImages, setNewImages] = useState<File[]>([]);
  const [newPreviewUrls, setNewPreviewUrls] = useState<string[]>([]);
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

      setNewImages(prev => [...prev, ...compressedFiles]);

      const addedUrls = compressedFiles.map(file => URL.createObjectURL(file));
      setNewPreviewUrls(prev => [...prev, ...addedUrls]);
      setIsCompressing(false);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
    setNewPreviewUrls(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.delete("images");

    newImages.forEach(img => {
      formData.append("images", img);
    });

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
              className="glass-input px-4 py-3 appearance-none bg-zinc-900/50 cursor-pointer"
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
            <p className="text-xs text-zinc-500">El precio que verá tu cliente. El cobro se hace por MercadoPago.</p>
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
            <p className="text-xs text-zinc-500">Si está activo, mostrará un distintivo en la tienda.</p>
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
            <p className="text-xs text-zinc-500">El precio final que pagará el cliente. El precio original aparecerá tachado.</p>
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
          <p className="text-xs text-zinc-500">Indicá cuántas unidades tenés disponibles.</p>
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

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Fotos</label>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Fotos existentes */}
            {existingImages.map((img) => (
              <div key={img.id} className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 opacity-70">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt="Producto guardado" className="object-cover w-full h-full" />
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider text-white">
                  Guardada
                </div>
              </div>
            ))}

            {/* Nuevas fotos subidas */}
            {newPreviewUrls.map((url, i) => (
              <div key={i} className="relative aspect-square rounded-2xl overflow-hidden group border border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Nueva ${i}`} className="object-cover w-full h-full" />
                <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider shadow-lg">
                  Nueva
                </div>
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => removeNewImage(i)}
                    className="p-2 bg-red-500/80 text-white rounded-full hover:bg-red-600 hover:scale-110 transition-all"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}

            <label className={`aspect-square border-2 border-dashed border-white/10 bg-background/30 rounded-2xl flex flex-col items-center justify-center text-center transition-all duration-300 relative overflow-hidden group ${isCompressing ? 'opacity-50 cursor-wait' : 'hover:bg-white/[0.02] hover:border-primary/30 cursor-pointer'}`}>
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              {isCompressing ? (
                <>
                  <Loader2 className="h-6 w-6 text-primary animate-spin mb-2" />
                  <p className="text-xs text-primary font-medium">Optimizando...</p>
                </>
              ) : existingImages.length === 0 && newPreviewUrls.length === 0 ? (
                <>
                  <Upload className="h-6 w-6 text-zinc-500 mb-2 group-hover:text-primary group-hover:-translate-y-1 transition-all duration-300" />
                  <p className="text-xs text-foreground font-medium group-hover:text-primary transition-colors">Subir fotos</p>
                </>
              ) : (
                <>
                  <ImagePlus className="h-6 w-6 text-zinc-500 mb-2 group-hover:text-primary transition-all duration-300" />
                  <p className="text-xs text-zinc-500 font-medium">Añadir foto</p>
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
          <p className="text-xs text-zinc-500 mt-2">Puedes añadir más imágenes. PNG, JPG o WEBP se optimizan automáticamente.</p>
        </div>

        <div className="pt-6 mt-8 border-t border-white/5 flex justify-end gap-4 relative z-10">
          <Link
            href="/admin/productos"
            className="px-6 py-3 rounded-lg font-medium text-zinc-400 hover:text-foreground hover:bg-white/5 transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={isPending || isCompressing}
            className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-white/10"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {isPending ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>

      </form>
    </div>
  );
}
