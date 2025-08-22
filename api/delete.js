import fs from 'fs'
import path from 'path'

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { filePath } = req.body

    if (!filePath) {
      return res.status(400).json({ error: 'filePath is required' })
    }

    // Construir la ruta completa del archivo
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    const targetPath = path.join(uploadsDir, filePath)

    // Verificar que el archivo existe
    if (!fs.existsSync(targetPath)) {
      return res.status(404).json({ error: 'File not found' })
    }

    // Verificar que el archivo está dentro del directorio uploads (seguridad)
    const normalizedUploadsDir = path.normalize(uploadsDir)
    const normalizedTargetPath = path.normalize(targetPath)
    
    if (!normalizedTargetPath.startsWith(normalizedUploadsDir)) {
      return res.status(403).json({ error: 'Access denied' })
    }

    // Eliminar el archivo
    fs.unlinkSync(targetPath)

    // Intentar eliminar el directorio padre si está vacío
    try {
      const parentDir = path.dirname(targetPath)
      if (parentDir !== uploadsDir) {
        const files = fs.readdirSync(parentDir)
        if (files.length === 0) {
          fs.rmdirSync(parentDir)
        }
      }
    } catch (error) {
      // Ignorar errores al eliminar directorios
    }

    res.status(200).json({ 
      success: true, 
      message: 'File deleted successfully'
    })
  } catch (error) {
    console.error('Delete error:', error)
    res.status(500).json({ 
      error: 'Failed to delete file',
      details: error.message
    })
  }
}