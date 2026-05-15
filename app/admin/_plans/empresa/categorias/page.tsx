import { Plus, Tag, Trash2, LayoutGrid, Edit2 } from "lucide-react";
import { getCategorias } from "@/actions/empresa/categorias";
import { CategoryForm } from "./CategoryForm";
import { CategoryActions } from "./CategoryActions";

export default async function CategoriasPage() {
  const { data: categorias, error } = await getCategorias();

  return (
    <div className="w-full space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Categorías</h1>
          <p className="mt-2 text-zinc-400">Organizá tus productos para que tus clientes encuentren lo que buscan.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulario de creación */}
        <div className="lg:col-span-1">
          <div className="glass-panel p-6 sticky top-24">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Plus className="h-5 w-5 text-blue-400" />
              Nueva Categoría
            </h2>
            <CategoryForm />
          </div>
        </div>

        {/* Listado de categorías */}
        <div className="lg:col-span-2 space-y-4">
          {!categorias || categorias.length === 0 ? (
            <div className="glass-panel p-12 text-center">
              <Tag className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white">No hay categorías</h3>
              <p className="text-zinc-500 mt-1">Creá tu primera categoría para empezar a organizar tu tienda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {categorias.map((cat: any) => (
                <div key={cat.id} className="glass-panel p-5 flex items-center justify-between group hover:border-white/10 transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-blue-500/10 rounded-lg flex items-center justify-center border border-blue-500/20">
                      <Tag className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white group-hover:text-blue-400 transition-colors">{cat.name}</h4>
                      <p className="text-xs text-zinc-500 uppercase tracking-widest">{cat.slug}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                      cat.active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-500/10 text-zinc-500'
                    }`}>
                      {cat.active ? 'Activa' : 'Inactiva'}
                    </div>
                    <CategoryActions category={cat} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
