---
name: admin-panel-modernization
description: Estándares y componentes clave para la modernización de los paneles de administración (esencial, profesional, premium). Incluye diseño Bento/Glassmorphism, responsividad 100% precisa sin errores de desbordamiento, prevención de hydration errors, Server Actions para subida de imágenes con compresión al vuelo y modales custom con React Portals.
trigger: Cuando se requiera crear o actualizar vistas, formularios, componentes o lógica de catálogo en los paneles de administración.
---

# Skill: Modernización de Paneles de Administración

## Stack requerido
- Next.js 15 (App Router) + TypeScript + ISR On Demand
- Supabase (Storage, Base de Datos, Auth)
- Tailwind CSS

## Dependencias a instalar

```bash
npm install browser-image-compression lucide-react
```

## 1. Diseño y UI (Bento Grid & Glassmorphism)

Todos los paneles deben usar la misma paleta y arquitectura CSS definida en `globals.css`.

**Reglas de UI:**
- Usar fondos oscuros con `bg-background` (`#0a0a0a`).
- Aplicar la clase `.glass-panel` para los contenedores principales (tarjetas, formularios).
- Aplicar `.glass-input` a todos los `input` y `textarea`.
- Asegurar de que los botones interactivos tengan `cursor-pointer` (configurado globalmente).

## 2. Prevención de Errores de Hidratación (Hydration Mismatch)

Las extensiones de los usuarios (ej. LastPass, Bitwarden) inyectan atributos en los campos de formulario, lo que rompe la hidratación de Next.js.

**Regla obligatoria:**
Todos los `<input>` y `<textarea>` deben incluir explícitamente la propiedad `suppressHydrationWarning`. Asimismo, se recomienda aplicarlo al tag `<body>` en `layout.tsx` para evitar advertencias globales por inyecciones de atributos en el DOM.

```tsx
// app/layout.tsx
<body className={...} suppressHydrationWarning>
  {children}
</body>

// Componentes
<input 
  ...
  suppressHydrationWarning 
/>
```

## 3. Subida y Compresión de Imágenes en el Cliente

Para ahorrar costos de Supabase Storage y optimizar tiempos de carga, las imágenes DEBEN comprimirse en el navegador antes de ser enviadas al Server Action.

### Implementación en React:

```tsx
import imageCompression from "browser-image-compression";

const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  if (e.target.files && e.target.files.length > 0) {
    setIsCompressing(true); // Mostrar loader y bloquear botón de Guardar
    const files = Array.from(e.target.files);
    const compressedFiles: File[] = [];

    const options = {
      maxSizeMB: 0.5, // Límite de 500KB
      maxWidthOrHeight: 1200,
      useWebWorker: true,
    };

    for (const file of files) {
      try {
        const compressedBlob = await imageCompression(file, options);
        compressedFiles.push(new File([compressedBlob], file.name, { type: compressedBlob.type }));
      } catch (err) {
        console.error("Error al comprimir:", err);
        compressedFiles.push(file); // Fallback
      }
    }
    
    // Generar Object URLs para previsualización
    setImages(prev => [...prev, ...compressedFiles]);
    setPreviewUrls(prev => [...prev, ...compressedFiles.map(f => URL.createObjectURL(f))]);
    setIsCompressing(false);
  }
};
```

## 4. Server Actions (Base de Datos y Storage)

La lógica de negocio se ejecuta 100% en el servidor mediante Server Actions asíncronos (`"use server"`).

### Patrón de Inserción de Productos:
1. Validar plan/límites.
2. Insertar fila principal en tabla `products` -> obtener `id`.
3. Subir `File[]` al bucket `objects` en Supabase Storage (`tenant_id/uuid.ext`).
4. Insertar referencias en tabla `product_images`.
5. Revalidar rutas con `revalidatePath`.

### Patrón de Eliminación Físico (¡Muy Importante!):
El Storage de Supabase NO borra los archivos cuando se borra el registro de DB automáticamente mediante `ON DELETE CASCADE`.

```typescript
"use server"
// 1. Obtener URLs de la DB
const { data: images } = await supabase.from('product_images').select('url').eq('product_id', id);

// 2. Extraer "tenant_id/archivo.ext" y eliminar físicamente del bucket
if (images?.length) {
  const filePaths = images.map(img => img.url.split('/objects/')[1]).filter(Boolean) as string[];
  await supabase.storage.from('objects').remove(filePaths);
}

// 3. Borrar registros explícitamente
await supabase.from('product_images').delete().eq('product_id', id);

// 4. Borrar producto principal
await supabase.from('products').delete().eq('id', id);

### 4.1 Carga de Datos Completa
Al realizar consultas para formularios de edición (ej. `getProductoById`), asegurar siempre la inclusión de todas las claves foráneas (IDs) y relaciones necesarias para evitar que el estado inicial del formulario sea parcial y cause pérdida de datos al guardar (ej. `category_id`).
```

## 5. Modales y Portales (ConfirmModal)

Rechazar terminantemente el uso de `window.alert()` o `window.confirm()`. 

**Reglas para modales:**
- Usar el componente estandarizado `ConfirmModal`.
- El componente DEBE usar `createPortal(..., document.body)` para evitar ser recortado por clases CSS como `overflow-hidden` de tablas o contenedores.
- **Dropdowns de Estado:** Para selectores de estado (ej. Pedidos), no usar el `<select>` nativo. Crear un `StatusDropdown` custom con Portal que calcule su posición dinámicamente (`getBoundingClientRect`) para flotar sobre el contenido sin cortes.
- Bloquear el scroll del `<body>` mediante `useEffect` cuando el modal esté abierto.

### 5.1 Responsive Avanzado (Cards vs Table)
Para listas complejas (Pedidos, Usuarios), aplicar un sistema de **Layout Dual**:
1. **Desktop (`md:block`):** Tabla detallada para eficiencia y densidad de datos.
2. **Mobile (`md:hidden`):** Grid de tarjetas (`OrderCard`, `ProductCard`) que organizan la info verticalmente, optimizando el "touch target" y eliminando el scroll horizontal tedioso.

## 6. Botones de Acción Inline

En tablas o catálogos, no usar menús dropdown (3 puntos). Utilizar botones inline al final de las filas usando íconos de `lucide-react` con tooltips para acciones directas (Pausar, Editar, Eliminar).

## 7. Responsividad y Precisión Visual (Error-Free)

La interfaz debe ser 100% fluida y no presentar errores de desbordamiento en ningún dispositivo.

**Reglas de oro:**
- **Mobile & Tablet Header:** Usar un encabezado con menú hamburguesa para todas las resoluciones inferiores a `lg` (escritorio).
- **Sidebar Estático:** El sidebar solo debe ser fijo en resoluciones `lg` o superiores.
- **Animaciones Modernas:**
  - El menú lateral debe usar un **Slide-in** (`translate-x`) con una duración de ~500ms y curva `ease-out`.
  - El backdrop (fondo oscuro) debe usar un **Fade-in** (`opacity`) con `backdrop-blur`.
  - Usar `visible/invisible` en lugar de `hidden` para permitir que las animaciones de salida se ejecuten correctamente.
- **Touch Targets:** Botones de acción directos (mínimo 44x44px) y nombres de usuario legibles en el header móvil.
- **Contenedores Flexibles:** Usar `w-full` y envolver tablas en `overflow-x-auto` con un `min-w` adecuado para asegurar legibilidad.
- **Viewport Height:** Usar `h-svh` para asegurar que el layout ocupe exactamente el alto visible del navegador en móviles, evitando el recorte por barras de herramientas.

## 8. Analíticas y Estadísticas (Umami)

Para el seguimiento de visitas y rendimiento sin comprometer la privacidad ni la velocidad:
- **CDN de Umami:** Utilizar exclusivamente Umami Analytics vía CDN.
- **Implementación:** Cargar el script en el `layout` raíz mediante el componente `next/script`.
- **Configuración:** Los valores deben provenir de variables de entorno:
  - `NEXT_PUBLIC_UMAMI_SCRIPT_URL`: URL del script (ej. `https://analytics.umami.is/script.js`).
  - `NEXT_PUBLIC_UMAMI_WEBSITE_ID`: ID único del sitio en el panel de Umami.

```tsx
// Ejemplo en app/layout.tsx
import Script from 'next/script'

<Script
  async
  src={process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL}
  data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
/>
```

## 9. Generación Automática de Slug

El campo `slug` de la tabla `products` **nunca se pide al usuario**. Se genera automáticamente en el Server Action a partir del nombre.

```typescript
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/gu, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
```

**Al crear:** se agrega un sufijo aleatorio de 8 chars (UUID slice) para garantizar unicidad:
```typescript
const baseSlug = generateSlug(name);
const uniqueSlug = baseSlug
  ? `${baseSlug}-${crypto.randomUUID().slice(0, 8)}`
  : crypto.randomUUID();
// → incluir slug: uniqueSlug en el .insert(...)
```

**Al actualizar:** se regenera usando los primeros 8 chars del `productId` como sufijo estable:
```typescript
const baseSlug = generateSlug(name);
const updatedSlug = baseSlug
  ? `${baseSlug}-${productId.slice(0, 8)}`
  : productId;
// → incluir slug: updatedSlug en el .update(...)
```

## 10. Arquitectura de Rutas e Imports
- **Path Aliases:** Utilizar siempre `@/` para imports internos para evitar errores de resolución de rutas en estructuras profundas del App Router.
- **Revalidación:** Todo Server Action que modifique datos debe llamar a `revalidatePath` para las rutas afectadas (Dashboard y Lista principal) para asegurar sincronización inmediata.
- **Regex Unicode:** Usar siempre la notación de escape `̀-ͯ` (no caracteres literales) para compatibilidad entre entornos.
