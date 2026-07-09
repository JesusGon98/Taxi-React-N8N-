# n8n — Taxi AI Dispatch

Flujo de automatización local que recibe una solicitud de taxi en lenguaje
natural, la procesa con un LLM para extraer origen/destino, busca al
conductor disponible más cercano y responde con los datos del viaje.

## 1. Levantar el contenedor

```bash
cd n8n
docker compose up -d
```

Abre [http://localhost:5678](http://localhost:5678) y crea la cuenta de
owner (usuario/contraseña) la primera vez que entres.

## 2. Importar el flujo

1. En n8n, ve a **Workflows → Import from File**.
2. Selecciona `n8n/workflows/taxi-ai-dispatch.json`.
3. Se importarán 4 nodos conectados:
   - **Webhook** — trigger que recibe el `POST` de la app móvil en
     `/webhook/taxi-request` con el body `{ "prompt": "..." }`.
   - **IA - Agente Parser** — nodo HTTP Request que llama a un LLM y le
     pide que devuelva `{"origin": "...", "destination": "..."}`.
   - **Buscador de Conductores** — nodo Code que calcula (fórmula
     haversine) la distancia del origen a cada conductor de una base mock
     y selecciona al más cercano, calculando distancia y ETA.
   - **Respond to Webhook** — devuelve el JSON final a la app.

## 3. Configurar la credencial del LLM

El nodo **IA - Agente Parser** está configurado para llamar a la API de
**DeepSeek** (`https://api.deepseek.com/chat/completions`, formato
compatible con OpenAI, modelo `deepseek-chat`).

1. Abre el nodo **IA - Agente Parser** → **Authentication** → crea una
   credencial nueva tipo **Header Auth** con:
   - Name: `Authorization`
   - Value: `Bearer TU_DEEPSEEK_API_KEY`
2. Guarda y selecciona esa credencial en el nodo.

**Nunca pongas tu API key directamente en el JSON del flujo ni en ningún
archivo del repo** — ese repo va a ser público. La credencial vive
únicamente dentro de la base de datos interna de n8n (el volumen Docker
`n8n_data`), no se exporta al hacer `Import/Export from File`.

Si prefieres otro proveedor (OpenAI, Gemini, Claude, Ollama, etc.), cambia
la URL, el header de autenticación y el `jsonBody` del nodo según la
documentación de esa API. La lógica del resto del flujo no cambia, porque
el nodo "Buscador de Conductores" ya sabe leer el texto de respuesta del
modelo desde `choices[0].message.content` (formato estándar tipo OpenAI) o
desde `content` directamente si tu proveedor responde distinto.

## 4. Activar el flujo y probar

1. Activa el flujo. Según tu versión de n8n verás uno de estos dos:
   - Versiones clásicas: switch **Active** arriba a la derecha del editor.
   - Versiones nuevas (n8n 2.x): botón **Publish** arriba a la derecha
     (junto al ícono de reloj). Dale clic — sin publicar, el webhook no
     queda registrado y verás el error `"webhook ... is not registered"`.
2. Prueba con `curl` o Postman:

```bash
curl -X POST http://localhost:5678/webhook/taxi-request \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Necesito un taxi de Zona Rio a Otay"}'
```

Deberías recibir algo como:

```json
{
  "origin": "Zona Rio",
  "destination": "Otay",
  "driver": { "name": "...", "car": "...", "plate": "..." },
  "distanceKm": 6.3,
  "etaMinutes": 11
}
```

3. Revisa el **Execution List** de n8n para confirmar que la ejecución
   pasó exitosamente por los 4 nodos (esta es una de las capturas
   obligatorias del PDF de evidencias).

## 5. Conectar la app móvil (celular físico + Expo Go)

`localhost` **no funciona** desde el celular. Necesitas la IP de red local
de la PC donde corre Docker:

- Windows: `ipconfig` → busca "Dirección IPv4" (ej. `192.168.1.34`)
- Mac/Linux: `ipconfig getifaddr en0` (o revisa Preferencias de Red)

Actualiza `mobile-app/config.js` con:

```js
export const N8N_WEBHOOK_URL = 'http://192.168.1.34:5678/webhook/taxi-request';
```

Asegúrate de que la PC y el celular estén en la **misma red Wi-Fi**, y que
el firewall de Windows permita conexiones entrantes al puerto `5678`.
