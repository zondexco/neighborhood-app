# Neighborhood App

Aplicación móvil y web de Neighborhood construida con Expo Router.

## Requisitos

- Node.js 20+
- Bun 1.3+
- Xcode 15+ (iOS)
- Android Studio (Android)

## Configuración

1. Copia variables de entorno:

```bash
cp .env.example .env
```

2. Ajusta backend objetivo:

- `EXPO_PUBLIC_API_TARGET=development|production`
- `EXPO_PUBLIC_API_URL_DEV` y `EXPO_PUBLIC_API_URL_PROD`
- `EXPO_PUBLIC_API_URL` (opcional) fuerza una URL específica

## Ejecutar

```bash
bun install
bun run ios
bun run android
bun run web
```

## Probar en tu Mac (rápido)

- iPhone físico (recomendado para pruebas reales):

```bash
bun run test:ios:device
```

Abre Expo Go en tu iPhone y escanea el QR (modo `--tunnel`, útil incluso fuera de la misma red).

- iPhone físico en misma red Wi‑Fi (menor latencia):

```bash
bun run test:ios:lan
```

- iOS Simulator en Mac:

```bash
bun run test:ios:sim
```

- Web en desarrollo:

```bash
bun run test:web
```

- Web en modo producción local (artefacto exportado):

```bash
bun run test:web:prod
```

## Build multiplataforma

- iOS y Android: usar EAS Build (`bunx eas build --platform ios|android`).
- Web estática: `bunx expo export --platform web`.

## Releases automáticos (GitHub Actions)

- Push a `main`: crea un release estable automáticamente.
- Push a `develop`: crea un pre-release de testing automáticamente.
- En `develop`, también genera y adjunta `app-preview.apk` (si configuras `EXPO_TOKEN` en GitHub Secrets).
- Workflow: [neighborhood-app/.github/workflows/branch-release.yml](.github/workflows/branch-release.yml)

## Auto-deploy Web a VPS

- Push a `main` o `develop`: build web y deploy directo al VPS (sin adjuntar `web-dist` a releases).
- Workflow: [neighborhood-app/.github/workflows/deploy-web-vps.yml](.github/workflows/deploy-web-vps.yml)
- Guía: [neighborhood-app/docs/deploy-web-vps.md](docs/deploy-web-vps.md)

### Secret requerido para APK

- En GitHub → Settings → Secrets and variables → Actions, crea:
	- `EXPO_TOKEN`: token de Expo/EAS (`bunx eas token:create`)

## Notas técnicas

- La sesión se persiste de forma segura con `expo-secure-store`.
- El refresh token se usa automáticamente ante `401` para renovar sesión.
- La navegación usa un solo flujo: `/(public)` para autenticación y `/(app)` para usuarios autenticados.
