"use client";

import { useState } from "react";
import { Trash2, Loader2, EyeOff, Eye } from "lucide-react";
import { eliminarCategoria, actualizarCategoria } from "@/actions/esencial/categorias";
import { ConfirmModal } from "@/components/esencial/ConfirmModal";
import { toast } from "sonner";

interface CategoryActionsProps {
  category: {
    id: string;
    name: string;
    active: boolean;
  };
}

export function CategoryActions({ category }: CategoryActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await eliminarCategoria(category.id);
    setIsDeleting(false);
    setShowConfirm(false);

    if (result.success) {
      toast.success("Categoría eliminada");
    } else {
      toast.error(result.error || "No se pudo eliminar");
    }
  };

  const handleToggle = async () => {
    setIsToggling(true);
    const formData = new FormData();
    formData.append("name", category.name);
    formData.append("active", (!category.active).toString());

    const result = await actualizarCategoria(category.id, formData);
    setIsToggling(false);

    if (result.success) {
      toast.success(category.active ? "Categoría desactivada" : "Categoría activada");
    } else {
      toast.error(result.error || "Error al cambiar estado");
    }
  };

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={handleToggle}
        disabled={isToggling}
        title={category.active ? "Desactivar" : "Activar"}
        className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors disabled:opacity-50"
      >
        {isToggling ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : category.active ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
      </button>

      <button
        onClick={() => setShowConfirm(true)}
        disabled={isDeleting}
        className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/5 rounded-lg transition-colors disabled:opacity-50"
      >
        {isDeleting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
      </button>

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        title="¿Eliminar categoría?"
        description={`Se eliminará "${category.name}". Los productos asociados podrían quedar sin categoría.`}
        confirmText="Eliminar"
        isDestructive
        isPending={isDeleting}
      />
    </div>
  );
}
