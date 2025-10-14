import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FileText, Download, Eye, X } from 'lucide-react';

const QuickTemplates = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const templates = [
    {
      id: 'contrato-arrendamiento',
      title: 'Contrato de Arrendamiento',
      description: 'Contrato estándar de alquiler',
      icon: FileText,
      fields: [
        { name: 'arrendador_nombre', label: 'Nombre del Arrendador', type: 'text', required: true },
        { name: 'arrendador_cedula', label: 'Cédula del Arrendador', type: 'text', required: true },
        { name: 'arrendatario_nombre', label: 'Nombre del Arrendatario', type: 'text', required: true },
        { name: 'arrendatario_cedula', label: 'Cédula del Arrendatario', type: 'text', required: true },
        { name: 'inmueble_direccion', label: 'Dirección del Inmueble', type: 'text', required: true },
        { name: 'canon_arriendo', label: 'Canon de Arriendo', type: 'number', required: true },
        { name: 'duracion_contrato', label: 'Duración del Contrato (meses)', type: 'number', required: true },
        { name: 'fecha_inicio', label: 'Fecha de Inicio', type: 'date', required: true },
        { name: 'deposito_garantia', label: 'Depósito de Garantía', type: 'number', required: false }
      ]
    },
    {
      id: 'demanda-civil',
      title: 'Demanda Civil',
      description: 'Demanda por incumplimiento contractual',
      icon: FileText,
      fields: [
        { name: 'demandante_nombre', label: 'Nombre del Demandante', type: 'text', required: true },
        { name: 'demandante_cedula', label: 'Cédula del Demandante', type: 'text', required: true },
        { name: 'demandado_nombre', label: 'Nombre del Demandado', type: 'text', required: true },
        { name: 'demandado_cedula', label: 'Cédula del Demandado', type: 'text', required: true },
        { name: 'objeto_demanda', label: 'Objeto de la Demanda', type: 'textarea', required: true },
        { name: 'cuantia', label: 'Cuantía', type: 'number', required: true },
        { name: 'hechos', label: 'Hechos', type: 'textarea', required: true },
        { name: 'pretensiones', label: 'Pretensiones', type: 'textarea', required: true }
      ]
    },
    {
      id: 'recurso-apelacion',
      title: 'Recurso de Apelación',
      description: 'Recurso contra sentencia',
      icon: FileText,
      fields: [
        { name: 'apelante_nombre', label: 'Nombre del Apelante', type: 'text', required: true },
        { name: 'apelante_cedula', label: 'Cédula del Apelante', type: 'text', required: true },
        { name: 'numero_proceso', label: 'Número del Proceso', type: 'text', required: true },
        { name: 'juzgado_origen', label: 'Juzgado de Origen', type: 'text', required: true },
        { name: 'fecha_sentencia', label: 'Fecha de la Sentencia', type: 'date', required: true },
        { name: 'fundamentos_apelacion', label: 'Fundamentos de la Apelación', type: 'textarea', required: true },
        { name: 'pretensiones_apelacion', label: 'Pretensiones de la Apelación', type: 'textarea', required: true }
      ]
    },
    {
      id: 'convenio-colaboracion',
      title: 'Convenio de Colaboración',
      description: 'Acuerdo entre empresas',
      icon: FileText,
      fields: [
        { name: 'empresa1_nombre', label: 'Nombre de la Primera Empresa', type: 'text', required: true },
        { name: 'empresa1_nit', label: 'NIT de la Primera Empresa', type: 'text', required: true },
        { name: 'empresa1_representante', label: 'Representante Legal Empresa 1', type: 'text', required: true },
        { name: 'empresa2_nombre', label: 'Nombre de la Segunda Empresa', type: 'text', required: true },
        { name: 'empresa2_nit', label: 'NIT de la Segunda Empresa', type: 'text', required: true },
        { name: 'empresa2_representante', label: 'Representante Legal Empresa 2', type: 'text', required: true },
        { name: 'objeto_convenio', label: 'Objeto del Convenio', type: 'textarea', required: true },
        { name: 'duracion_convenio', label: 'Duración del Convenio (meses)', type: 'number', required: true },
        { name: 'obligaciones_empresa1', label: 'Obligaciones Empresa 1', type: 'textarea', required: true },
        { name: 'obligaciones_empresa2', label: 'Obligaciones Empresa 2', type: 'textarea', required: true }
      ]
    }
  ];

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setShowForm(true);
    reset();
  };

  const onSubmit = (data) => {
    console.log('Datos del formulario:', data);
    console.log('Plantilla seleccionada:', selectedTemplate.title);
    
    // Aquí se generaría el documento con los datos
    alert(`Documento "${selectedTemplate.title}" generado exitosamente con los datos proporcionados.`);
    
    // Resetear el formulario
    setShowForm(false);
    setSelectedTemplate(null);
    reset();
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedTemplate(null);
    reset();
  };

  if (showForm && selectedTemplate) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <selectedTemplate.icon className="h-6 w-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedTemplate.title}
              </h2>
            </div>
            <button
              onClick={handleCloseForm}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {selectedTemplate.fields.map((field) => (
                <div key={field.name} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  
                  {field.type === 'textarea' ? (
                    <textarea
                      {...register(field.name, { 
                        required: field.required ? `${field.label} es requerido` : false 
                      })}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={`Ingrese ${field.label.toLowerCase()}`}
                    />
                  ) : (
                    <input
                      type={field.type}
                      {...register(field.name, { 
                        required: field.required ? `${field.label} es requerido` : false 
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={field.type !== 'date' ? `Ingrese ${field.label.toLowerCase()}` : ''}
                    />
                  )}
                  
                  {errors[field.name] && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors[field.name].message}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCloseForm}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Generar Documento</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          📄 Plantillas Rápidas
        </h2>
        <p className="text-gray-600">
          Seleccione una plantilla predefinida para generar documentos legales de forma rápida y eficiente.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {templates.map((template) => (
          <div
            key={template.id}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-200 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4 mx-auto">
                <template.icon className="h-6 w-6 text-blue-600" />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                {template.title}
              </h3>
              
              <p className="text-sm text-gray-600 text-center mb-4">
                {template.description}
              </p>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => handleTemplateSelect(template)}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center space-x-1"
                >
                  <Eye className="h-4 w-4" />
                  <span>Usar</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          💡 ¿Cómo funciona?
        </h3>
        <div className="text-blue-800 space-y-2">
          <p>• <strong>Seleccione</strong> la plantilla que necesita</p>
          <p>• <strong>Complete</strong> los campos requeridos con la información específica</p>
          <p>• <strong>Genere</strong> el documento listo para usar</p>
          <p>• <strong>Descargue</strong> su documento en formato profesional</p>
        </div>
      </div>
    </div>
  );
};

export default QuickTemplates;