import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProductForm } from "./ProductForm";

export default async function CrearProductoPage() {

  return (
    <div className="w-full space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/admin/productos" className="p-2 hover:bg-white/5 rounded-lg transition-colors">
          <ArrowLeft className="h-5 w-5 text-slate-400" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Nuevo Producto</h1>
          <p className="mt-1 text-slate-400">Completá los datos básicos para mostrar en tu catálogo.</p>
        </div>
      </div>

      <ProductForm />
    </div>
  );
}
