interface TopProduct {
  name: string;
  quantity: number;
  revenue: number;
}

interface TopProductsListProps {
  products: TopProduct[];
}

export function TopProductsList({ products }: TopProductsListProps) {
  return (
    <div className="glass-panel p-6">
      <h3 className="text-xl font-bold text-white tracking-tight mb-6">Productos Estrella</h3>
      <div className="space-y-4">
        {products.map((product, index) => (
          <div key={product.name} className="flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/[0.07] flex items-center justify-center text-xs font-bold text-slate-500 group-hover:text-white group-hover:bg-primary/20 transition-all">
                {index + 1}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">{product.name}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest">{product.quantity} unidades vendidas</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-white">${product.revenue.toLocaleString('es-AR')}</p>
              <p className="text-[10px] text-emerald-400 font-medium">RANKING VENTAS</p>
            </div>
          </div>
        ))}
        {products.length === 0 && (
          <p className="text-center text-slate-500 text-sm py-8 italic">No hay suficientes datos de ventas aún.</p>
        )}
      </div>
    </div>
  );
}
