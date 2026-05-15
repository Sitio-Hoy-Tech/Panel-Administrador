"use client";

import { useState } from "react";
import { Trash2, EyeOff, Eye, Loader2, Pencil } from "lucide-react";
import { eliminarProducto, toggleProductoActivo } from "@/actions/empresa/productos";
import { ConfirmModal } from "@/components/empresa/ConfirmModal";
import Link from "next/link";

interface ProductActionsProps {
  product: {
    id: string;
    active: boolean;
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
        {/* Pausar/Reanudar */}
        <button
          onClick={handleToggleActive}
          disabled={isPending}
          title={product.active ? "Pausar" : "Reanudar"}
          className="p-2 hover:bg-white/5 rounded-lg transition-colors text-zinc-400 hover:text-white disabled:opacity-50"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : (product.active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />)}
        </button>

        {/* Editar */}
        <Link
          href={`/admin/productos/editar/${product.id}`}
          title="Editar producto"
          className="p-2 hover:bg-white/5 rounded-lg transition-colors text-zinc-400 hover:text-white disabled:opacity-50"
        >
          <Pencil className="h-4 w-4" />
        </Link>

        {/* Eliminar */}
        <button
          onClick={handleDeleteClick}
          disabled={isPending}
          title="Eliminar"
          className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-zinc-400 hover:text-red-400 disabled:opacity-50"
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
