# AI Law Replicator

🔗 **Repositorio GitHub**: https://github.com/pachuki87/ai-law-replicator

Una aplicación web moderna para la generación automatizada de documentos legales utilizando inteligencia artificial.

## 🚀 Características

- **Generación de Documentos con IA**: Utiliza OpenAI GPT y Google Gemini para generar documentos legales profesionales
- **Múltiples Tipos de Documentos**: Contratos, demandas, escritos, poderes, y más
- **Descarga en Múltiples Formatos**: Exporta documentos en PDF y Word (DOCX)
- **Interfaz Moderna**: Diseño profesional con Tailwind CSS y componentes shadcn/ui
- **Responsive**: Funciona perfectamente en desktop y móvil

## 📋 Requisitos Previos

- Node.js 18+ 
- npm o pnpm
- Clave API de OpenAI y/o Google Gemini (opcional, funciona con contenido de ejemplo sin ellas)

## 🛠️ Instalación

1. **Clona el repositorio**
   ```bash
   git clone https://github.com/pachuki87/ai-law-replicator.git
   cd ai-law-replicator
   ```

2. **Instala las dependencias**
   ```bash
   npm install
   ```

3. **Configura las variables de entorno**
   ```bash
   cp .env.example .env
   ```
   
   Edita el archivo `.env` y agrega tus claves API:
   ```env
   OPENAI_API_KEY=tu_clave_openai_aqui
   GEMINI_API_KEY=tu_clave_gemini_aqui
   ```

4. **Inicia el servidor de desarrollo**
   ```bash
   npm run dev
   ```

5. **Abre tu navegador**
   Visita `http://localhost:3001`

## 🔑 Configuración de APIs

### OpenAI API
1. Visita [OpenAI Platform](https://platform.openai.com/api-keys)
2. Crea una cuenta o inicia sesión
3. Genera una nueva clave API
4. Agrega la clave a tu archivo `.env`

### Google Gemini API
1. Visita [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Crea una cuenta o inicia sesión
3. Genera una nueva clave API
4. Agrega la clave a tu archivo `.env`

**Nota**: Al menos una de las claves API debe estar configurada para la generación con IA. Sin claves, la aplicación funcionará con contenido de ejemplo.

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes React
│   ├── ui/             # Componentes base (shadcn/ui)
│   └── modules/        # Componentes específicos
├── services/           # Servicios y lógica de negocio
│   ├── aiDocumentService.ts      # Servicio de IA
│   └── documentDownloadService.ts # Servicio de descarga
├── lib/                # Utilidades y configuración
└── pages/              # Páginas de la aplicación
```

## 🎯 Uso

1. **Selecciona el tipo de documento** que deseas generar
2. **Completa la información** requerida (nombre del cliente, detalles, etc.)
3. **Haz clic en "Generar Documento"** para crear el contenido con IA
4. **Descarga el documento** en formato PDF o Word

## 📦 Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza la build de producción
- `npm run lint` - Ejecuta el linter

## 🛡️ Tecnologías Utilizadas

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui
- **IA**: OpenAI GPT, Google Gemini
- **Generación de Documentos**: jsPDF, docx
- **Notificaciones**: Sonner
- **Iconos**: Lucide React

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Si tienes problemas o preguntas:

1. Revisa la documentación
2. Busca en los issues existentes
3. Crea un nuevo issue si es necesario

## 🔄 Actualizaciones

Para mantener el proyecto actualizado:

```bash
git pull origin main
npm install
npm run build
```

---

**Desarrollado con ❤️ para la comunidad legal**