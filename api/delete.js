exports.handler = async function(event, context) {
  // Configurar headers CORS
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'DELETE, OPTIONS'
  }
  
  // Manejar preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    }
  }
  
  // Solo permitir DELETE
  if (event.httpMethod !== 'DELETE') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  try {
    // Parsear el cuerpo de la petición
    const body = JSON.parse(event.body || '{}')
    const { filePath } = body

    if (!filePath) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'filePath is required' })
      }
    }

    // En un entorno serverless como Netlify, simular la eliminación
    // En producción real, aquí eliminarías el archivo del servicio de almacenamiento
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        message: 'File deletion simulated successfully',
        note: 'In production, this would delete the file from cloud storage'
      })
    }
  } catch (error) {
    console.error('Delete error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to delete file',
        details: error.message
      })
    }
  }
}