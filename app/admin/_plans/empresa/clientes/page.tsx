import { Users, Download } from "lucide-react";
import { getClientes } from "@/actions/empresa/clientes";
import { ClientList } from "./ClientList";

export default async function ClientesPage() {
  const result = await getClientes();
  const clients = result.success ? result.data : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            CRM de Clientes
          </h1>
          <p className="text-slate-400">
            Gestioná y analizá el comportamiento de compra de tus clientes.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-surface hover:bg-surface-hover border border-border text-white text-sm font-medium rounded-xl transition-colors">
            <Download className="h-4 w-4" />
            Exportar CSV
          </button>
        </div>
      </div>

      <div className="glass-panel overflow-hidden">
        <ClientList initialClients={clients} />
      </div>
    </div>
  );
}
