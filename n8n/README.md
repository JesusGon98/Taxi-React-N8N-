# n8n — Taxi AI Dispatch

Flujo de automatización que recibe una solicitud de taxi en lenguaje
natural, la interpreta con un LLM, calcula el conductor disponible más
cercano y responde con los datos del viaje despachado.

## Nodos del flujo

| Nodo | Tipo | Función |
|---|---|---|
| **Webhook** | Trigger | Recibe `POST /webhook/taxi-request` con `{ "prompt": "..." }` desde la app móvil. |
| **IA - Agente Parser** | HTTP Request | Llama a la API de DeepSeek (`deepseek-chat`, formato compatible con OpenAI) y le pide que devuelva `{"origin": "...", "destination": "..."}` en JSON. |
| **Buscador de Conductores** | Code | Parsea la respuesta del LLM, ubica el origen en una tabla mock de zonas de Tijuana, calcula la distancia (fórmula haversine) a cada conductor disponible y selecciona al más cercano. Devuelve conductor, auto, placas, distancia y ETA. |
| **Respond to Webhook** | Respond | Regresa el JSON final a la app. |

Las zonas y conductores reconocidos son datos mock (no hay geocodificación
real ni GPS) — están definidos directamente en el código del nodo
"Buscador de Conductores" y pueden ampliarse ahí.

## Requisitos

- Docker y Docker Compose
- Una API key de un proveedor LLM compatible con el formato de OpenAI
  (por defecto: [DeepSeek](https://platform.deepseek.com/api_keys))

## Levantar el contenedor

```bash
cd n8n
docker compose up -d
```

Abre [http://localhost:5678](http://localhost:5678) y crea la cuenta de
owner la primera vez que entres.

## Importar y configurar el flujo

1. **Workflows → Import from File** → selecciona
   `n8n/workflows/taxi-ai-dispatch.json`.
2. Abre el nodo **IA - Agente Parser** → **Authentication** → crea una
   credencial tipo **Header Auth**:
   - Name: `Authorization`
   - Value: `Bearer TU_API_KEY`

   La credencial se guarda en la base de datos interna de n8n (volumen
   Docker `n8n_data`), nunca en el JSON del flujo ni en el repo.
3. Publica el flujo:
   - n8n 2.x: botón **Publish** (arriba a la derecha del editor).
   - Versiones clásicas: switch **Active**.

   Sin este paso el webhook no queda registrado y cualquier request
   devuelve `404 "webhook ... is not registered"`.

## Probar el webhook

```bash
curl -X POST http://localhost:5678/webhook/taxi-request \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Necesito un taxi de Zona Rio a Otay"}'
```

Respuesta esperada:

```json
{
  "origin": "Zona Rio",
  "destination": "Otay",
  "driver": { "name": "...", "car": "...", "plate": "..." },
  "distanceKm": 6.3,
  "etaMinutes": 11
}
```

El **Execution List** del editor muestra el detalle de cada ejecución,
nodo por nodo.

## Cambiar de proveedor de LLM

El nodo "IA - Agente Parser" es un HTTP Request genérico: para usar otro
proveedor (OpenAI, Gemini, Claude, Ollama, etc.) solo hay que cambiar la
URL, el header de autenticación y el `model` del body según la
documentación de esa API. El nodo "Buscador de Conductores" ya lee la
respuesta desde `choices[0].message.content` (formato estándar tipo
OpenAI) o desde `content` directamente si el proveedor responde distinto.

## Conectar desde un celular físico

`localhost` no es alcanzable desde el celular — usa la IP de red local de
la máquina que corre n8n:

- Windows: `ipconfig` → "Dirección IPv4"
- Mac/Linux: `ipconfig getifaddr en0` (o Preferencias de Red)

y actualiza `mobile-app/config.js` con
`http://<esa-ip>:5678/webhook/taxi-request`. La PC y el celular deben
estar en la misma red, y el firewall del sistema debe permitir conexiones
entrantes al puerto `5678`.

Si no es viable abrir el firewall (por ejemplo en una red donde no tienes
permisos de administrador), una alternativa es exponer el puerto con un
túnel temporal:

```bash
npx localtunnel --port 5678
```

y usar la URL pública que imprime en lugar de la IP local. La URL cambia
cada vez que se reinicia el comando.
