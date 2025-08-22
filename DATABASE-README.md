# Base de Datos - AI Law Replicator

## Esquema de Base de Datos para Supabase

Este documento describe la implementación de la base de datos para la aplicación AI Law Replicator utilizando Supabase como backend.

## 📋 Resumen del Esquema

La base de datos está diseñada para soportar todas las funcionalidades de la aplicación:

### 🔐 **Autenticación y Usuarios**
- `profiles` - Perfiles de usuario extendidos
- `roles` - Roles y permisos del sistema
- `user_settings` - Configuraciones personalizadas

### ⚖️ **Gestión Legal**
- `clients` - Información de clientes
- `cases` - Casos legales
- `case_activities` - Actividades y tareas de casos

### 📄 **Documentos**
- `generated_documents` - Documentos generados por IA
- `document_templates` - Plantillas reutilizables
- `document_history` - Historial de versiones

### 🔍 **Investigación Jurídica**
- `search_history` - Historial de búsquedas
- `saved_searches` - Búsquedas guardadas

### 🤖 **Asistente IA**
- `ai_conversations` - Conversaciones con IA
- `ai_messages` - Mensajes individuales

### 📊 **Compliance y Predicciones**
- `compliance_areas` - Áreas de cumplimiento
- `compliance_issues` - Issues de compliance
- `case_predictions` - Predicciones de casos
- `prediction_factors` - Factores de predicción

## 🚀 Implementación en Supabase

### Paso 1: Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Crea una nueva cuenta o inicia sesión
3. Crea un nuevo proyecto
4. Anota la URL del proyecto y la clave anon

### Paso 2: Ejecutar el Esquema

1. Ve al **SQL Editor** en tu dashboard de Supabase
2. Copia y pega el contenido completo de `supabase-schema.sql`
3. Ejecuta el script completo

### Paso 3: Configurar Variables de Entorno

Actualiza tu archivo `.env` con las credenciales de Supabase:

```env
# Supabase Configuration
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_anon_de_supabase

# Existing API Keys
VITE_GEMINI_API_KEY=tu_clave_de_gemini
VITE_OPENAI_API_KEY=tu_clave_de_openai
```

## 🔒 Seguridad Implementada

### Row Level Security (RLS)
- **Habilitado** en todas las tablas principales
- Los usuarios solo pueden acceder a sus propios datos
- Políticas específicas para cada tabla

### Políticas de Acceso
- **Perfiles**: Los usuarios pueden ver/editar solo su perfil
- **Casos**: Acceso completo solo a casos propios
- **Documentos**: Gestión completa de documentos propios
- **Plantillas**: Acceso a plantillas públicas + propias
- **Conversaciones IA**: Solo conversaciones propias

## 📈 Optimizaciones

### Índices Implementados
- Índices en campos de búsqueda frecuente
- Índices compuestos para consultas complejas
- Optimización para consultas por usuario

### Triggers Automáticos
- Actualización automática de `updated_at`
- Mantenimiento de integridad referencial

## 🔧 Funcionalidades Clave

### 1. **Gestión de Usuarios Multi-Rol**
```sql
-- Roles disponibles: admin, lawyer, assistant, client
-- Cada rol tiene permisos específicos
```

### 2. **Versionado de Documentos**
```sql
-- Historial completo de cambios en documentos
-- Tracking de quién hizo qué cambio
```

### 3. **Búsquedas Inteligentes**
```sql
-- Historial de búsquedas para análisis
-- Búsquedas guardadas con alertas
```

### 4. **Predicciones Basadas en Datos**
```sql
-- Sistema de factores ponderados
-- Tracking de precisión de predicciones
```

## 📊 Datos Iniciales

El esquema incluye datos iniciales para:
- **Roles básicos** del sistema
- **Áreas de compliance** comunes
- **Factores de predicción** estándar

## 🔄 Migraciones Futuras

Para cambios futuros en el esquema:

1. Crear archivos de migración incrementales
2. Usar el sistema de migraciones de Supabase
3. Mantener compatibilidad hacia atrás

## 🛠️ Integración con la Aplicación

### Servicios a Crear

1. **`supabaseClient.ts`** - Cliente de Supabase
2. **`authService.ts`** - Servicio de autenticación
3. **`caseService.ts`** - Gestión de casos
4. **`documentService.ts`** - Gestión de documentos
5. **`searchService.ts`** - Búsquedas y historial
6. **`aiService.ts`** - Conversaciones IA
7. **`complianceService.ts`** - Gestión de compliance
8. **`predictionService.ts`** - Predicciones

### Estructura Recomendada

```
src/
├── services/
│   ├── supabase/
│   │   ├── supabaseClient.ts
│   │   ├── authService.ts
│   │   ├── caseService.ts
│   │   ├── documentService.ts
│   │   ├── searchService.ts
│   │   ├── aiService.ts
│   │   ├── complianceService.ts
│   │   └── predictionService.ts
│   └── ...
├── types/
│   └── database.ts
└── ...
```

## 🔍 Consultas Comunes

### Obtener casos activos de un usuario
```sql
SELECT * FROM cases 
WHERE user_id = auth.uid() 
AND status = 'active'
ORDER BY created_at DESC;
```

### Obtener documentos de un caso
```sql
SELECT * FROM generated_documents 
WHERE case_id = $1 
AND user_id = auth.uid()
ORDER BY created_at DESC;
```

### Obtener conversaciones IA recientes
```sql
SELECT * FROM ai_conversations 
WHERE user_id = auth.uid()
ORDER BY updated_at DESC
LIMIT 10;
```

## 📝 Notas Importantes

1. **Backup**: Configura backups automáticos en Supabase
2. **Monitoreo**: Usa las métricas de Supabase para monitorear rendimiento
3. **Límites**: Ten en cuenta los límites del plan de Supabase
4. **Escalabilidad**: El esquema está diseñado para escalar

## 🆘 Soporte

Para problemas con la base de datos:
1. Revisa los logs en Supabase Dashboard
2. Verifica las políticas RLS
3. Confirma que las variables de entorno están correctas
4. Usa el SQL Editor para debugging

---

**Próximos Pasos**: Implementar los servicios de integración con Supabase en la aplicación React.