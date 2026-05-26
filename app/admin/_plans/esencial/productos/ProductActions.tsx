"use client";

import { useState } from "react";
import { Trash2, EyeOff, Eye, Loader2, Pencil, Star } from "lucide-react";
import { eliminarProducto, toggleProductoActivo, toggleProductoFeatured } from "@/actions/esencial/productos";
import { ConfirmModal } from "@/components/esencial/ConfirmModal";
import Link from "next/link";

interface ProductActionsProps {
  product: {
    id: string;
    active: boolean;
    featured: boolean;
  };
}

export function ProductActions({ product }: ProductActionsProps) {
  const [isPending, setIsPending] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleToggleActive = async () => {
    setIsPending(true);
    await toggleProductoActivo(product.id, !product.active);
    setIsPending(false);
  };

  const handleToggleFeatured = async () => {
    setIsPending(true);
    await toggleProductoFeatured(product.id, !product.featured);
    setIsPending(false);
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setIsPending(true);
    await eliminarProducto(product.id);
    setIsPending(false);
    setShowDeleteModal(false);
  };

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        {/* Destacar */}
        <button
          onClick={handleToggleFeatured}
          disabled={isPending}
          title={product.featured ? "Quitar destacado" : "Marcar como destacado"}
          className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${product.featured ? "text-amber-400 hover:text-amber-300 hover:bg-amber-500/10" : "text-slate-400 hover:text-amber-400 hover:bg-amber-500/10"}`}
        >
          <Star className={`h-4 w-4 ${product.featured ? "fill-amber-400" : ""}`} />
        </button>

        {/* Pausar/Reanudar */}
        <button
          onClick={handleToggleActive}
          disabled={isPending}
          title={product.active ? "Pausar" : "Reanudar"}
          className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400 hover:text-white disabled:opacity-50"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : (product.active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />)}
        </button>

        {/* Editar */}
        <Link
          href={`/admin/productos/editar/${product.id}`}
          title="Editar producto"
          className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400 hover:text-white disabled:opacity-50"
        >
          <Pencil className="h-4 w-4" />
        </Link>

        {/* Eliminar */}
        <button
          onClick={handleDeleteClick}
          disabled={isPending}
          title="Eliminar"
          className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-slate-400 hover:text-red-400 disabled:opacity-50"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        </button>
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Eliminar producto"
        description="¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer y se borrará de tu catálogo permanentemente."
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        isDestructive={true}
        isPending={isPending}
      />
    </>
  );
}
