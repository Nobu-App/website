# Capturas fieles de Nobu

Rótulo obligatorio junto a la escena:

**Interfaz en desarrollo · datos de demostración**

Son capturas del frontend real, montado con una cuenta y datos ficticios. Fuente: main `7e37386d90a88e621f54ae6b22847b82e6575e1d`. Día de la fixture: 19 de octubre de 2026; capturas: 15 de octubre. No representan el instalador público v1.6.1 ni una cuenta real.

## Qué usar

| Uso | Asset | Dimensiones | Peso |
|---|---|---|---|
| Contexto general | `calendario-general.jpg` | 1680×778 | 61,3 KiB |
| Calendario y cita | `certamen-general.jpg` | 1680×778 | 74,9 KiB |
| Calendario e inspector | `inspector-general.jpg` | 1680×778 | 79,0 KiB |
| Fuente, estado inicial | `fuente-general.jpg` | 1680×778 | 88,1 KiB |
| Inicio real | `inicio-general.jpg` | 1680×778 | 61,8 KiB |
| Ficha del curso | `curso-general.jpg` | 1680×778 | 59,3 KiB |
| Ventana compacta | `calendario-compacto.jpg` | 1024×720 | 47,3 KiB |
| Ventana compacta y cita | `certamen-compacto.jpg` | 1024×720 | 59,1 KiB |
| **Cita legible** | `certamen-cita.webp` | 350×380 | 31,9 KiB |
| **Fecha y evidencia legibles** | `inspector-evidencia.webp` | 400×478 | 36,9 KiB |
| Metadata del programa | `fuente-resumen.webp` | 400×550 | 28,0 KiB |
| **Dos citas completas** | `fuente-dos-citas.webp` | 400×418 | 33,0 KiB |
| Panel entero con dos citas | `fuente-panel-completo.webp` | 400×778 | 56,4 KiB |

La escena más clara combina contexto de calendario con un detalle de cita. `fuente-dos-citas.webp` viene de un desplazamiento real del panel: las dos citas se muestran completas, incluida «Hora por confirmar». `fuente-general.jpg` es el estado anterior al scroll y no muestra completa la segunda cita.

## Legibilidad comprobada a 500–700 CSS px

- Una ventana de 1680 px reducida a esas columnas conserva la composición, pero su texto de 13 px queda en **3,9–5,4 px**. No sirve para transmitir información que haya que leer.
- La captura compacta de 1024 px mejora la identificación de títulos y controles. Su texto base reducido queda en **6,3–8,9 px**: tampoco sustituye el detalle.
- Los tres recortes destacados se revisaron a **tamaño nativo**, centrados en escenarios de 500 y 700 px. Conservan la cita, hora, página y procedencia legibles sin ampliar sus píxeles.
- Usar `width: 100%; max-width: 350px` para la cita, y `max-width: 400px` para inspector/fuente. Una columna de 700 px no obliga a estirar la imagen a 700 px.
- En móvil, la explicación esencial debe existir como texto HTML exterior al marco o mediante una acción clara para ampliar la captura. No inventar una versión móvil de la aplicación.

Ejemplo de integración; el wrapper y su motion pertenecen a cada propuesta:

```html
<figure>
  <img
    src="/nobu-demo/inspector-evidencia.webp"
    width="400"
    height="478"
    style="width:100%;max-width:400px;height:auto"
    alt="Inspector de Nobu: Certamen 1, su fecha y la cita del programa en la página 2."
  >
  <figcaption>Interfaz en desarrollo · datos de demostración</figcaption>
</figure>
```

No cargar las trece imágenes a la vez. Elegir sólo los estados de la escena; declarar dimensiones para reservar espacio y diferir los que quedan fuera de la primera vista.

## Procedencia y preservación

`manifest.json` registra original → rectángulo `(x,y,width,height)` → dimensión final → SHA-256 y peso. Los JPG son copias idénticas de los originales. Los WebP son recortes rectangulares **sin pérdida**, sin reescalar, enfocar, recolorear, repintar ni inventar detalles. La igualdad exacta de píxeles decodificados se comprobó para los cinco recortes.

Los originales completos permanecen en el paquete de investigación, `research/evidence/nobu/`. La composición de QA y su generador están en `product-demo/asset-preview/` y `product-demo/prepare-assets.py` del mismo paquete. No se añadieron bordes nativos Tauri ni se alteró ningún componente del producto.

La UI real a 1024 px reemplaza el área central por el inspector. No colocar artificialmente ese inspector junto al calendario compacto y presentarlo como un estado de la app.
