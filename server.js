import express from 'express'
import cors from 'cors'
import multer from 'multer'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = 3002

// Middleware
app.use(cors())
app.use(express.json())

// Configurar multer para almacenamiento en memoria
const storage = multer.memoryStorage()
const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true)
    } else {
      cb(new Error('Solo se permiten archivos PDF'), false)
    }
  }
})

// Endpoint para subir archivos
app.post('/upload', upload.single('file'), (req, res) => {
  try {
    const { filePath } = req.body
    
    if (!req.file || !filePath) {
      return res.status(400).json({ error: 'File and filePath are required' })
    }

    // Crear el directorio de destino si no existe
    const uploadsDir = path.join(__dirname, 'public', 'uploads')
    const targetDir = path.join(uploadsDir, path.dirname(filePath))
    
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true })
    }

    // Guardar el archivo
    const targetPath = path.join(uploadsDir, filePath)
    fs.writeFileSync(targetPath, req.file.buffer)

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
})

// Endpoint para eliminar archivos
app.delete('/delete', (req, res) => {
  try {
    const { filePath } = req.body

    if (!filePath) {
      return res.status(400).json({ error: 'filePath is required' })
    }

    // Construir la ruta completa del archivo
    const uploadsDir = path.join(__dirname, 'public', 'uploads')
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
})

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`)
})