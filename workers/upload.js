export default {
  async fetch(request, env, ctx) {
    // Configurar headers CORS
    const corsHeaders = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    // Manejar preflight OPTIONS request
    if (request.method === 'OPTIONS') {
      return new Response('', {
        status: 200,
        headers: corsHeaders
      });
    }

    // Solo permitir POST
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: corsHeaders
      });
    }

    try {
      // Obtener el cuerpo de la petición
      const formData = await request.formData();
      const file = formData.get('file');
      const filePath = formData.get('filePath');

      if (!file || !filePath) {
        return new Response(JSON.stringify({ error: 'File and filePath are required' }), {
          status: 400,
          headers: corsHeaders
        });
      }

      // Validar que sea un archivo PDF
      if (file.type !== 'application/pdf') {
        return new Response(JSON.stringify({ error: 'Solo se permiten archivos PDF' }), {
          status: 400,
          headers: corsHeaders
        });
      }

      // Validar tamaño del archivo (10MB máximo)
      if (file.size > 10 * 1024 * 1024) {
        return new Response(JSON.stringify({ error: 'El archivo es demasiado grande (máximo 10MB)' }), {
          status: 400,
          headers: corsHeaders
        });
      }

      // En Cloudflare Workers, puedes usar R2 para almacenamiento
      // Por ahora, simulamos una respuesta exitosa
      // Para implementación completa, necesitarías configurar R2 bucket
      
      const response = {
        success: true,
        message: 'File upload simulated successfully',
        note: 'Para producción, configura Cloudflare R2 para almacenamiento real',
        path: `uploads/${filePath}`,
        size: file.size,
        type: file.type,
        name: file.name
      };

      return new Response(JSON.stringify(response), {
        status: 200,
        headers: corsHeaders
      });

    } catch (error) {
      console.error('Upload error:', error);
      return new Response(JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }), {
        status: 500,
        headers: corsHeaders
      });
    }
  }
};