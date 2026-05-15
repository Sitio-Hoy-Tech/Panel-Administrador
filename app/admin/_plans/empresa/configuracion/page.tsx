import { createClient } from "@/utils/supabase/server";
import { getCurrentTenant } from "@/utils/auth";
import { redirect } from "next/navigation";
import { ConfigForm } from "./ConfigForm";
import { getShippingZones } from "@/actions/empresa/configuracion";

export default async function ConfiguracionPage() {
  const tenantId = await getCurrentTenant();

  if (!tenantId) {
    redirect("/admin/login");
  }

  const supabase = await createClient();

  const { data: tenant } = await supabase
    .from('tenants')
    .select('origin_phone')
    .eq('id', tenantId)
    .single();

  const initialPhone = tenant?.origin_phone || "";

  // Obtener zonas de envío
  const { data: zones } = await getShippingZones();

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-white">Configuración</h1>
        <p className="mt-2 text-zinc-400">Administrá contacto, pagos y envíos de tu tienda.</p>
      </div>

      <ConfigForm initialPhone={initialPhone} shippingZones={zones || []} />
    </div>
  );
}
