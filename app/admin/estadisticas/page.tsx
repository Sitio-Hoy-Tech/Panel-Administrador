import { detectPlan } from "@/lib/plan-config";
import { notFound } from "next/navigation";

import EmpresaEstadisticas from "../_plans/empresa/estadisticas/page";

export default async function EstadisticasPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const plan = await detectPlan();

  switch (plan) {
    case "empresa":
      return <EmpresaEstadisticas searchParams={searchParams} />;
    default:
      notFound();
  }
}
