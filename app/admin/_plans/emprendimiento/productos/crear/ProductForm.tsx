"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Upload, X, Loader2, ImagePlus } from "lucide-react";
import { crearProducto } from "@/actions/emprendimiento/productos";
import { useRouter } from "next/navigation";
import imageCompression from "browser-image-compression";
import { CustomNumberInput } from "@/components/emprendimiento/CustomNumberInput";
import { AttributeSelector } from "@/components/esencial/AttributeSelector";
import { FormSelect } from "@/components/shared/FormSelect";

export function ProductForm({ categories }: { categories: any[] }) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [isSale, setIsSale] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsCompressing(true);
      const newFiles = Array.from(e.target.files);
      const compressedFiles: File[] = [];

      const options = {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1200,
        useWebWorker: true,
      };

      for (const file of newFiles) {
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

      setImages(prev => [...prev, ...compressedFiles]);
      
      const newUrls = compressedFiles.map(file => URL.createObjectURL(file));
      setPreviewUrls(prev => [...prev, ...newUrls]);
      setIsCompressing(false);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => {
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
    
    images.forEach(img => {
      formData.append("images", img);
    });

    const res = await crearProducto(formData);
    
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
              placeholder="Ej. Remera Oversize Negra" 
              className="glass-input px-4 py-3"
              disabled={isPending}
              suppressHydrationWarning
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="category_id" className="text-sm font-medium text-foreground">Categoría</label>
            <FormSelect
              name="category_id"
              options={categories.map((cat: any) => ({ value: cat.id, label: cat.name }))}
              placeholder="Sin categoría"
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="price" className="text-sm font-medium text-foreground">Precio (ARS) *</label>
            <CustomNumberInput 
              id="price"
              name="price"
              required
              min={1}
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
                  className="sr-only peer"
                  disabled={isPending}
                  checked={isSale}
                  onChange={(e) => setIsSale(e.target.checked)}
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
              placeholder="12000" 
              disabled={isPending}
              prefix="$"
            />
            <p className="text-xs text-slate-500">El precio final que pagará el cliente. El precio original aparecerá tachado.</p>
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="stock" className="text-sm font-medium text-foreground">Stock (Opcional)</label>
          <CustomNumberInput 
            id="stock"
            name="stock"
            min={0}
            placeholder="Dejá vacío para stock ilimitado" 
            disabled={isPending}
          />
          <p className="text-xs text-slate-500">Si lo completás, se mostrará la disponibilidad en tu tienda.</p>
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium text-foreground">Descripción</label>
          <textarea 
            id="description"
            name="description"
            rows={4}
            placeholder="Describí tu producto, materiales, talles disponibles, etc..." 
            className="glass-input px-4 py-3 resize-none"
            disabled={isPending}
          />
        </div>

        <AttributeSelector disabled={isPending} />

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Fotos (Opcional)</label>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {previewUrls.map((url, i) => (
              <div key={i} className="relative aspect-square rounded-2xl overflow-hidden group border border-white/[0.07]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Preview ${i}`} className="object-cover w-full h-full" />
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
              ) : previewUrls.length === 0 ? (
                <>
                  <Upload className="h-6 w-6 text-slate-500 mb-2 group-hover:text-primary group-hover:-translate-y-1 transition-all duration-300" />
                  <p className="text-xs text-foreground font-medium group-hover:text-primary transition-colors">Subir fotos</p>
                </>
              ) : (
                <>
                  <ImagePlus className="h-6 w-6 text-slate-500 mb-2 group-hover:text-primary transition-all duration-300" />
                  <p className="text-xs text-slate-500 font-medium">Añadir más</p>
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
                />
            </label>
          </div>
          <p className="text-xs text-slate-500 mt-2">Podés subir varias imágenes. PNG, JPG o WEBP se optimizan automáticamente.</p>
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
            className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {isPending ? "Guardando..." : "Guardar Producto"}
          </button>
        </div>

      </form>
    </div>
  );
}
