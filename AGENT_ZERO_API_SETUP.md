# Configuración de API Keys para Agent Zero

## Problema Identificado

Agent Zero está mostrando errores de autenticación 401 porque no tiene configuradas las credenciales de API para OpenRouter:

```
litellm.exceptions.AuthenticationError: AuthenticationError: OpenrouterException - {"error":{"message":"No auth credentials found","code":401}}
```

## Solución

### 1. Obtener API Key de OpenRouter

1. Visita [OpenRouter.ai](https://openrouter.ai/)
2. Crea una cuenta o inicia sesión
3. Ve a la sección de API Keys
4. Genera una nueva API key
5. Copia la API key generada

### 2. Configurar las Variables de Entorno

Para resolver los errores de autenticación, necesitas configurar las siguientes variables de entorno en el contenedor `agent-zero-abogado`:

```bash
# Variables de entorno requeridas
OPENROUTER_API_KEY=tu_api_key_aqui
LITELLM_LOG=DEBUG  # Opcional: para debugging
```

### 3. Opciones de Configuración

#### Opción A: Recrear el contenedor con variables de entorno

```bash
# Detener el contenedor actual
docker stop agent-zero-abogado

# Ejecutar con las variables de entorno
docker run -d \
  --name agent-zero-abogado \
  -p 8081:80 \
  -p 2223:22 \
  -p 9001:9000 \
  -e OPENROUTER_API_KEY=tu_api_key_aqui \
  -e LITELLM_LOG=DEBUG \
  frdel/agent-zero:latest
```

#### Opción B: Usar archivo .env

1. Crear un archivo `.env` con las credenciales:
```bash
OPENROUTER_API_KEY=tu_api_key_aqui
LITELLM_LOG=DEBUG
```

2. Ejecutar el contenedor con el archivo .env:
```bash
docker run -d \
  --name agent-zero-abogado \
  -p 8081:80 \
  -p 2223:22 \
  -p 9001:9000 \
  --env-file .env \
  frdel/agent-zero:latest
```

#### Opción C: Modificar docker-compose.yml

Agregar la configuración del contenedor agent-zero al docker-compose.yml:

```yaml
version: '3.8'

services:
  legal-case-generator:
    build: .
    ports:
      - "3002:3002"
    environment:
      - NODE_ENV=production
      - PORT=3002
      - AGENT_ZERO_URL=http://agent-zero:80
    volumes:
      - ./src:/app/src
      - ./public:/app/public
    restart: unless-stopped
    container_name: legal-case-generator-app
    depends_on:
      - agent-zero

  agent-zero:
    image: frdel/agent-zero:latest
    container_name: agent-zero-abogado
    ports:
      - "8081:80"
      - "2223:22"
      - "9001:9000"
    environment:
      - OPENROUTER_API_KEY=${OPENROUTER_API_KEY}
      - LITELLM_LOG=DEBUG
    restart: unless-stopped
```

### 4. Verificar la Configuración

Después de aplicar cualquiera de las opciones anteriores:

1. Verificar que el contenedor esté ejecutándose:
```bash
docker ps | findstr agent-zero
```

2. Verificar las variables de entorno:
```bash
docker exec agent-zero-abogado env | findstr OPENROUTER
```

3. Revisar los logs para confirmar que no hay más errores de autenticación:
```bash
docker logs agent-zero-abogado --tail 50
```

### 5. Modelos Alternativos

Si no quieres usar OpenRouter, puedes configurar Agent Zero para usar otros proveedores:

- **OpenAI**: `OPENAI_API_KEY`
- **Anthropic**: `ANTHROPIC_API_KEY`
- **Google**: `GOOGLE_API_KEY`
- **Local models**: Configurar Ollama u otros proveedores locales

### Notas Importantes

- ⚠️ **Nunca compartas tu API key públicamente**
- 💰 **OpenRouter cobra por uso** - revisa los precios antes de usar
- 🔄 **Los errores actuales no afectan la funcionalidad básica** de Agent Zero, solo las extensiones de memoria
- 📝 **Guarda tu API key de forma segura** usando un gestor de contraseñas

### Estado Actual

Agent Zero funciona correctamente para las consultas básicas, pero las extensiones de memoria (`memorize_solutions`, `memorize_fragments`) fallan debido a la falta de credenciales de API. Una vez configuradas las credenciales, estas funcionalidades adicionales funcionarán sin problemas.