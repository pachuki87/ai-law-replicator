# 🐳 Docker + Ngrok Setup para AI Law Replicator

Esta guía te ayudará a ejecutar **AI Law Replicator** en Docker con soporte completo para **ngrok**.

## 🚀 Inicio Rápido

### Opción 1: Sin ngrok (Solo local)
```bash
docker-compose up
```
La aplicación estará disponible en: `http://localhost:5173`

### Opción 2: Con ngrok (Acceso público)
```bash
# Crear archivo .env con tu authtoken
echo "NGROK_AUTHTOKEN=tu_authtoken_aqui" > .env

# Iniciar con ngrok
docker-compose up
```

## 🔑 Configuración de Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# Configuración de ngrok (requerido para acceso público)
NGROK_AUTHTOKEN=tu_authtoken_de_ngrok
NGROK_REGION=us
NGROK_SUBDOMAIN=mi-app-legal

# Configuración de Agent Zero (opcional)
AGENT_ZERO_URL=http://172.17.0.4:80
```

## 📋 Comandos Disponibles

### Construcción
```bash
# Construir la imagen
docker-compose build

# Construir sin cache
docker-compose build --no-cache
```

### Ejecución
```bash
# Iniciar en primer plano
docker-compose up

# Iniciar en segundo plano
docker-compose up -d

# Ver logs
docker-compose logs -f
```

### Gestión
```bash
# Detener contenedores
docker-compose down

# Detener y eliminar volúmenes
docker-compose down -v

# Reiniciar servicio
docker-compose restart legal-case-generator
```

## 🌐 Comportamiento Inteligente

El contenedor detecta automáticamente si tienes configurado ngrok:

### ✅ Con NGROK_AUTHTOKEN configurado:
- Configura ngrok automáticamente
- Inicia la aplicación con túnel público
- Muestra la URL pública en los logs

### ❌ Sin NGROK_AUTHTOKEN:
- Inicia solo la aplicación local
- Disponible en `http://localhost:5173`
- No requiere configuración adicional

## 📊 Monitoreo y Logs

### Ver logs en tiempo real:
```bash
docker-compose logs -f legal-case-generator
```

### Logs típicos con ngrok:
```
legal-case-generator-app  | 🔧 Configurando ngrok...
legal-case-generator-app  | 🚀 Iniciando aplicación con ngrok...
legal-case-generator-app  | ✅ ¡Ngrok iniciado exitosamente!
legal-case-generator-app  | 🌐 URL pública: https://abc123.ngrok.io
legal-case-generator-app  | 🏠 URL local: http://localhost:5173
```

### Logs sin ngrok:
```
legal-case-generator-app  | 🚀 Iniciando aplicación sin ngrok...
legal-case-generator-app  | Local:   http://localhost:5173/
legal-case-generator-app  | Network: http://0.0.0.0:5173/
```

## 🔧 Configuración Avanzada

### Personalizar docker-compose.yml

```yaml
version: '3.8'

services:
  legal-case-generator:
    build: .
    ports:
      - "5173:5173"
    environment:
      - NODE_ENV=production
      - PORT=5173
      - NGROK_AUTHTOKEN=${NGROK_AUTHTOKEN:-}
      - NGROK_REGION=${NGROK_REGION:-us}
      - NGROK_SUBDOMAIN=${NGROK_SUBDOMAIN:-}
      # Agregar más variables según necesites
    volumes:
      - ./src:/app/src
      - ./public:/app/public
    restart: unless-stopped
```

### Usar con Docker Compose Override

Crea `docker-compose.override.yml` para desarrollo:

```yaml
version: '3.8'

services:
  legal-case-generator:
    environment:
      - NODE_ENV=development
      - NGROK_REGION=eu  # Cambiar región
    volumes:
      - ./:/app  # Montar todo el proyecto
    command: npm run dev  # Usar modo desarrollo
```

## 🛡️ Consideraciones de Seguridad

### ⚠️ Importante para Producción
- **No uses ngrok en producción** - Solo para desarrollo y demos
- **Protege tu authtoken** - No lo subas a repositorios públicos
- **Usa HTTPS** - ngrok proporciona HTTPS automáticamente

### 🔒 Mejores Prácticas
```bash
# Usar archivo .env (no versionado)
echo ".env" >> .gitignore

# Rotar authtokens regularmente
# Monitorear acceso desde dashboard de ngrok
```

## 🐛 Troubleshooting

### Error: "Puerto 5173 ya está en uso"
```bash
# Detener otros contenedores
docker-compose down

# Verificar puertos en uso
netstat -tulpn | grep 5173

# Cambiar puerto en docker-compose.yml si es necesario
```

### Error: "authtoken required"
```bash
# Verificar que el .env existe y tiene el token
cat .env

# Recrear contenedor
docker-compose down
docker-compose up --build
```

### Error: "Cannot connect to ngrok"
```bash
# Verificar conectividad
ping ngrok.com

# Probar token manualmente
docker run --rm -it node:20-alpine sh
npx ngrok config add-authtoken TU_TOKEN
npx ngrok http 3000
```

### La aplicación no carga
```bash
# Verificar logs del contenedor
docker-compose logs legal-case-generator

# Verificar que el puerto está expuesto
docker ps

# Probar acceso directo al contenedor
docker exec -it legal-case-generator-app sh
curl http://localhost:5173
```

## 📈 Optimización

### Reducir tiempo de construcción:
```dockerfile
# En Dockerfile, usar multi-stage build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
RUN npm run build
```

### Usar cache de Docker:
```bash
# Construir con cache
docker-compose build

# Limpiar cache si es necesario
docker builder prune
```

## 🔄 Integración con CI/CD

### GitHub Actions ejemplo:
```yaml
name: Build and Test Docker

on: [push, pull_request]

jobs:
  docker:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Docker image
        run: docker-compose build
        
      - name: Test container
        run: |
          docker-compose up -d
          sleep 30
          curl -f http://localhost:5173 || exit 1
          docker-compose down
```

## 📞 Soporte

### Enlaces útiles:
- [Docker Compose Docs](https://docs.docker.com/compose/)
- [Ngrok Docker Guide](https://ngrok.com/docs/using-ngrok-with/docker/)
- [Node.js Docker Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)

### Comandos de diagnóstico:
```bash
# Información del sistema
docker system info
docker-compose version

# Estado de contenedores
docker ps -a
docker-compose ps

# Uso de recursos
docker stats
```

---

¡Ahora puedes ejecutar **AI Law Replicator** en Docker con acceso público via ngrok! 🌍🐳