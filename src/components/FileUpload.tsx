import React, { useState, useRef } from 'react'
import { Upload, File, X, AlertCircle, CheckCircle } from 'lucide-react'
import { fileService, FileUploadResult } from '../services/fileService'
import { CaseDocument } from '../types/database'

interface FileUploadProps {
  caseId: string
  onUploadSuccess?: (document: CaseDocument) => void
  onUploadError?: (error: string) => void
  disabled?: boolean
}

interface UploadingFile {
  file: File
  progress: number
  status: 'uploading' | 'success' | 'error'
  error?: string
  result?: CaseDocument
}

const FileUpload: React.FC<FileUploadProps> = ({
  caseId,
  onUploadSuccess,
  onUploadError,
  disabled = false
}) => {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return

    const newFiles: UploadingFile[] = Array.from(files).map(file => ({
      file,
      progress: 0,
      status: 'uploading' as const
    }))

    setUploadingFiles(prev => [...prev, ...newFiles])

    // Subir cada archivo
    newFiles.forEach((uploadingFile, index) => {
      uploadFile(uploadingFile, index + uploadingFiles.length)
    })
  }

  const uploadFile = async (uploadingFile: UploadingFile, index: number) => {
    try {
      const result: FileUploadResult = await fileService.uploadCaseDocument(
        uploadingFile.file,
        caseId,
        (progress) => {
          setUploadingFiles(prev => 
            prev.map((item, i) => 
              i === index 
                ? { ...item, progress: progress.percentage }
                : item
            )
          )
        }
      )

      if (result.success && result.data) {
        setUploadingFiles(prev => 
          prev.map((item, i) => 
            i === index 
              ? { ...item, status: 'success', progress: 100, result: result.data }
              : item
          )
        )
        onUploadSuccess?.(result.data)
      } else {
        setUploadingFiles(prev => 
          prev.map((item, i) => 
            i === index 
              ? { ...item, status: 'error', error: result.error }
              : item
          )
        )
        onUploadError?.(result.error || 'Error desconocido')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error inesperado'
      setUploadingFiles(prev => 
        prev.map((item, i) => 
          i === index 
            ? { ...item, status: 'error', error: errorMessage }
            : item
        )
      )
      onUploadError?.(errorMessage)
    }
  }

  const removeUploadingFile = (index: number) => {
    setUploadingFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    if (disabled) return
    
    const files = e.dataTransfer.files
    handleFileSelect(files)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files)
    // Limpiar el input para permitir subir el mismo archivo nuevamente
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const openFileDialog = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div className="space-y-4">
      {/* Área de subida */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${
            isDragOver
              ? 'border-blue-500 bg-blue-50'
              : disabled
              ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
              : 'border-gray-300 hover:border-gray-400'
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          multiple
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
        />
        
        <Upload className={`mx-auto h-12 w-12 mb-4 ${
          disabled ? 'text-gray-300' : 'text-gray-400'
        }`} />
        
        <div className={disabled ? 'text-gray-400' : 'text-gray-600'}>
          <p className="text-lg font-medium mb-2">
            {isDragOver ? 'Suelta los archivos aquí' : 'Subir documentos PDF'}
          </p>
          <p className="text-sm">
            Arrastra y suelta archivos PDF aquí, o haz clic para seleccionar
          </p>
          <p className="text-xs mt-2 text-gray-500">
            Máximo 10MB por archivo
          </p>
        </div>
      </div>

      {/* Lista de archivos subiendo */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Subiendo archivos:</h4>
          {uploadingFiles.map((uploadingFile, index) => (
            <div
              key={index}
              className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
            >
              <File className="h-5 w-5 text-gray-400 flex-shrink-0" />
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {uploadingFile.file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {fileService.formatFileSize(uploadingFile.file.size)}
                </p>
                
                {uploadingFile.status === 'uploading' && (
                  <div className="mt-1">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadingFile.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {Math.round(uploadingFile.progress)}%
                    </p>
                  </div>
                )}
                
                {uploadingFile.status === 'error' && (
                  <p className="text-xs text-red-600 mt-1">
                    {uploadingFile.error}
                  </p>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                {uploadingFile.status === 'uploading' && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
                )}
                
                {uploadingFile.status === 'success' && (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                )}
                
                {uploadingFile.status === 'error' && (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
                
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    removeUploadingFile(index)
                  }}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <X className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default FileUpload;