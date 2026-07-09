// Opción A (recomendada por la rúbrica): IP de red local de la PC.
// OJO: si pruebas en un celular físico con Expo Go, "localhost" NO funciona,
// porque el celular busca su propio localhost, no el de tu computadora.
// Requiere que Windows Firewall permita el puerto 5678 (ver n8n/README.md).
//   Windows (PowerShell): ipconfig  -> busca "Dirección IPv4"
//   Mac/Linux: ifconfig o `ipconfig getifaddr en0`
// export const N8N_WEBHOOK_URL = 'http://192.168.68.100:5678/webhook/taxi-request';

// Opción B (usada ahora mismo): túnel público temporal con localtunnel,
// evita tocar el firewall de Windows. La URL cambia cada vez que reinicias
// el comando `npx localtunnel --port 5678` — si deja de responder, corre
// ese comando de nuevo y actualiza esta línea con la nueva URL impresa.
export const N8N_WEBHOOK_URL = 'https://sad-zebras-joke.loca.lt/webhook/taxi-request';
