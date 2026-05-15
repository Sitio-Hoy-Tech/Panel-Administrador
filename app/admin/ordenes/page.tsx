import { getPlanType } from "@/lib/plan-config";
import { notFound } from "next/navigation";

import EmprendimientoOrdenes from "../_plans/emprendimiento/ordenes/page";
import EmpresaOrdenes from "../_plans/empresa/ordenes/page";

export default async function OrdenesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const plan = getPlanType();

  switch (plan) {
    case "emprendimiento":
      return <EmprendimientoOrdenes searchParams={searchParams} />;
    case "empresa":
      return <EmpresaOrdenes searchParams={searchParams} />;
    default:
      // Plan esencial no tiene ordenes
      notFound();
  }
}
