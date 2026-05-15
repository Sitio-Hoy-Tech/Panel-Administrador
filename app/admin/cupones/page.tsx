import { getPlanType } from "@/lib/plan-config";
import { notFound } from "next/navigation";

import EmprendimientoCupones from "../_plans/emprendimiento/cupones/page";
import EmpresaCupones from "../_plans/empresa/cupones/page";

export default async function CuponesPage() {
  const plan = getPlanType();

  switch (plan) {
    case "emprendimiento":
      return <EmprendimientoCupones />;
    case "empresa":
      return <EmpresaCupones />;
    default:
      // Plan esencial no tiene cupones
      notFound();
  }
}
