import { getPlanType } from "@/lib/plan-config";

import EsencialEditar from "../../../_plans/esencial/productos/editar/[id]/page";
import EmprendimientoEditar from "../../../_plans/emprendimiento/productos/editar/[id]/page";
import EmpresaEditar from "../../../_plans/empresa/productos/editar/[id]/page";

export default async function EditarProductoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const plan = getPlanType();

  switch (plan) {
    case "esencial":
      return <EsencialEditar params={params} />;
    case "emprendimiento":
      return <EmprendimientoEditar params={params} />;
    case "empresa":
      return <EmpresaEditar params={params} />;
  }
}
