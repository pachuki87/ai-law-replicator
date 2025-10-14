# Usar Node.js 20 como imagen base
FROM node:20-alpine

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias (incluye ngrok como dev dependency)
RUN npm ci

# Copiar el código fuente y scripts de configuración
COPY . .

# Construir la aplicación
RUN npm run build

# Exponer el puerto 5173 (puerto estándar de Vite)
EXPOSE 5173

# Crear script de inicio que puede usar ngrok si está configurado
RUN echo '#!/bin/sh\n\
if [ -n "$NGROK_AUTHTOKEN" ]; then\n\
  echo "🔧 Configurando ngrok..."\n\
  npx ngrok config add-authtoken $NGROK_AUTHTOKEN\n\
  echo "🚀 Iniciando aplicación con ngrok..."\n\
  npm run start:public\n\
else\n\
  echo "🚀 Iniciando aplicación sin ngrok..."\n\
  npm run preview -- --host 0.0.0.0 --port 5173\n\
fi' > /app/docker-start.sh && chmod +x /app/docker-start.sh

# Comando para ejecutar la aplicación
CMD ["/app/docker-start.sh"]