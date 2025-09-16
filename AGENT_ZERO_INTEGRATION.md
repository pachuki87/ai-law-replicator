# Integración con Agent Zero Abogados

## Descripción

Esta aplicación ahora está integrada con **Agent Zero Abogados**, permitiendo acceso directo a análisis legal avanzado y consultas especializadas desde el generador de casos legales.

## Características de la Integración

### 🤖 Conexión Directa
- Comunicación en tiempo real con Agent Zero Abogados
- Verificación automática de conexión
- Manejo de errores y reconexión automática

### 📋 Tipos de Consulta
1. **Consulta Legal**: Preguntas generales sobre derecho
2. **Análisis de Caso**: Análisis detallado de casos generados
3. **Revisión de Documento**: Revisión de documentos legales

### 🔧 Funcionalidades
- Envío de consultas personalizadas
- Análisis automático de casos generados
- Historial de respuestas
- Indicador de estado de conexión

## Configuración

### Variables de Entorno

En el archivo `.env`, configura:

```env
# Agent Zero Abogados Integration
VITE_AGENT_ZERO_URL=http://localhost:8081
```

### Docker

La aplicación está configurada para conectarse automáticamente al contenedor Agent Zero existente:

```yaml
# docker-compose.yml
services:
  legal-case-generator:
    environment:
      - AGENT_ZERO_URL=http://172.17.0.4:80
    # Nota: El contenedor Agent Zero mapea el puerto 80 interno al 8081 del host
```

## Uso

### 1. Verificar Conexión

Al abrir la aplicación, verás un indicador de estado:
- 🟢 **Conectado**: Agent Zero está disponible
- 🔴 **Desconectado**: Verificar que el contenedor esté ejecutándose

### 2. Realizar Consultas

1. Selecciona el tipo de consulta:
   - Consulta Legal
   - Análisis de Caso
   - Revisión de Documento

2. Escribe tu consulta en el área de texto

3. Haz clic en "Enviar Consulta"

### 3. Análisis Automático

Cuando generes un caso legal, puedes:
- Hacer clic en "Analizar Caso" para obtener análisis de Agent Zero
- Las respuestas aparecerán en tiempo real
- Se mantiene un historial de todas las interacciones

## Comandos Docker

### Verificar Contenedores
```bash
docker ps
```

### Iniciar la Aplicación
```bash
docker-compose up -d
```

### Ver Logs
```bash
docker-compose logs -f legal-case-generator
```

### Detener la Aplicación
```bash
docker-compose down
```

## Arquitectura de la Integración

```
┌─────────────────────┐    HTTP/REST    ┌─────────────────────┐
│                     │ ──────────────► │                     │
│  Legal Case         │                 │  Agent Zero         │
│  Generator          │                 │  Abogados           │
│  (Puerto 3002)      │ ◄────────────── │  (Puerto 80)        │
│                     │    JSON API     │                     │
└─────────────────────┘                 └─────────────────────┘
```

## API Endpoints de Agent Zero

La integración intenta conectarse a varios endpoints:
- `/health` - Verificación de salud
- `/api/health` - Endpoint alternativo de salud
- `/status` - Estado del servicio
- `/` - Endpoint raíz
- `/api/legal-query` - Consultas legales (POST)

## Solución de Problemas

### Agent Zero No Conecta

1. **Verificar que el contenedor esté ejecutándose:**
   ```bash
   docker ps | grep agent-zero
   ```

2. **Verificar la IP del contenedor:**
   ```bash
   docker inspect agent-zero-abogado | grep IPAddress
   ```

3. **Probar conectividad:**
   ```bash
   curl http://172.17.0.4:80
   ```

### Errores de Autenticación API (401 Unauthorized)

Si ves errores como:
```
litellm.exceptions.AuthenticationError: OpenrouterException - {"error":{"message":"No auth credentials found","code":401}}
```

Estos errores indican que Agent Zero no tiene configuradas las credenciales de API para OpenRouter. **Nota importante**: Estos errores NO afectan la funcionalidad básica de Agent Zero, solo las extensiones de memoria avanzadas.

**Solución**: Consulta el archivo `AGENT_ZERO_API_SETUP.md` para instrucciones detalladas sobre cómo configurar las API keys de OpenRouter.

**Estado actual**: Agent Zero funciona correctamente para consultas básicas, pero las funciones de memoria (`memorize_solutions`, `memorize_fragments`) requieren configuración adicional de API.

### Error de CORS

Si encuentras errores de CORS, Agent Zero debe configurar los headers apropiados:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

### Timeout de Conexión

La aplicación tiene un timeout de 30 segundos para consultas y 5 segundos para verificación de conexión. Si Agent Zero responde lentamente, estos valores pueden ajustarse en `agentZeroService.ts`.

## Desarrollo

### Estructura de Archivos

```
src/
├── services/
│   └── agentZeroService.ts     # Servicio de conexión
├── components/
│   ├── AgentZeroIntegration.tsx # Componente de UI
│   └── LegalCaseGenerator.tsx   # Generador con integración
└── ...
```

### Agregar Nuevas Funcionalidades

1. **Nuevos tipos de consulta:**
   - Actualizar `AgentZeroRequest` interface
   - Agregar botones en `AgentZeroIntegration.tsx`

2. **Nuevos endpoints:**
   - Agregar métodos en `agentZeroService.ts`
   - Actualizar la UI según sea necesario

## Seguridad

- Las consultas se envían por HTTP (desarrollo)
- Para producción, configurar HTTPS
- No se almacenan credenciales en el código
- Todas las variables sensibles van en `.env`

## Próximas Mejoras

- [ ] Autenticación con Agent Zero
- [ ] Caché de respuestas
- [ ] Exportación de conversaciones
- [ ] Integración con más tipos de documentos
- [ ] Notificaciones en tiempo real

---

**Nota**: Esta integración requiere que el contenedor `agent-zero-abogado` esté ejecutándose y accesible en la red Docker.