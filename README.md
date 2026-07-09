# Taxi AI — Integración n8n + React Native (Expo)

> 🔗 **Repositorio:** reemplaza esta línea con el link clickable a tu repo
> de GitHub (debe ir también al inicio del PDF de entrega).
> Ejemplo: https://github.com/tu-usuario/taxi-ai-n8n

Actividad práctica que conecta una app móvil (React Native / Expo) con un
flujo de automatización local en n8n que usa un LLM para interpretar una
solicitud de taxi en lenguaje natural, calcula el conductor disponible más
cercano y devuelve el viaje despachado.

## Estructura del repo

```
n8n/                        # Infraestructura de automatización
  docker-compose.yml         # Levanta n8n en localhost:5678
  workflows/
    taxi-ai-dispatch.json    # Flujo importable: Webhook -> IA Parser -> Buscador de Conductores -> Respond
  README.md                  # Instrucciones detalladas de n8n

mobile-app/                 # App Expo (React Native)
  App.js                     # Pantallas: Solicitud, Loading, Confirmación
  config.js                  # URL del webhook de n8n (IP local de red)
  ...
```

## Guía rápida

1. **Levanta n8n** — ver [`n8n/README.md`](n8n/README.md) para el paso a
   paso completo (docker compose, importar el flujo, configurar la
   credencial del LLM, activar el flujo).
2. **Configura la IP local** en [`mobile-app/config.js`](mobile-app/config.js)
   con la IP de red de la PC que corre n8n (no `localhost`, ver tip de
   conectividad abajo).
3. **Corre la app:**
   ```bash
   cd mobile-app
   npm install
   npx expo start
   ```
   Escanea el QR con **Expo Go** desde tu celular (misma red Wi-Fi que la
   PC).
4. Escribe una solicitud, por ejemplo: *"Necesito un taxi de Zona Río a
   Otay"*, y verifica que la app muestre el conductor asignado, el auto,
   la distancia y el ETA.

## 💡 Tip de conectividad

La app móvil no puede conectarse a `localhost` si estás probando en un
teléfono físico con Expo Go. Levanta n8n con la IP de tu red local (ej.
`http://192.168.1.34:5678/webhook/taxi-request`) y verifica que la PC y el
celular estén conectados a la **misma red Wi-Fi**.

## ✅ Checklist de evidencias para el PDF de entrega

- [ ] Link clickable al repositorio de GitHub al inicio del PDF.
- [ ] Captura de n8n con el flujo completo, el switch **Active** encendido
      y el **Execution List** mostrando una ejecución exitosa a través de
      los 4 nodos.
- [ ] Captura de la app **antes** de enviar la petición (pantalla de
      solicitud con el input).
- [ ] Captura de la app **con el resultado** del viaje despachado
      (conductor, auto, distancia, ETA) recibido dinámicamente desde n8n.
- [ ] Repo en GitHub público, con `.gitignore` correcto (sin
      `node_modules/` ni `.expo/`) y con historial de commits
      descriptivos incrementales.
