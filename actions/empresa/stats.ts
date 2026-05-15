"use server";

import { createClient } from "@/utils/supabase/server";
import { getCurrentTenant } from "@/utils/auth";

export async function getBusinessStats() {
  const tenantId = await getCurrentTenant();
  if (!tenantId) return { error: "No autorizado" };

  const supabase = await createClient();

  // 1. Fetch Orders (excluding pending and cancelled for revenue)
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('id, total, created_at, status, discount_amount, shipping_cost')
    .eq('tenant_id', tenantId)
    .in('status', ['confirmed', 'preparing', 'shipped', 'delivered']);

  if (ordersError) {
    console.error("Error stats orders:", ordersError);
    return { error: "Error al cargar estadísticas de ventas." };
  }

  // 2. Fetch Order Items for Top Products
  const { data: orderItems, error: itemsError } = await supabase
    .from('order_items')
    .select('product_id, name, quantity, unit_price')
    .eq('tenant_id', tenantId);

  if (itemsError) {
    console.error("Error stats items:", itemsError);
    return { error: "Error al cargar productos más vendidos." };
  }

  // 3. Process Stats
  const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const totalOrders = orders.length;
  const avgTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Top Products aggregation
  const productStats: Record<string, { name: string; quantity: number; revenue: number }> = {};
  orderItems.forEach(item => {
    const key = item.name || "Producto sin nombre";
    if (!productStats[key]) {
      productStats[key] = { name: key, quantity: 0, revenue: 0 };
    }
    productStats[key].quantity += (item.quantity || 0);
    productStats[key].revenue += ((item.quantity || 0) * Number(item.unit_price || 0));
  });

  const topProducts = Object.values(productStats)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Sales over time (last 30 days)
  const salesByDay: Record<string, number> = {};
  orders.forEach(o => {
    // Usar formato YYYY-MM-DD para ordenar correctamente
    const dateKey = new Date(o.created_at).toISOString().split('T')[0];
    salesByDay[dateKey] = (salesByDay[dateKey] || 0) + Number(o.total);
  });

  const timeSeries = Object.entries(salesByDay)
    .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
    .map(([date, value]) => {
      const [year, month, day] = date.split('-');
      return {
        name: `${day}/${month}`,
        value
      };
    })
    .slice(-7); 

  return {
    success: true,
    data: {
      totalRevenue,
      totalOrders,
      avgTicket,
      topProducts,
      timeSeries
    }
  };
}
