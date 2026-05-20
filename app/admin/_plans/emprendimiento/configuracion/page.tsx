import { createClient } from "@/utils/supabase/server";
import { getCurrentTenant } from "@/utils/auth";
import { redirect } from "next/navigation";
import { ConfigForm } from "./ConfigForm";
import { ChangePasswordForm } from "@/components/shared/ChangePasswordForm";

export default async function ConfiguracionPage() {
  const tenantId = await getCurrentTenant();

  if (!tenantId) {
    redirect("/admin/login");
  }

  const supabase = await createClient();

  const [{ data: tenant }, { data: zones }] = await Promise.all([
    supabase.from('tenants').select('origin_phone').eq('id', tenantId).single(),
    supabase.from('shipping_zones').select('id, name, price').eq('tenant_id', tenantId).order('name', { ascending: true }),
  ]);

  const initialPhone = tenant?.origin_phone ?? "";

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-white">Configuración</h1>
        <p className="mt-2 text-slate-400">Administrá contacto, pagos y envíos de tu tienda.</p>
      </div>

      <ConfigForm initialPhone={initialPhone} shippingZones={zones || []} />
      <ChangePasswordForm />
    </div>
  );
}
