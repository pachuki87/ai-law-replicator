import React, { useState, useRef } from 'react';
import { Upload, FileText, Download, Eye, Edit, Trash2, Plus } from 'lucide-react';
import { readDocxFile, analyzeDocumentFields, generateFormTemplate } from '../utils/docxReader';
import QuickTemplates from './QuickTemplates';

const DocumentTemplateManager = () => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState({});
  const [activeTab, setActiveTab] = useState('quick-templates'); // Nueva pestaña activa
  const fileInputRef = useRef(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.docx')) {
      alert('Por favor, seleccione un archivo DOCX válido');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Leer el archivo DOCX
      const docxContent = await readDocxFile(file);
      
      if (!docxContent.success) {
        throw new Error('Error al procesar el archivo DOCX');
      }

      // Analizar campos
      const fields = analyzeDocumentFields(docxContent.text);
      
      // Generar plantilla
      const template = generateFormTemplate(fields, docxContent.text);
      template.name = file.name.replace('.docx', '');
      template.originalHtml = docxContent.html;

      // Agregar a la lista de plantillas
      setTemplates(prev => [...prev, template]);
      
      // Mostrar mensaje de éxito
      alert(`Plantilla "${template.name}" creada exitosamente con ${fields.length} campos identificados`);
      
    } catch (error) {
      console.error('Error al procesar el archivo:', error);
      alert('Error al procesar el archivo. Verifique que sea un documento DOCX válido.');
    } finally {
      setIsProcessing(false);
      // Limpiar el input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    // Inicializar datos del formulario
    const initialData = {};
    template.fields.forEach(field => {
      initialData[field.id] = '';
    });
    setFormData(initialData);
    setShowPreview(false);
  };

  const handleFieldChange = (fieldId, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const validateForm = () => {
    const errors = [];
    
    selectedTemplate.fields.forEach(field => {
      const value = formData[field.id];
      
      if (field.validation.required && (!value || value.trim() === '')) {
        errors.push(`${field.label} es obligatorio`);
        return;
      }
      
      if (value && field.validation.pattern && !field.validation.pattern.test(value)) {
        errors.push(field.validation.message || `${field.label} tiene un formato inválido`);
      }
    });
    
    return errors;
  };

  const generateDocument = () => {
    const errors = validateForm();
    
    if (errors.length > 0) {
      alert('Errores de validación:\n' + errors.join('\n'));
      return;
    }

    // Generar documento con los datos del formulario
    let documentText = selectedTemplate.originalText;
    
    selectedTemplate.fields.forEach(field => {
      const value = formData[field.id] || '[CAMPO NO COMPLETADO]';
      // Reemplazar el campo original con el valor ingresado
      documentText = documentText.replace(field.text, value);
    });

    // Crear y descargar el documento
    const blob = new Blob([documentText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTemplate.name}_completado.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const deleteTemplate = (templateId) => {
    if (confirm('¿Está seguro de que desea eliminar esta plantilla?')) {
      setTemplates(prev => prev.filter(t => t.id !== templateId));
      if (selectedTemplate && selectedTemplate.id === templateId) {
        setSelectedTemplate(null);
        setFormData({});
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Gestor de Plantillas de Documentos
        </h1>
        <p className="text-gray-600">
          Cargue documentos DOCX para convertirlos en plantillas rellenables o use nuestras plantillas rápidas predefinidas
        </p>
      </div>

      {/* Navegación por pestañas */}
      <div className="mb-8">
        <nav className="flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('quick-templates')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'quick-templates'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            📄 Plantillas Rápidas
          </button>
          <button
            onClick={() => setActiveTab('upload-documents')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'upload-documents'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            📤 Cargar Documentos
          </button>
        </nav>
      </div>

      {/* Contenido de las pestañas */}
      {activeTab === 'quick-templates' ? (
        <QuickTemplates />
      ) : (
        <div>
          {/* Sección de carga */}
          <div className="mb-8 p-6 border-2 border-dashed border-gray-300 rounded-lg">
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Cargar Documento DOCX
              </h3>
              <p className="text-gray-500 mb-4">
                Seleccione un archivo DOCX para convertir en plantilla
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".docx"
                onChange={handleFileUpload}
                className="hidden"
                id="docx-upload"
              />
              <label
                htmlFor="docx-upload"
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
                  isProcessing 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                }`}
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Procesando...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Seleccionar Archivo
                  </>
                )}
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Lista de plantillas */}
            <div className="lg:col-span-1">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Plantillas Disponibles ({templates.length})
              </h2>
              
              {templates.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <p>No hay plantillas disponibles</p>
                  <p className="text-sm">Cargue un documento DOCX para comenzar</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedTemplate?.id === template.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 truncate">
                            {template.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {template.fields.length} campos
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(template.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteTemplate(template.id);
                          }}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Formulario de plantilla */}
            <div className="lg:col-span-2">
              {selectedTemplate ? (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Completar: {selectedTemplate.name}
                    </h2>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setShowPreview(!showPreview)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        {showPreview ? 'Ocultar' : 'Vista Previa'}
                      </button>
                      <button
                        onClick={generateDocument}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Generar Documento
                      </button>
                    </div>
                  </div>

                  {showPreview && (
                    <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                      <h3 className="font-medium text-gray-900 mb-2">Vista Previa del Documento Original</h3>
                      <div 
                        className="text-sm text-gray-700 max-h-40 overflow-y-auto"
                        dangerouslySetInnerHTML={{ __html: selectedTemplate.originalHtml }}
                      />
                    </div>
                  )}

                  <div className="space-y-4">
                    {selectedTemplate.fields.map((field) => (
                      <div key={field.id} className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          {field.label}
                          {field.validation.required && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </label>
                        
                        {field.type === 'textarea' ? (
                          <textarea
                            value={formData[field.id] || ''}
                            onChange={(e) => handleFieldChange(field.id, e.target.value)}
                            placeholder={field.placeholder}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        ) : (
                          <input
                            type={field.type}
                            value={formData[field.id] || ''}
                            onChange={(e) => handleFieldChange(field.id, e.target.value)}
                            placeholder={field.placeholder}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        )}
                        
                        {field.validation.message && (
                          <p className="text-xs text-gray-500">
                            {field.validation.message}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Edit className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <p>Seleccione una plantilla para comenzar a completarla</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentTemplateManager;