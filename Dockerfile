# Usar Node.js 20 como imagen base
FROM node:20-alpine

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar el código fuente
COPY . .

# Construir la aplicación
RUN npm run build

# Exponer el puerto
EXPOSE 3002

# Comando para ejecutar la aplicación
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "3002"]