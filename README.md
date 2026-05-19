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
2. Completar las variables:

| Variable | Descripción |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anon de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave service role (solo servidor, nunca expuesta al cliente) |
| `STORE_URL` | URL del sitio público del cliente (para revalidar caché) |
| `STORE_REVALIDATION_SECRET` | Secret compartido para invalidar caché del storefront |

3. En Vercel, cargar las mismas variables bajo los entornos correspondientes.

## Recuperación de Contraseña

El flujo completo de recuperación de contraseña está implementado:

1. **Solicitud desde el panel:** En la sección Configuración → Cambiar Contraseña, el usuario puede hacer click en "Solicitar cambio a SitioHoy". Esto inserta un registro en `contact_messages` con `source = 'password_reset_request'`, visible en el CRM.

2. **Envío del email de recuperación:** Desde el CRM/backend de SitioHoy se llama a:
   ```ts
   supabase.auth.resetPasswordForEmail(email, {
     redirectTo: "https://admin.sitiohoy.com.ar/auth/reset-password"
   })
   ```

3. **Página de reset:** El usuario hace click en el email y llega a `/auth/reset-password?code=xxx`. La página intercambia el code por una sesión y muestra el formulario para establecer una nueva contraseña. Al confirmar, redirige a `/admin`.

La URL `https://admin.sitiohoy.com.ar/auth/reset-password` debe estar en la allowlist de **Supabase → Authentication → URL Configuration → Redirect URLs**.

## Soporte y CRM

La sección Soporte de cada plan incluye un formulario de contacto directo con el equipo de SitioHoy. Las consultas se guardan en la tabla `contact_messages` usando el service role (bypasea RLS) con los siguientes valores de `source` para filtrar en el CRM:

| Tipo de consulta | `source` |
|---|---|
| Problema técnico | `support_technical` |
| Configuración del sitio | `support_configuration` |
| Plan o facturación | `support_billing` |
| Otra consulta | `support_other` |
| Solicitud de cambio de contraseña | `password_reset_request` |

Para ver todas las consultas de soporte: `SELECT * FROM contact_messages WHERE source LIKE 'support_%' ORDER BY created_at DESC`.

## Estructura del Proyecto

```
├── actions/                    # Server Actions por plan
│   ├── auth.ts                 # Login/logout, cambio y solicitud de reseteo de contraseña
│   ├── soporte.ts              # Envío de consultas de soporte al CRM
│   ├── esencial/               # Lógica específica plan Esencial
│   ├── emprendimiento/         # Lógica específica plan Emprendimiento
│   └── empresa/                # Lógica específica plan Empresa
├── app/
│   ├── auth/
│   │   └── reset-password/     # Página de establecer nueva contraseña (flujo Supabase)
│   └── admin/
│       ├── _plans/             # Implementaciones completas de cada plan
│       │   ├── esencial/
│       │   ├── emprendimiento/
│       │   └── empresa/
│       ├── page.tsx            # Detecta plan via Server-side y renderiza Dashboard
│       ├── layout.tsx          # Detecta plan via Client-side y renderiza Sidebar
│       └── [ruta]/             # Wrappers que delegan al plan correspondiente
├── components/
│   ├── shared/                 # Componentes reutilizables entre planes
│   │   ├── ChangePasswordForm.tsx   # Formulario de cambio de contraseña + solicitud a SitioHoy
│   │   └── SupportContactForm.tsx   # Formulario de soporte con selector de tipo de consulta
│   ├── esencial/
│   ├── emprendimiento/
│   └── empresa/
├── lib/
│   └── plan-config.ts          # Helper central de detección de plan
└── utils/
    ├── auth.ts                 # Funciones core de obtención de Tenant y Plan
    └── supabase/
        └── server.ts           # createClient (con sesión) y createAdminClient (service role)
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
