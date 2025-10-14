export default {
  async fetch(request, env, ctx) {
    // Configurar headers CORS
    const corsHeaders = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'DELETE, OPTIONS'
    };

    // Manejar preflight OPTIONS request
    if (request.method === 'OPTIONS') {
      return new Response('', {
        status: 200,
        headers: corsHeaders
      });
    }

    // Solo permitir DELETE
    if (request.method !== 'DELETE') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: corsHeaders
      });
    }

    try {
      // Parsear el cuerpo de la petición
      const body = await request.json();
      const { filePath } = body;

      if (!filePath) {
        return new Response(JSON.stringify({ error: 'filePath is required' }), {
          status: 400,
          headers: corsHeaders
        });
      }

      // En Cloudflare Workers con R2, aquí eliminarías el archivo del bucket
      // Por ahora, simulamos la eliminación exitosa
      
      const response = {
        success: true,
        message: 'File deletion simulated successfully',
        note: 'Para producción, configura Cloudflare R2 para eliminación real',
        deletedPath: filePath
      };

      return new Response(JSON.stringify(response), {
        status: 200,
        headers: corsHeaders
      });

    } catch (error) {
      console.error('Delete error:', error);
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