# Guía de Deployment a Cloudflare Pages

## Prerrequisitos

1. **Cuenta de Cloudflare**: Necesitas una cuenta en [Cloudflare](https://cloudflare.com)
2. **Wrangler CLI**: Instala la herramienta de línea de comandos de Cloudflare

```bash
npm install -g wrangler
```

## Configuración Inicial

### 1. Autenticación con Cloudflare

```bash
# Iniciar sesión en Cloudflare
npm run cf:login

# Verificar que estás autenticado
npm run cf:whoami
```

### 2. Configurar Variables de Entorno

1. Copia el archivo `.env.example` a `.env`
2. Completa las variables necesarias:
   - `CLOUDFLARE_ACCOUNT_ID`: Tu Account ID de Cloudflare
   - `CLOUDFLARE_ZONE_ID`: Tu Zone ID (si tienes un dominio personalizado)
   - Todas las demás variables de la aplicación

### 3. Actualizar wrangler.toml

Edita el archivo `wrangler.toml` y reemplaza:
- `YOUR_ACCOUNT_ID` con tu Account ID real
- `YOUR_ZONE_ID` con tu Zone ID real (opcional)
- Las variables de entorno con tus valores reales

## Deployment

### Opción 1: Deploy Automático

```bash
# Deploy a producción
npm run deploy:cloudflare

# Deploy a desarrollo
npm run deploy:cf-dev
```

### Opción 2: Deploy Manual

```bash
# 1. Construir la aplicación
npm run build

# 2. Deploy con wrangler
wrangler pages deploy dist --project-name ai-law-replicator
```

## Configuración de Dominio (Opcional)

Si tienes un dominio personalizado:

1. Ve a Cloudflare Dashboard > Pages
2. Selecciona tu proyecto
3. Ve a "Custom domains"
4. Añade tu dominio

## Variables de Entorno en Cloudflare

Para configurar las variables de entorno en Cloudflare Pages:

1. Ve a Cloudflare Dashboard > Pages
2. Selecciona tu proyecto
3. Ve a "Settings" > "Environment variables"
4. Añade todas las variables de tu archivo `.env`

## Funciones Serverless

Las funciones en `/workers/` se deployarán automáticamente como Cloudflare Workers y estarán disponibles en:
- `/api/upload` - Para subir archivos
- `/api/delete` - Para eliminar archivos

## Notas Importantes

- **Almacenamiento**: Las funciones actuales simulan el almacenamiento. Para producción real, configura Cloudflare R2
- **CORS**: Las funciones ya incluyen headers CORS configurados
- **Límites**: Cloudflare Workers tiene límites de CPU y memoria. Revisa la documentación oficial

## Troubleshooting

### Error de autenticación
```bash
wrangler auth login
```

### Error de permisos
Verifica que tu cuenta tenga permisos para crear Pages y Workers

### Variables de entorno no funcionan
Asegúrate de configurarlas tanto en el archivo `.env` local como en el dashboard de Cloudflare

## Enlaces Útiles

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)