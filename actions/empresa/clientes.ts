"use server";

import { createClient } from "@/utils/supabase/server";
import { getCurrentTenant } from "@/utils/auth";

export async function getClientes() {
  const tenantId = await getCurrentTenant();
  if (!tenantId) return { error: "No autorizado" };

  const supabase = await createClient();

  // Obtenemos todas las órdenes para extraer y agrupar la información de los clientes
  const { data: orders, error } = await supabase
    .from('orders')
    .select('customer_first_name, customer_last_name, payer_email, customer_phone, total, created_at, status')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error("Error obteniendo clientes (órdenes):", error);
    return { error: "Error al cargar la base de clientes." };
  }

  // Agrupamos por payer_email
  const clientsMap = new Map<string, any>();

  orders.forEach((order) => {
    const email = order.payer_email;
    if (!email) return;

    if (!clientsMap.has(email)) {
      clientsMap.set(email, {
        id: email, // Usamos el email como ID único temporal
        email: email,
        firstName: order.customer_first_name,
        lastName: order.customer_last_name,
        phone: order.customer_phone,
        totalOrders: 0,
        totalSpent: 0,
        firstOrderAt: order.created_at,
        lastOrderAt: order.created_at,
      });
    }

    const client = clientsMap.get(email);
    
    // Contamos como venta exitosa si el pedido está en un estado que implique intención de pago o pago realizado
    const orderStatus = order.status?.toLowerCase();
    const validStatuses = ['confirmed', 'preparing', 'shipped', 'delivered', 'approved', 'completed', 'paid', 'pending'];
    
    if (validStatuses.includes(orderStatus)) {
        client.totalSpent += Number(order.total || 0);
    }
    
    client.totalOrders += 1;
    client.lastOrderAt = order.created_at; // Como vienen ordenados ascendente, el último será el más reciente
  });

  const clientsList = Array.from(clientsMap.values()).sort((a, b) => b.totalSpent - a.totalSpent);

  return { success: true, data: clientsList };
}
