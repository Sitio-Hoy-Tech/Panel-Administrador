# Panel de Administración — SitioHoy

Panel de administración unificado para clientes de SitioHoy. Un solo proyecto Next.js que muestra distintas funcionalidades según el plan del cliente.

## Planes Disponibles

| Funcionalidad | Esencial | Emprendimiento | Empresa |
|---|:---:|:---:|:---:|
| Dashboard | ✅ | ✅ | ✅ |
| Catálogo de Productos | ✅ (hasta 50) | ✅ (hasta 200) | ✅ (ilimitado) |
| Categorías | ❌ | ✅ | ✅ |
| Órdenes | ❌ | ✅ | ✅ |
| Cupones | ❌ | ✅ | ✅ |
| Clientes | ❌ | ❌ | ✅ |
| Analíticas | ❌ | ✅ (básicas) | ✅ (avanzadas) |
| Configuración | ✅ (teléfono) | ✅ (completa) | ✅ (completa) |
| Mi Plan | ✅ | ✅ | ✅ |
| Soporte | ✅ | ✅ | ✅ |

## Configuración

1. Copiar `.env.example` a `.env.local`
2. Configurar las credenciales de Supabase
3. **Establecer el plan del cliente:**

```bash
NEXT_PUBLIC_PLAN_TYPE=esencial   # o emprendimiento, o empresa
```

## Desarrollo

```bash
npm install
npm run dev
```

## Deploy

Al deployar para un cliente, solo se necesita configurar `NEXT_PUBLIC_PLAN_TYPE` con el plan correcto en las variables de entorno del hosting (Vercel, etc.).

## Estructura del Proyecto

```
├── actions/                    # Server Actions por plan
│   ├── auth.ts                 # Wrapper que delega al plan correcto
│   ├── esencial/               # Actions del plan esencial
│   ├── emprendimiento/         # Actions del plan emprendimiento
│   └── empresa/                # Actions del plan empresa
├── app/
│   └── admin/
│       ├── _plans/             # Páginas originales de cada plan (no son rutas)
│       │   ├── esencial/
│       │   ├── emprendimiento/
│       │   └── empresa/
│       ├── page.tsx            # Wrapper → renderiza dashboard del plan
│       ├── layout.tsx          # Wrapper → renderiza layout del plan
│       ├── productos/          # Wrapper → renderiza productos del plan
│       └── ...                 # Todas las rutas son wrappers
├── components/                 # Componentes UI por plan
│   ├── esencial/
│   ├── emprendimiento/
│   └── empresa/
├── lib/
│   └── plan-config.ts          # Configuración central del plan
└── utils/                      # Utilidades compartidas (Supabase, auth)
```
