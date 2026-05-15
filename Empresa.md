# CONTEXTO DE PROYECTO — SitioHoy

> **Instrucción para la IA:** Este documento es el contexto base del proyecto SitioHoy. Leelo completo antes de responder cualquier consulta. Si la tarea requiere decisiones técnicas o de negocio, basate en la arquitectura, stack y reglas descritas acá. Si algo no está cubierto, preguntá antes de asumir.

---

## 1. Qué es SitioHoy

SitioHoy es una **SaaS argentina en etapa de validación de mercado** que vende suscripciones mensuales de páginas web profesionales para negocios, emprendimientos y profesionales independientes.

**Propuesta de valor:** Una página web profesional que en el mercado sale en promedio ~$500.000 ARS, entregada a un precio bajo de suscripción mensual y en solo 24 horas. Sin los costos altísimos de agencias/freelancers, y sin la curva de aprendizaje y el tiempo que requieren plataformas DIY como Empretienda o Tiendanube donde el usuario tiene que armarse la página solo.

**Modelo de negocio:** Suscripción mensual recurrente. El cliente paga el primer mes como única inversión inicial (sin cargos extra de setup). Sin permanencia mínima. Si cancela, el sitio se desactiva al finalizar el período pagado.

**Diferenciación:**
- **vs. Agencias/Freelancers:** Ellos cobran $300k–$800k ARS de entrada + semanas de espera. SitioHoy cobra solo el primer mes de suscripción y entrega en 24hs.
- **vs. Plataformas DIY (Empretienda, Tiendanube, Wix):** El cliente no tiene que aprender a usar ninguna herramienta ni dedicar su tiempo a armar la web. SitioHoy la arma por él.
- Todo incluido en el plan: hosting, diseño, soporte, SSL. Cambios siempre incluidos.

---

## 2. Flujo de venta y entrega

```
CONTACTO → PRESENTACIÓN → ELECCIÓN → DATOS → ENTREGA → SUSCRIPCIÓN ACTIVA
```

1. **Contacto:** El cliente llega vía landing page (sitiohoy.com.ar) → WhatsApp, o se lo contacta con outbound por WhatsApp directo.
2. **Presentación:** Se le muestran **3 diseños de página web** especializados para su rubro/negocio.
3. **Elección:** El cliente elige uno de los 3 diseños.
4. **Datos:** El cliente envía textos, fotos, datos del negocio e imágenes.
5. **Entrega:** En **24 horas** desde que envía la información, la web está online.
6. **Suscripción:** Se activa el cobro mensual automático con tarjeta. El mecanismo exacto está en definición (posiblemente link de suscripción de MercadoPago), pero sí o sí será cobro recurrente automático con tarjeta.

---

## 3. Planes y precios (ARS — Abril 2026)

| Característica | Esencial ($25.000/mes) | Emprendimiento ($37.000/mes) | Empresa ($65.000/mes) |
|---|---|---|---|
| Tipo de sitio | Dinámico con base de datos | Dinámico con base de datos | Dinámico con panel maestro |
| Catálogo | Hasta 50 productos/servicios | Hasta 200 productos | Ilimitado |
| Diseño responsive | Sí | Sí | Sí |
| Contacto WhatsApp | Sí (+ redirección a WhatsApp desde productos) | Sí | Sí |
| Cobros online | No (redirección a WhatsApp para coordinar) | MercadoPago + cuotas | MercadoPago + posiblemente otras pasarelas |
| Envíos | No | Valores fijos por zona | Automatizados con tarifa de correo |
| Estadísticas | No | Visitas y tráfico | Conversiones y analítica avanzada |
| Autogestión (admin) | Fotos, textos de productos/servicios | Tienda 100% autogestionable | Control total sin límites |
| Soporte | Asistencia en 48hs | Asistencia en 24hs | Atención prioritaria en el día |

**Incluido en todos los planes sin cargo:** Diseño profesional, asesoramiento personalizado, certificado SSL, gestión de dominio (el costo del dominio lo paga el cliente).

**Dominio:** El costo del dominio lo paga el cliente. SitioHoy puede gestionar la compra y tenerlo a su nombre si el cliente lo prefiere, pero el pago es siempre del cliente. Si el cliente ya tiene dominio, se conecta sin problema.

---

## 4. Stack técnico

### Core
| Capa | Tecnología | Uso |
|---|---|---|
| Framework web (clientes) | **Next.js** | Cada sitio de cliente es un proyecto Next.js |
| Hosting/Deploy | **Vercel** | 1 deploy por cliente (proyecto independiente) |
| Base de datos | **Supabase** | Multi-tenant — todos los clientes en una misma instancia con aislamiento por tenant |
| Storage | **Supabase Storage** | Imágenes y archivos de cada cliente |
| CDN / DNS / Seguridad | **Cloudflare** | Dominio, SSL, cache, protección |
| Emails transaccionales | **Resend** | Notificaciones, emails del sistema |
| Analytics | **Umami** | Métricas de visitas para los clientes |
| Pagos | **MercadoPago** | Cobro de suscripciones de SitioHoy y pagos en tiendas de clientes (Emprendimiento/Empresa). En el plan Empresa, podrían sumarse otras pasarelas de pago además de MercadoPago |

### Arquitectura de despliegue
- **Landing de SitioHoy:** sitiohoy.com.ar (proyecto independiente).
- **Sitios de clientes:** Cada cliente tiene su propio proyecto en Vercel con su dominio.
- **Multi-tenancy:** Vive en Supabase — cada tenant (cliente) tiene sus datos aislados en la misma base. No es multi-tenant a nivel de Vercel/Next.js (no es monorepo con rutas dinámicas).
- **Admin panel:** Existe un prototipo funcional. Está en definición la versión final. El panel escala en funcionalidades según el plan del cliente (Esencial = edición básica de fotos/textos; Emprendimiento = gestión de tienda completa; Empresa = control total).

### Patrones importantes
- **Todos los planes** conectan a Supabase (todos tienen base de datos). La diferencia es la cantidad de productos/servicios y funcionalidades del admin.
- Los sitios de **Emprendimiento** y **Empresa** tienen cobros online integrados con MercadoPago; **Esencial** redirige a WhatsApp.
- MercadoPago se usa tanto para cobrar la suscripción de SitioHoy como para procesar pagos dentro de las tiendas de los clientes (planes Emprendimiento y Empresa). En el plan Empresa podrían sumarse otras pasarelas.

---

## 5. Equipo y etapa

- **Equipo:** 3 personas.
- **Etapa:** Pre-lanzamiento / validación de mercado.
- **Mercado inicial:** Ciudad de Baradero, Provincia de Buenos Aires, Argentina. La expansión es primero a nivel Argentina.
- **Clientes actuales (portfolio):** Gilded Glow Skin (skincare), Milan Bar (gastronomía), Matias Ezeordu (portfolio personal).
- **Canal de adquisición actual:** Landing page → WhatsApp + outbound directo por WhatsApp. El plan es escalar a ads + formularios + otros canales a medida que se valide.

---

## 6. Sitio principal — sitiohoy.com.ar

La landing page de SitioHoy incluye:
- **Hero** con propuesta de valor, precio y CTA a WhatsApp.
- **Sección problema/solución:** Contraste entre depender solo de redes vs. tener web propia.
- **Comparación de costos:** Agencia/freelancer vs. SitioHoy.
- **Cómo funciona:** 3 pasos (elegí diseño → enviá info → en 24hs estás online).
- **Social proof:** Logos de clientes, métricas (sitios lanzados, horas de entrega, satisfacción).
- **Planes y precios:** 3 columnas con detalle de cada plan.
- **FAQ:** Cancelación, dominio, pago, tipos de página.
- **Gamificación:** Ruleta de descuento para visitantes (genera urgencia y captura leads).
- **Urgencia:** Contador de lugares disponibles por semana y timer de cierre.

---

## 7. Reglas para IAs que trabajen en este proyecto

### Al generar código:
- Framework: **Next.js** (App Router salvo que se indique lo contrario).
- Styling: Definir según el proyecto (Tailwind CSS es el default recomendado).
- Base de datos: Siempre considerar la arquitectura **multi-tenant de Supabase** — nunca hacer queries sin filtrar por tenant.
- Pagos: Integrar con **MercadoPago** (no Stripe, no PayPal — mercado argentino).
- Analytics: **Umami** (self-hosted o cloud), no Google Analytics.
- Emails: **Resend**, no SendGrid, no Mailgun.
- Deploy: **Vercel**, no Netlify, no AWS directamente.

### Al generar contenido / copy:
- Tono: Directo, cercano, sin tecnicismos. Hablamos de "vos" (español rioplatense argentino).
- Público: Dueños de negocios pequeños, emprendedores, profesionales independientes que NO son técnicos.
- Dolor principal: "Mi negocio solo existe en redes y pierdo clientes por no tener web."
- Promesa: Web profesional en 24hs, todo incluido, sin sorpresas.
- Moneda: Siempre ARS (pesos argentinos). Si hay precios en USD, aclarar equivalencia.

### Al analizar negocio / estrategia:
- Estamos en **validación**, no en escala. Las decisiones deben priorizar velocidad de ejecución y aprendizaje por sobre perfección técnica.
- El mercado inicial es **hiperlocal** (Baradero, ~35.000 habitantes). Las estrategias deben considerar este tamaño.
- La competencia directa no son otras SaaS internacionales (Wix, Squarespace) sino: (1) la **inacción** del cliente, (2) las **agencias/freelancers locales** (caras y lentas), y (3) las **plataformas DIY** como Empretienda o Tiendanube (donde el cliente tiene que armarse la página solo y dedicar tiempo a aprender).

---

## 8. Decisiones pendientes / En definición

Estas son áreas donde todavía no hay decisión final. Si una tarea toca alguno de estos puntos, la IA debe preguntar antes de asumir:

- **Mecanismo de cobro de suscripción:** Será cobro automático con tarjeta sí o sí, posiblemente vía link de suscripción de MercadoPago, pero no está 100% definido.
- **Admin panel definitivo:** Existe prototipo, pero falta definir alcance final por plan y UX.
- **Escalabilidad del deploy:** Hoy es 1 proyecto Vercel por cliente. Puede migrar a monorepo multi-tenant en el futuro.
- **Automatización de onboarding:** Hoy el proceso es manual (WhatsApp). Se planea automatizar.
- **Estructura de templates:** Cómo se organizan y mantienen las plantillas base que se le muestran al cliente.
- **Pricing en expansión:** Los precios actuales son para validación en Baradero. Pueden ajustarse.
- **Pasarelas adicionales en plan Empresa:** Posiblemente se sumen otros métodos de pago además de MercadoPago, pero no está definido cuáles.

---

## 9. Cómo usar este documento

**Para tareas de código:** Compartí este documento + la descripción de la tarea específica.
**Para tareas de contenido/marketing:** Compartí este documento + el canal y objetivo del contenido.
**Para tareas de estrategia/negocio:** Compartí este documento + la pregunta o decisión concreta.
**Para tareas de diseño:** Compartí este documento + wireframes o referencias visuales si las hay.

> **Última actualización:** Abril 2026 — Etapa de pre-lanzamiento.