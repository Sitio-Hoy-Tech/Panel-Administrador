"use client";

import { useState, useEffect } from "react";
import { Image as ImageIcon, GripVertical } from "lucide-react";
import { ProductActions } from "./ProductActions";
import { reordenarProductos } from "@/actions/esencial/productos";

export function ProductListTable({
  initialProductos,
  startIndex,
}: {
  initialProductos: any[];
  startIndex: number;
}) {
  const [productos, setProductos] = useState(initialProductos);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  useEffect(() => {
    setProductos(initialProductos);
  }, [initialProductos]);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    const prod = productos[index];
    
    // Crear una imagen limpia para evitar bugs visuales del navegador
    const dragImg = document.createElement("div");
    dragImg.id = "drag-ghost-clone";
    dragImg.style.width = "300px";
    dragImg.style.padding = "16px";
    dragImg.style.backgroundColor = "#18181b"; // bg-slate-900
    dragImg.style.color = "white";
    dragImg.style.border = "1px solid #3f3f46"; // border-slate-700
    dragImg.style.borderRadius = "8px";
    dragImg.style.position = "absolute";
    dragImg.style.top = "-9999px";
    dragImg.style.left = "-9999px";
    dragImg.style.zIndex = "9999";
    dragImg.style.fontWeight = "bold";
    dragImg.innerHTML = `Moviendo: ${prod.name}`;
    
    document.body.appendChild(dragImg);
    e.dataTransfer.setDragImage(dragImg, 20, 20);
    e.dataTransfer.effectAllowed = "move";

    setTimeout(() => setDraggedIndex(index), 0);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDragEnd = async () => {
    const ghost = document.getElementById("drag-ghost-clone");
    if (ghost) ghost.remove();
    
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      // Reordenar localmente
      const newProductos = [...productos];
      const draggedItem = newProductos.splice(draggedIndex, 1)[0];
      newProductos.splice(dragOverIndex, 0, draggedItem);
      
      setProductos(newProductos);

      // Calcular nuevas posiciones
      // Asumimos que los initialProductos venían ordenados por position.
      // Le asignamos a los elementos reordenados la posición de su índice actual.
      // Para ser seguros, mandamos todas las posiciones actualizadas de esta página.
      // Calcular nuevas posiciones absolutas usando el startIndex
      const updates = newProductos.map((p, idx) => ({
        id: p.id,
        position: startIndex + idx + 1
      }));

      // Actualizar local
      const updatedProductos = newProductos.map((p, idx) => ({
        ...p,
        position: startIndex + idx + 1
      }));
      setProductos(updatedProductos);

      // Persistir
      await reordenarProductos(updates);
    }
    
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm text-slate-400 min-w-[600px] md:min-w-0">
        <thead className="bg-white/[0.02] border-b border-white/[0.05] text-xs uppercase font-semibold text-slate-500 tracking-wider">
          <tr>
            <th scope="col" className="px-6 py-4 w-10"></th>
            <th scope="col" className="px-6 py-4">Producto / Servicio</th>
            <th scope="col" className="px-6 py-4">Precio Público</th>
            <th scope="col" className="px-6 py-4">Stock</th>
            <th scope="col" className="px-6 py-4 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {productos.map((prod, i) => (
            <tr 
              key={prod.id} 
              draggable
              onDragStart={(e) => handleDragStart(e, i)}
              onDragOver={(e) => handleDragOver(e, i)}
              onDragEnd={handleDragEnd}
              className={`group transition-all duration-300 hover:bg-white/[0.02] cursor-grab active:cursor-grabbing
                ${!prod.active ? 'opacity-50' : ''}
                ${draggedIndex === i ? 'opacity-30 scale-[0.98] bg-white/5' : ''}
                ${dragOverIndex === i ? 'shadow-[inset_0_2px_0_rgba(255,255,255,0.8)] bg-white/10' : ''}
              `}
            >
              <td className="px-2 py-4 cursor-grab active:cursor-grabbing opacity-30 group-hover:opacity-100 transition-opacity">
                <GripVertical className="h-5 w-5 mx-auto" />
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-4 pointer-events-none">
                  <div className="h-12 w-12 rounded-xl bg-surface flex items-center justify-center border border-white/[0.05] flex-shrink-0 shadow-inner overflow-hidden relative">
                    {prod.image ? (
                      <img src={prod.image} alt={prod.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <ImageIcon className="h-5 w-5 text-slate-600" />
                    )}
                    {!prod.active && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">Pausado</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-foreground text-base group-hover:text-primary transition-colors flex items-center gap-2">
                      {prod.name}
                      {!prod.active && <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] uppercase font-bold border border-white/[0.05]">Oculto</span>}
                      {prod.featured && <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] uppercase font-bold border border-amber-500/20">Destacado</span>}
                      {prod.is_sale && <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] uppercase font-bold border border-emerald-500/20">En Oferta</span>}
                      {prod.stock !== null && prod.stock > 0 && prod.stock <= 5 && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] uppercase font-bold border border-amber-500/20">Últimas Unidades</span>
                      )}
                    </div>
                    <div className="text-xs mt-1 truncate max-w-[200px] md:max-w-md text-slate-500">{prod.description}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 font-medium text-slate-300">
                {prod.is_sale && prod.sale_price ? (
                  <div className="flex flex-col">
                    <span className="text-slate-500 line-through text-xs font-normal">${prod.price.toLocaleString("es-AR")}</span>
                    <span className="text-emerald-400 font-bold">${prod.sale_price.toLocaleString("es-AR")}</span>
                  </div>
                ) : (
                  <span>${prod.price.toLocaleString("es-AR")}</span>
                )}
              </td>
              <td className="px-6 py-4 text-slate-400">
                {prod.stock !== null && prod.stock !== undefined ? (
                  <div className="flex flex-col gap-1">
                    <span className={`${prod.stock <= 5 ? 'text-amber-400 font-medium' : 'text-slate-300'}`}>
                      {prod.stock} u.
                    </span>
                    {prod.stock === 0 && (
                      <span className="text-[10px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded uppercase font-bold w-fit tracking-wider">
                        Agotado
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-slate-600">—</span>
                )}
              </td>
              <td className="px-6 py-4 text-right">
                <div onClick={e => e.stopPropagation()}>
                  <ProductActions product={{ id: prod.id, active: prod.active, featured: prod.featured ?? false }} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
