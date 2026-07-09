# Taxi AI

> 🔗 **Repositorio:** https://github.com/tu-usuario/taxi-ai-n8n

Despacho de taxis por lenguaje natural: una app móvil (React Native /
Expo) le pide un viaje a un flujo de automatización (n8n) usando una
frase normal como *"necesito un taxi de Zona Río a Otay"*. Un LLM
interpreta la solicitud, un motor de distancia asigna al conductor
disponible más cercano, y la app recibe y muestra el viaje despachado.

## Cómo funciona

```
App móvil (Expo)
   │  POST { prompt: "..." }
   ▼
n8n · Webhook
   │
   ▼
n8n · IA - Agente Parser  ──▶  LLM (DeepSeek, API compatible con OpenAI)
   │  { origin, destination }
   ▼
n8n · Buscador de Conductores
   │  calcula distancia (haversine) contra una base mock de conductores
   │  y selecciona al más cercano
   ▼
n8n · Respond to Webhook
   │  { origin, destination, driver, distanceKm, etaMinutes }
   ▼
App móvil — pantalla de confirmación
```

## Estructura del repo

```
n8n/
  docker-compose.yml         Levanta n8n en localhost:5678
  workflows/
    taxi-ai-dispatch.json    Flujo importable con los 4 nodos de arriba
  README.md                  Documentación del flujo de n8n

mobile-app/
  App.js                     Pantallas: Solicitud, Loading, Confirmación
  config.js                  URL del webhook de n8n al que apunta la app
```

## Stack

- **App móvil:** React Native + Expo (SDK 54)
- **Automatización:** n8n (self-hosted, Docker)
- **LLM:** DeepSeek (`deepseek-chat`, API compatible con OpenAI) — el nodo
  del parser acepta cualquier proveedor compatible con ese formato
  (OpenAI, Gemini, Claude, Ollama, etc.)
- **Matching de conductores:** fórmula de distancia haversine sobre una
  base mock de zonas y conductores de Tijuana

## Puesta en marcha

1. **n8n** — ver [`n8n/README.md`](n8n/README.md): levantar el
   contenedor, importar el flujo, configurar la credencial del LLM y
   publicar/activar el workflow.
2. **App móvil:**
   ```bash
   cd mobile-app
   npm install
   npx expo start
   ```
   Escanea el QR con **Expo Go**. El celular necesita alcanzar la IP
   donde corre n8n — ver la sección de conectividad en
   [`n8n/README.md`](n8n/README.md) si estás en un celular físico.
3. Configura `mobile-app/config.js` con la URL de tu webhook de n8n.
