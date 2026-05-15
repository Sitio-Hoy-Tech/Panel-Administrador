import { getPlanType } from "@/lib/plan-config";
import { notFound } from "next/navigation";

import EsencialProductos from "../_plans/esencial/productos/page";
import EmprendimientoProductos from "../_plans/emprendimiento/productos/page";
import EmpresaProductos from "../_plans/empresa/productos/page";

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const plan = getPlanType();

  switch (plan) {
    case "esencial":
      return <EsencialProductos searchParams={searchParams} />;
    case "emprendimiento":
      return <EmprendimientoProductos searchParams={searchParams} />;
    case "empresa":
      return <EmpresaProductos searchParams={searchParams} />;
    default:
      notFound();
  }
}
