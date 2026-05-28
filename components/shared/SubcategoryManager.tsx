"use client";

import { useState, useRef } from "react";
import { ChevronDown, Plus, Loader2, Eye, EyeOff, Trash2, Check, X } from "lucide-react";
import { toast } from "sonner";

interface Subcategory {
  id: string;
  name: string;
  slug: string;
  active: boolean;
}

interface Category {
  id: string;
  name: string;
  subcategories?: Subcategory[];
}

interface SubcategoryManagerProps {
  category: Category;
  onCreate: (categoryId: string, formData: FormData) => Promise<{ success?: boolean; error?: string }>;
  onUpdate: (id: string, formData: FormData) => Promise<{ success?: boolean; error?: string }>;
  onDelete: (id: string) => Promise<{ success?: boolean; error?: string }>;
}

export function SubcategoryManager({ category, onCreate, onUpdate, onDelete }: SubcategoryManagerProps) {
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const subcategories = category.subcategories ?? [];

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setIsCreating(true);
    const fd = new FormData();
    fd.append("name", newName.trim());
    const res = await onCreate(category.id, fd);
    setIsCreating(false);
    if (res.success) {
      setNewName("");
      toast.success("Subcategoría creada");
    } else {
      toast.error(res.error || "Error al crear subcategoría");
    }
  };

  const startEdit = (sub: Subcategory) => {
    setEditingId(sub.id);
    setEditName(sub.name);
  };

  const handleUpdate = async (sub: Subcategory) => {
    if (!editName.trim()) return;
    setLoadingId(sub.id);
    const fd = new FormData();
    fd.append("name", editName.trim());
    fd.append("active", sub.active.toString());
    const res = await onUpdate(sub.id, fd);
    setLoadingId(null);
    if (res.success) {
      setEditingId(null);
      toast.success("Subcategoría actualizada");
    } else {
      toast.error(res.error || "Error al actualizar");
    }
  };

  const handleToggle = async (sub: Subcategory) => {
    setLoadingId(sub.id);
    const fd = new FormData();
    fd.append("name", sub.name);
    fd.append("active", (!sub.active).toString());
    const res = await onUpdate(sub.id, fd);
    setLoadingId(null);
    if (res.success) {
      toast.success(sub.active ? "Subcategoría desactivada" : "Subcategoría activada");
    } else {
      toast.error(res.error || "Error al cambiar estado");
    }
  };

  const handleDelete = async (id: string) => {
    setLoadingId(id);
    const res = await onDelete(id);
    setLoadingId(null);
    setConfirmDeleteId(null);
    if (res.success) {
      toast.success("Subcategoría eliminada");
    } else {
      toast.error(res.error || "Error al eliminar");
    }
  };

  return (
    <div className="border-t border-white/[0.05] mt-3 pt-3">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors w-full text-left"
      >
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
        <span>
          {subcategories.length > 0
            ? `${subcategories.length} subcategoría${subcategories.length !== 1 ? "s" : ""}`
            : "Agregar subcategorías"}
        </span>
      </button>

      {open && (
        <div className="mt-3 space-y-2 pl-2">
          {subcategories.map((sub) => (
            <div key={sub.id} className="flex items-center gap-2 group">
              {editingId === sub.id ? (
                <>
                  <input
                    autoFocus
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleUpdate(sub);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    className="glass-input px-2 py-1 text-sm flex-1 h-8"
                    disabled={loadingId === sub.id}
                  />
                  <button
                    type="button"
                    onClick={() => handleUpdate(sub)}
                    disabled={loadingId === sub.id}
                    className="p-1 text-emerald-400 hover:text-emerald-300 transition-colors disabled:opacity-50"
                  >
                    {loadingId === sub.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Check className="h-3.5 w-3.5" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="p-1 text-slate-500 hover:text-white transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-sm text-slate-300 truncate">{sub.name}</span>
                  <div
                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider shrink-0 ${
                      sub.active ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-500/10 text-slate-500"
                    }`}
                  >
                    {sub.active ? "Activa" : "Inactiva"}
                  </div>

                  {confirmDeleteId === sub.id ? (
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-red-400">¿Confirmar?</span>
                      <button
                        type="button"
                        onClick={() => handleDelete(sub.id)}
                        disabled={loadingId === sub.id}
                        className="text-[10px] text-red-400 hover:text-red-300 font-bold px-1"
                      >
                        {loadingId === sub.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Sí"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="text-[10px] text-slate-500 hover:text-white font-bold px-1"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => startEdit(sub)}
                        className="p-1 text-slate-500 hover:text-white hover:bg-white/5 rounded transition-colors"
                        title="Editar"
                      >
                        <svg className="h-3 w-3" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l1.086 1.086a1.75 1.75 0 0 1 0 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 0 1-.927-.928l.929-3.25c.081-.286.235-.547.445-.758l8.61-8.61Z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggle(sub)}
                        disabled={loadingId === sub.id}
                        className="p-1 text-slate-500 hover:text-white hover:bg-white/5 rounded transition-colors disabled:opacity-50"
                        title={sub.active ? "Desactivar" : "Activar"}
                      >
                        {loadingId === sub.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : sub.active ? (
                          <EyeOff className="h-3 w-3" />
                        ) : (
                          <Eye className="h-3 w-3" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(sub.id)}
                        className="p-1 text-slate-500 hover:text-red-400 hover:bg-red-400/5 rounded transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}

          {/* Fila de creación */}
          <div className="flex items-center gap-2 pt-1">
            <input
              ref={inputRef}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleCreate(); } }}
              placeholder="Nueva subcategoría..."
              className="glass-input px-2 py-1 text-sm flex-1 h-8 placeholder:text-slate-600"
              disabled={isCreating}
            />
            <button
              type="button"
              onClick={handleCreate}
              disabled={isCreating || !newName.trim()}
              className="p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              title="Crear subcategoría"
            >
              {isCreating ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Plus className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
