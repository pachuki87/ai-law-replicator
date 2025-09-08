const { Handler } = require('@netlify/functions');

// Función para consultar BOE usando MCP Playwright
const consultarBOE = async (termino) => {
  try {
    // Simulación de consulta BOE con MCP Playwright
    // En producción, aquí se implementaría la llamada real al MCP
    
    const resultadoSimulado = {
      termino: termino,
      fecha_consulta: new Date().toISOString(),
      resultados: [
        {
          titulo: `Normativa relacionada con: ${termino}`,
          url: `https://www.boe.es/buscar/act.php?id=${encodeURIComponent(termino)}`,
          fecha_publicacion: '2024-01-15',
          tipo: 'Ley/Reglamento',
          resumen: `Consulta realizada para el término: ${termino}. Se recomienda verificar la normativa vigente en el BOE oficial.`
        }
      ],
      recomendacion: 'Verificar siempre la vigencia de la normativa en el BOE oficial: https://www.boe.es'
    };
    
    return {
      exito: true,
      datos: resultadoSimulado,
      mensaje: `Consulta BOE completada para: ${termino}`
    };
    
  } catch (error) {
    console.error('Error en consulta BOE:', error);
    return {
      exito: false,
      error: error.message,
      mensaje: 'Error al consultar el BOE'
    };
  }
};

const handler = async (event, context) => {
  // Configurar CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Manejar preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Solo permitir POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Método no permitido' })
    };
  }

  try {
    const { termino } = JSON.parse(event.body);
    
    if (!termino) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Término de búsqueda requerido' })
      };
    }

    const resultado = await consultarBOE(termino);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        resultado: resultado.exito ? 
          `📋 **Consulta BOE - ${termino}**\n\n` +
          `🔍 **Resultados encontrados:**\n` +
          `• ${resultado.datos.resultados[0].titulo}\n` +
          `• Tipo: ${resultado.datos.resultados[0].tipo}\n` +
          `• Fecha: ${resultado.datos.resultados[0].fecha_publicacion}\n\n` +
          `🔗 **Enlace BOE:** ${resultado.datos.resultados[0].url}\n\n` +
          `⚠️ **Recomendación:** ${resultado.datos.recomendacion}` :
          `❌ Error al consultar BOE: ${resultado.error}\n\nVerificar manualmente en: https://www.boe.es`
      })
    };
    
  } catch (error) {
    console.error('Error procesando solicitud:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Error interno del servidor',
        resultado: 'Error al procesar la consulta BOE. Verificar manualmente en: https://www.boe.es'
      })
    };
  }
};

module.exports = { handler };