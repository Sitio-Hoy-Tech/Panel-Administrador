# Panel de Administración — SitioHoy

Panel de administración unificado para clientes de SitioHoy. Un solo proyecto Next.js que adapta automáticamente su interfaz, funcionalidades y lógica según el plan contratado por el cliente, detectado en tiempo real desde la base de datos.

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

## Detección Dinámica de Planes

El sistema utiliza una arquitectura **Multi-tenant** dinámica:
1. Al iniciar sesión, el sistema identifica al usuario.
2. Consulta la tabla `user_tenants` para obtener el `tenant_id`.
3. Consulta la tabla `tenants` para obtener la columna `plan` asociada.
4. El `layout.tsx` principal inyecta el Sidebar y la estructura correspondiente al plan detectado.

### Requisitos en Base de Datos (Supabase)
Para que la detección funcione, la tabla `tenants` debe tener:
- Columna `plan`: valores esperados `esencial`, `emprendimiento` o `empresa`.
- Columna `name`: Nombre del negocio que se mostrará en el sidebar.

## Configuración de Entorno

1. Copiar `.env.example` a `.env.local`
2. Configurar las credenciales de Supabase.
3. **Variables de Entorno**: Cargá las variables de Supabase y MercadoPago (si aplica) en Vercel.

## Estructura del Proyecto

```
├── actions/                    # Server Actions por plan
│   ├── auth.ts                 # Lógica de login/logout unificada
│   ├── esencial/               # Lógica específica plan Esencial
│   ├── emprendimiento/         # Lógica específica plan Emprendimiento
│   └── empresa/                # Lógica específica plan Empresa
├── app/
│   └── admin/
│       ├── _plans/             # Implementaciones completas de cada plan
│       │   ├── esencial/
│       │   ├── emprendimiento/
│       │   └── empresa/
│       ├── page.tsx            # Detecta plan via Server-side y renderiza Dashboard
│       ├── layout.tsx          # Detecta plan via Client-side y renderiza Sidebar
│       └── [ruta]/             # Wrappers que delegan al plan correspondiente
├── components/                 # Componentes UI organizados por plan
├── lib/
│   └── plan-config.ts          # Helper central de detección de plan
└── utils/                      
    └── auth.ts                 # Funciones core de obtención de Tenant y Plan
```

## Experiencia Premium

El panel incluye características de alta gama:
- **Login Branded:** Pantalla de acceso con identidad de SitioHoy y mensajes marketineros unificados.
- **Intelligent Loader:** Pantalla de carga animada con el logo de la marca y efectos de pulso mientras se sincronizan los datos del tenant.
- **Dynamic Sidebar:** Se ajusta en tiempo real según los permisos del plan.

## Desarrollo

```bash
npm install
npm run dev
```

## Deploy

Al deployar en Vercel, el proyecto es autogestionable. El mismo código sirve para cualquier cliente; la interfaz que vea dependerá exclusivamente de lo configurado en su registro de la tabla `tenants` en Supabase.
