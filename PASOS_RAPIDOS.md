# Checklist de Implementación Rápida ⚡

Seguí estos pasos para desplegar un nuevo panel de cliente en menos de 10 minutos:

1. **Seleccionar Plan**: Elegí la carpeta (`esencial`, `emprendimiento`, `empresa`) según lo contratado.
2. **Setup Vercel**: 
   - Creá un nuevo proyecto en Vercel.
   - Apuntá el "Root Directory" a la carpeta del plan elegido.
3. **Variables de Entorno**: Cargá las variables de Supabase y MercadoPago (si aplica) en Vercel.
4. **Base de Datos**:
   - Asegurá que el `tenant_id` del cliente exista en la tabla `tenants`.
   - Vinculá al usuario administrador en `user_tenants`.
5. **DNS**: Configurá el dominio del cliente en Vercel y Cloudflare.
6. **Verificación**: Entrá a `dominio.com/admin` y probá el login.

---
*Si encontrás errores de "No autorizado", verificá que el `tenant_id` coincida exactamente entre la base de datos y lo que devuelve `getCurrentTenant()`.*
