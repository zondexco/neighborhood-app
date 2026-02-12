# Auto-deploy Web a VPS

La app web se despliega automáticamente por push usando [ .github/workflows/deploy-web-vps.yml ](.github/workflows/deploy-web-vps.yml):

- Push a `develop` → build web y deploy a VPS (producción)
- Push a `main` → build web y deploy a VPS (producción)

## Secrets requeridos en GitHub

Siempre:

- `VPS_HOST` (IP o dominio)
- `VPS_USER` (usuario SSH)
- `VPS_PORT` (ej. `22`)

Autenticación (híbrido):

- Recomendado: `VPS_SSH_KEY`
- Fallback: `VPS_PASSWORD`

Opcional:

- `VPS_WEB_ROOT` (ruta destino, default: `/var/www/neighborhood-app`)

## Qué publica

- Ejecuta `bun run build:web` (export estático a `dist`)
- Empaqueta `dist` y lo sube al VPS
- Extrae en `VPS_WEB_ROOT`

## Nginx (ejemplo rápido)

```nginx
server {
  listen 80;
  server_name tu-dominio.com;

  root /var/www/neighborhood-app/dist;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

Recargar Nginx:

```bash
sudo nginx -t
sudo systemctl reload nginx
```
