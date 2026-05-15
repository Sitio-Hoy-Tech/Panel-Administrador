"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { ClientRow } from "./ClientRow";
import { ClientDetailsModal } from "./ClientDetailsModal";

interface ClientType {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  firstOrderAt: string;
  lastOrderAt: string;
}

interface ClientListProps {
  initialClients: ClientType[];
}

export function ClientList({ initialClients }: ClientListProps) {
  const [clients, setClients] = useState(initialClients);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  const filteredClients = clients.filter(c => 
    c.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="p-4 border-b border-white/5 bg-white/[0.02] flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            className="glass-input pl-10 py-2 w-full text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            suppressHydrationWarning
          />
        </div>
        <div className="text-xs text-zinc-500 font-medium whitespace-nowrap">
          {filteredClients.length} {filteredClients.length === 1 ? 'cliente' : 'clientes'}
        </div>
      </div>

      <div className="overflow-x-auto w-full">
        <table className="w-full text-left text-sm whitespace-nowrap min-w-[800px] hidden md:table">
          <thead className="bg-white/[0.02] border-b border-white/5">
            <tr>
              <th className="px-6 py-4 font-medium text-zinc-400">Cliente</th>
              <th className="px-6 py-4 font-medium text-zinc-400">Total Gastado</th>
              <th className="px-6 py-4 font-medium text-zinc-400 text-center">Pedidos Totales</th>
              <th className="px-6 py-4 font-medium text-zinc-400">Última Compra</th>
              <th className="px-6 py-4 font-medium text-zinc-400 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredClients.length > 0 ? (
              filteredClients.map((client) => (
                <ClientRow 
                  key={client.id} 
                  client={client} 
                  onClick={() => setSelectedClientId(client.id)}
                />
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                  No se encontraron clientes que coincidan con la búsqueda.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Mobile View (Cards) */}
        <div className="md:hidden divide-y divide-white/5">
          {filteredClients.length > 0 ? (
            filteredClients.map((client) => (
              <ClientRow 
                key={client.id} 
                client={client} 
                onClick={() => setSelectedClientId(client.id)}
                isMobile
              />
            ))
          ) : (
            <div className="px-6 py-12 text-center text-zinc-500">
              No se encontraron clientes.
            </div>
          )}
        </div>
      </div>

      {selectedClientId && (
        <ClientDetailsModal 
          clientId={selectedClientId} 
          client={clients.find(c => c.id === selectedClientId)}
          onClose={() => setSelectedClientId(null)} 
        />
      )}
    </div>
  );
}
