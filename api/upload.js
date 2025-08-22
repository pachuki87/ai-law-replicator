import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import formidable from 'formidable'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB
      keepExtensions: true
    })

    const [fields, files] = await form.parse(req)
    
    const file = Array.isArray(files.file) ? files.file[0] : files.file
    const filePath = Array.isArray(fields.filePath) ? fields.filePath[0] : fields.filePath

    if (!file || !filePath) {
      return res.status(400).json({ error: 'File and filePath are required' })
    }

    // Crear el directorio de destino si no existe
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    const targetDir = path.join(uploadsDir, path.dirname(filePath))
    
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true })
    }

    // Mover el archivo a la ubicación final
    const targetPath = path.join(uploadsDir, filePath)
    fs.copyFileSync(file.filepath, targetPath)
    
    // Eliminar el archivo temporal
    fs.unlinkSync(file.filepath)

    res.status(200).json({ 
      success: true, 
      message: 'File uploaded successfully',
      path: filePath
    })
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ 
      error: 'Failed to upload file',
      details: error.message
    })
  }
}