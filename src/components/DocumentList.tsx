import React, { useState, useEffect } from 'react'
import { FileText, Download, Trash2, Eye, Calendar } from 'lucide-react'
import { fileService } from '../services/fileService'
import { CaseDocument } from '../types/database'

interface DocumentListProps {
  caseId: string
  refreshTrigger?: number // Para forzar actualización cuando se sube un nuevo documento
  onDocumentDeleted?: () => void
}

const DocumentList: React.FC<DocumentListProps> = ({
  caseId,
  refreshTrigger,
  onDocumentDeleted
}) => {
  const [documents, setDocuments] = useState<CaseDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const loadDocuments = async () => {
    try {
      setLoading(true)
      const docs = await fileService.getCaseDocuments(caseId)
      setDocuments(docs)
    } catch (error) {
      console.error('Error loading documents:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDocuments()
  }, [caseId, refreshTrigger])

  const handleDownload = async (document: CaseDocument) => {
    try {
      const url = await fileService.getDocumentUrl(document.file_path)
      if (url) {
        // Crear un enlace temporal para descargar
        const link = document.createElement('a')
        link.href = url
        link.download = document.file_name
        link.target = '_blank'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } catch (error) {
      console.error('Error downloading document:', error)
    }
  }

  const handleView = async (document: CaseDocument) => {
    try {
      const url = await fileService.getDocumentUrl(document.file_path)
      if (url) {
        window.open(url, '_blank')
      }
    } catch (error) {
      console.error('Error viewing document:', error)
    }
  }

  const handleDelete = async (document: CaseDocument) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar "${document.file_name}"?`)) {
      return
    }

    try {
      setDeletingId(document.id)
      const success = await fileService.deleteDocument(document.id)
      
      if (success) {
        setDocuments(prev => prev.filter(doc => doc.id !== document.id))
        onDocumentDeleted?.()
      } else {
        alert('Error al eliminar el documento')
      }
    } catch (error) {
      console.error('Error deleting document:', error)
      alert('Error al eliminar el documento')
    } finally {
      setDeletingId(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-gray-200 rounded" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
              <div className="flex space-x-2">
                <div className="w-8 h-8 bg-gray-200 rounded" />
                <div className="w-8 h-8 bg-gray-200 rounded" />
                <div className="w-8 h-8 bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
        <p className="text-gray-500">No hay documentos subidos para este caso</p>
        <p className="text-sm text-gray-400 mt-1">
          Los documentos PDF que subas aparecerán aquí
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700">
          Documentos ({documents.length})
        </h4>
      </div>
      
      {documents.map((document) => (
        <div
          key={document.id}
          className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <FileText className="h-8 w-8 text-red-600 flex-shrink-0" />
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {document.file_name}
            </p>
            <div className="flex items-center space-x-4 mt-1">
              <p className="text-xs text-gray-500">
                {fileService.formatFileSize(document.file_size)}
              </p>
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(document.uploaded_at)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            <button
              onClick={() => handleView(document)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
              title="Ver documento"
            >
              <Eye className="h-4 w-4" />
            </button>
            
            <button
              onClick={() => handleDownload(document)}
              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
              title="Descargar documento"
            >
              <Download className="h-4 w-4" />
            </button>
            
            <button
              onClick={() => handleDelete(document)}
              disabled={deletingId === document.id}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
              title="Eliminar documento"
            >
              {deletingId === document.id ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default DocumentList