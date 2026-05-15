# Guía de Implementación Rápida (Sistema Unificado) ⚡

Con la nueva arquitectura consolidada, ya no necesitas proyectos separados. El mismo repositorio sirve para todos los planes.

### 1. Configuración de Base de Datos (Supabase)
Es el paso más importante, ya que el panel decide qué mostrar basándose en esto:
- **Tenant**: Crea el registro en la tabla `tenants`.
- **Plan**: Asegúrate de que la columna `plan` tenga exactamente: `esencial`, `emprendimiento` o `empresa`.
- **Acceso**: Vincula el `user_id` de Auth con el `tenant_id` en la tabla `user_tenants`.

### 2. Despliegue en Vercel
- Crea un solo proyecto vinculado a este repositorio (la raíz del proyecto).
- **No** cambies el "Root Directory".
- Configura las variables de entorno:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`

### 3. Verificación
1. Accede a `dominio.com/admin/login`.
2. Verás el logo de SitioHoy y el mensaje premium.
3. Al loguearte, verás el **nuevo loader animado**.
4. El sistema detectará el plan de la DB y cargará el Sidebar correspondiente automáticamente.

---
**Nota**: Si necesitas cambiar el plan de un cliente, simplemente actualiza la columna `plan` en la tabla `tenants` de Supabase. El cambio se reflejará la próxima vez que el cliente navegue por el panel.
