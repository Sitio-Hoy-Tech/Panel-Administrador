import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProductEditForm } from "./ProductEditForm";
import { getProductoById } from "@/actions/esencial/productos";
import { notFound } from "next/navigation";

export default async function EditarProductoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data: product, error } = await getProductoById(id);

  if (error || !product) {
    notFound();
  }

  return (
    <div className="w-full space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/admin/productos" className="p-2 hover:bg-white/5 rounded-lg transition-colors">
          <ArrowLeft className="h-5 w-5 text-slate-400" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Editar Producto</h1>
          <p className="mt-1 text-slate-400">Modificá los detalles de este producto en tu catálogo.</p>
        </div>
      </div>

      <ProductEditForm product={product} />
    </div>
  );
}
