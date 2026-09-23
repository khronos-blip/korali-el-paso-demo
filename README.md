# El Paso Tienda Multimarca — demo local

Concepto editorial mobile-first para una tienda multimarca de Valencia. Es una **página web demo no oficial con compra simulada**: no consulta inventario, no calcula precios, no procesa pagos y no envía información.

## Hechos utilizados

- 25+ marcas nacionales e internacionales.
- Categorías verificadas: moda, accesorios, belleza/skincare, gourmet/café y eventos.
- Ubicación: Casa Spazio de Talenti, local 1, Trigal Centro, frente al Colegio Lisandro Ramírez, Valencia.
- Horario: lunes a viernes 10:00–17:00; sábado 10:00–16:00.
- WhatsApp público: <https://wa.link/3lvpqa>.
- Precios, stock, envíos, cobertura y políticas: **no verificados**, por eso toda cifra comercial aparece como `Por confirmar`.

## Fuentes públicas y activos

- Perfil oficial: <https://www.instagram.com/elpasotiendamultimarca/>
- Publicación pública de ubicación/tienda: <https://www.instagram.com/p/DPr8N4dD_AI/>
- Publicación pública de surtido/moda: <https://www.instagram.com/p/DU68_qelJV7/>
- Publicación pública de skincare: <https://www.instagram.com/p/DdSEeqBAfIf/>
- Canal público de contacto: <https://wa.link/3lvpqa>

Las imágenes colaborativas oficiales fueron entregadas localmente en `assets/images/elpaso-01.jpg` a `elpaso-08.jpg`. Sus metadatos no contienen URL de origen individual; se preservan sin retoque y se copian byte a byte a `public/assets/images/`. Los enlaces anteriores documentan las fuentes públicas verificables usadas para contrastar identidad, ubicación y categorías, sin afirmar una correspondencia no demostrada entre cada archivo y una publicación concreta.

## Funciones de la demo

- Búsqueda, filtros de categoría y catálogo de seis referencias visuales.
- Detalle de producto, favoritos y bolsa persistentes en `localStorage`.
- Cantidades, eliminación de artículos y total siempre `Por confirmar`.
- Simulación de retiro o consulta de entrega; la dirección es obligatoria para entrega.
- Confirmación local persistida, sin pagos, `fetch`, XHR, WebSocket ni envío de formularios.
- Diseño responsive con disclosure visible y rutas bajo `/demos/el-paso/`.

## Ejecutar localmente

No hay dependencias de aplicación ni llamadas de red. Para QA automatizado:

```bash
npm run qa:structural
npm run qa:browser
# o ambos
npm run qa
```

`qa:browser` levanta un servidor efímero en loopback, sirve la demo con el prefijo real y lo cierra al terminar. Las capturas se guardan en `qa/screenshots/` y el reporte en `qa/report.json`.

## Rutas de Cloudflare preparadas (sin desplegar)

`wrangler.jsonc` declara únicamente:

- `koralidigital.com/demos/el-paso/*`
- `www.koralidigital.com/demos/el-paso/*`

`worker.js` limita el alcance a `/demos/el-paso`, retira el prefijo para resolver los Static Assets y devuelve 404 fuera de ese espacio. No se ejecutó despliegue ni se creó repositorio remoto.

## Checklist QA

El script estructural valida sintaxis JS, disclosure, 6 productos, 8 imágenes originales y públicas idénticas, referencias de activos, ausencia de dependencias remotas/APIs de red, persistencia, validación de dirección y las dos rutas Wrangler.

El script de navegador valida en escritorio y móvil: carga sin errores, cero solicitudes fuera de loopback, búsqueda, categorías, detalle, favorito, bolsa con dos artículos, cantidades, persistencia tras recarga, bloqueo de entrega sin dirección, confirmación local, ausencia de overflow horizontal y capturas de catálogo/detalle/bolsa/confirmación.

## Demo pública

- [https://koralidigital.com/demos/el-paso/](https://koralidigital.com/demos/el-paso/)
- Demo conceptual no oficial; no procesa compras, pagos ni formularios reales.
