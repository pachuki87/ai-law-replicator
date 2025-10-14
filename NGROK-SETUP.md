# 🌐 Configuración de Ngrok para AI Law Replicator

Esta guía te ayudará a exponer tu aplicación **AI Law Replicator** públicamente usando **ngrok**, permitiendo acceso desde cualquier lugar del mundo.

## 📋 Prerrequisitos

1. **Aplicación funcionando**: La app debe estar ejecutándose en `http://localhost:5173`
2. **Cuenta de ngrok** (opcional pero recomendado): [Regístrate aquí](https://ngrok.com/)

## 🚀 Inicio Rápido

### Opción 1: Inicio Automático (Recomendado)
```bash
# Inicia la aplicación Y ngrok simultáneamente
npm run start:public
```

### Opción 2: Inicio Manual
```bash
# Terminal 1: Iniciar la aplicación
npm run dev

# Terminal 2: Iniciar ngrok
npm run ngrok
```

### Opción 3: Solo Túnel
```bash
# Si la app ya está ejecutándose
npm run tunnel
```

## 🔑 Configuración de Authtoken (Recomendado)

Para obtener URLs estables y evitar límites:

1. **Regístrate en ngrok**: [https://ngrok.com/](https://ngrok.com/)
2. **Obtén tu authtoken** del dashboard
3. **Configúralo**:
   ```bash
   npm run ngrok:auth TU_AUTHTOKEN_AQUI
   ```

## ⚙️ Configuración Avanzada

### Variables de Entorno

Crea un archivo `.env` con:

```env
# Configuración de ngrok (opcional)
NGROK_AUTHTOKEN=tu_authtoken_de_ngrok
NGROK_REGION=us
NGROK_SUBDOMAIN=mi-app-legal
```

### Regiones Disponibles
- `us` - Estados Unidos (por defecto)
- `eu` - Europa
- `ap` - Asia Pacífico
- `au` - Australia
- `sa` - Sudamérica
- `jp` - Japón
- `in` - India

## 📱 Uso de la URL Pública

Una vez iniciado ngrok, verás algo como:

```
✅ ¡Ngrok iniciado exitosamente!
🌐 URL pública: https://abc123.ngrok.io
🏠 URL local: http://localhost:5173
```

### Compartir la Aplicación

1. **Copia la URL pública** (ej: `https://abc123.ngrok.io`)
2. **Compártela** con quien necesite acceso
3. **La aplicación será accesible** desde cualquier dispositivo con internet

## 🔒 Consideraciones de Seguridad

### ⚠️ Importante
- **No compartas URLs con datos sensibles** en producción
- **Usa autenticación** si manejas información confidencial
- **Considera usar un dominio propio** para uso profesional

### 🛡️ Recomendaciones
- Usa ngrok solo para **desarrollo y demos**
- Para **producción**, considera servicios como Cloudflare, Vercel, o Netlify
- **Monitorea el tráfico** desde el dashboard de ngrok

## 🛠️ Troubleshooting

### Error: "Puerto 5173 no está en uso"
```bash
# Asegúrate de que la aplicación esté ejecutándose
npm run dev
```

### Error: "authtoken required"
```bash
# Configura tu authtoken
npm run ngrok:auth TU_TOKEN
```

### Error: "tunnel not found"
```bash
# Reinicia ngrok
# Presiona Ctrl+C y ejecuta de nuevo
npm run ngrok
```

### La aplicación no carga correctamente
1. Verifica que `http://localhost:5173` funcione
2. Revisa la consola del navegador por errores CORS
3. Asegúrate de que todas las APIs estén configuradas

## 📊 Monitoreo

### Dashboard de ngrok
- Visita: [http://localhost:4040](http://localhost:4040)
- Ve **tráfico en tiempo real**
- **Inspecciona requests** y responses
- **Replay requests** para debugging

### Logs en Consola
El script muestra información útil:
- ✅ Estado de conexión
- 🌐 URLs disponibles
- 📊 Estadísticas de uso
- ❌ Errores y soluciones

## 🎯 Casos de Uso

### 👥 Demos a Clientes
```bash
npm run start:public
# Comparte la URL pública para mostrar la aplicación
```

### 📱 Pruebas en Móvil
```bash
npm run ngrok
# Usa la URL en tu teléfono para probar responsive design
```

### 🤝 Colaboración Remota
```bash
npm run start:public
# Permite que tu equipo acceda a tu versión local
```

### 🧪 Testing de APIs
- Usa la URL pública para **webhooks**
- **Integra con servicios externos**
- **Prueba desde diferentes ubicaciones**

## 🔄 Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run ngrok` | Solo inicia ngrok |
| `npm run tunnel` | Alias para ngrok |
| `npm run start:public` | App + ngrok simultáneamente |
| `npm run ngrok:auth` | Configura authtoken |

## 📞 Soporte

### Problemas Comunes
- **Conexión lenta**: Cambia la región en `.env`
- **URL cambia**: Configura un authtoken
- **No funciona**: Verifica que el puerto 5173 esté libre

### Enlaces Útiles
- [Documentación de ngrok](https://ngrok.com/docs)
- [Dashboard de ngrok](https://dashboard.ngrok.com/)
- [Comunidad de ngrok](https://github.com/inconshreveable/ngrok)

---

¡Ahora puedes compartir tu aplicación **AI Law Replicator** con el mundo! 🌍✨