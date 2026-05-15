# SitioHoy — Paneles de Administración

Este repositorio contiene los paneles de administración para los tres niveles de servicio de SitioHoy. Cada panel está diseñado con una estética premium, oscura y minimalista para ofrecer la mejor experiencia de usuario a los clientes.

## 📂 Estructura de Planes

| Plan | Directorio | Descripción | Precio (Abril 2026) |
|---|---|---|---|
| **Esencial** | `/esencial` | Catálogo básico, contacto WhatsApp, diseño premium. | $25.000/mes |
| **Emprendimiento** | `/emprendimiento` | Tienda completa, MercadoPago, gestión de stock. | $37.000/mes |
| **Empresa** | `/empresa` | Todo lo anterior + Ilimitado, Analítica, Envíos Auto. | $65.000/mes |

---

## 🚀 Cómo empezar

### 1. Clonar el repositorio
Cualquiera de las carpetas es un proyecto Next.js independiente. Elegí la que corresponda al plan del cliente.

### 2. Configuración de Base de Datos
Todos los planes utilizan **Supabase**. Asegurate de:
1. Crear un proyecto en Supabase.
2. Ejecutar las migraciones necesarias (ver `/utils/supabase/schema.sql` si existe o solicitar el esquema base).
3. Configurar el **Multi-tenancy**: Cada cliente debe tener un registro en la tabla `tenants` y un usuario asociado en `user_tenants`.

### 3. Variables de Entorno
Cada plan tiene requisitos específicos (ej: MercadoPago, Umami). Consultá la sección **🔐 Variables de Entorno** en el README de cada carpeta para ver exactamente qué keys necesitás.

---

## 🛠️ Desarrollo

Para ejecutar localmente un panel específico:

```bash
cd [directorio-del-plan]
npm install
npm run dev
```

---

## 📄 Guías Detalladas
- [Implementación Plan Esencial](./esencial/README.md)
- [Implementación Plan Emprendimiento](./emprendimiento/README.md)
- [Implementación Plan Empresa](./empresa/README.md)

---

## ⚖️ Licencia
Propiedad de **SitioHoy**. Prohibida su reproducción sin autorización.
