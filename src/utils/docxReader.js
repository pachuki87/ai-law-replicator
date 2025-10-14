import mammoth from 'mammoth';

/**
 * Lee un archivo DOCX y extrae su contenido de texto
 * @param {File} file - Archivo DOCX a leer
 * @returns {Promise<{text: string, html: string, messages: Array}>} - Contenido extraído
 */
export async function readDocxFile(file) {
  try {
    // Convertir el archivo a ArrayBuffer para el navegador
    const arrayBuffer = await file.arrayBuffer();
    
    // Extraer texto plano
    const textResult = await mammoth.extractRawText({ arrayBuffer });
    
    // Convertir a HTML para preservar formato
    const htmlResult = await mammoth.convertToHtml({ arrayBuffer });
    
    return {
      text: textResult.value,
      html: htmlResult.value,
      messages: [...textResult.messages, ...htmlResult.messages],
      success: true
    };
  } catch (error) {
    console.error('Error al leer el archivo DOCX:', error);
    return {
      text: '',
      html: '',
      messages: [{ type: 'error', message: error.message }],
      success: false
    };
  }
}

/**
 * Analiza el contenido del documento para identificar campos rellenables
 * @param {string} text - Texto del documento
 * @returns {Array} - Array de campos identificados
 */
export function analyzeDocumentFields(text) {
  const fields = [];
  
  // Patrones comunes para campos en documentos legales
  const patterns = [
    // Campos entre corchetes [CAMPO]
    /\[([^\]]+)\]/g,
    // Campos con guiones bajos ___________
    /_{3,}/g,
    // Campos con puntos suspensivos ...
    /\.{3,}/g,
    // Campos tipo {{CAMPO}}
    /\{\{([^}]+)\}\}/g,
    // Campos tipo <CAMPO>
    /<([^>]+)>/g,
    // Fechas típicas DD/MM/AAAA
    /\b\d{1,2}\/\d{1,2}\/\d{4}\b/g,
    // Números de identificación
    /\b\d{8,12}\b/g
  ];
  
  patterns.forEach((pattern, index) => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const fieldText = match[1] || match[0];
      const fieldType = getFieldType(fieldText);
      
      fields.push({
        id: `field_${fields.length + 1}`,
        text: fieldText,
        type: fieldType,
        position: match.index,
        pattern: index,
        required: isRequiredField(fieldText)
      });
    }
  });
  
  return fields;
}

/**
 * Determina el tipo de campo basado en su contenido
 * @param {string} fieldText - Texto del campo
 * @returns {string} - Tipo de campo
 */
function getFieldType(fieldText) {
  const lowerText = fieldText.toLowerCase();
  
  if (lowerText.includes('fecha') || lowerText.includes('date') || /\d{1,2}\/\d{1,2}\/\d{4}/.test(fieldText)) {
    return 'date';
  }
  if (lowerText.includes('nombre') || lowerText.includes('name')) {
    return 'text';
  }
  if (lowerText.includes('email') || lowerText.includes('correo')) {
    return 'email';
  }
  if (lowerText.includes('teléfono') || lowerText.includes('telefono') || lowerText.includes('phone')) {
    return 'tel';
  }
  if (lowerText.includes('número') || lowerText.includes('numero') || /\d+/.test(fieldText)) {
    return 'number';
  }
  if (lowerText.includes('dirección') || lowerText.includes('direccion') || lowerText.includes('address')) {
    return 'textarea';
  }
  
  return 'text';
}

/**
 * Determina si un campo es obligatorio
 * @param {string} fieldText - Texto del campo
 * @returns {boolean} - Si es obligatorio
 */
function isRequiredField(fieldText) {
  const requiredKeywords = ['nombre', 'fecha', 'dni', 'nif', 'identificación', 'obligatorio'];
  const lowerText = fieldText.toLowerCase();
  
  return requiredKeywords.some(keyword => lowerText.includes(keyword));
}

/**
 * Genera una plantilla de formulario basada en los campos identificados
 * @param {Array} fields - Campos identificados
 * @param {string} originalText - Texto original del documento
 * @returns {Object} - Plantilla de formulario
 */
export function generateFormTemplate(fields, originalText) {
  return {
    id: `template_${Date.now()}`,
    name: 'Plantilla de Documento Legal',
    description: 'Plantilla generada automáticamente del documento DOCX',
    originalText,
    fields: fields.map(field => ({
      ...field,
      label: generateFieldLabel(field.text),
      placeholder: generateFieldPlaceholder(field.type),
      validation: generateFieldValidation(field.type, field.required)
    })),
    createdAt: new Date().toISOString()
  };
}

/**
 * Genera una etiqueta legible para el campo
 * @param {string} fieldText - Texto del campo
 * @returns {string} - Etiqueta del campo
 */
function generateFieldLabel(fieldText) {
  // Limpiar el texto y convertir a formato legible
  return fieldText
    .replace(/[_\-\[\]{}()<>]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Genera un placeholder apropiado para el tipo de campo
 * @param {string} fieldType - Tipo de campo
 * @returns {string} - Placeholder
 */
function generateFieldPlaceholder(fieldType) {
  const placeholders = {
    text: 'Ingrese el texto',
    email: 'ejemplo@correo.com',
    tel: '+34 123 456 789',
    date: 'DD/MM/AAAA',
    number: '123456',
    textarea: 'Ingrese la información detallada'
  };
  
  return placeholders[fieldType] || 'Ingrese el valor';
}

/**
 * Genera reglas de validación para el campo
 * @param {string} fieldType - Tipo de campo
 * @param {boolean} required - Si es obligatorio
 * @returns {Object} - Reglas de validación
 */
function generateFieldValidation(fieldType, required) {
  const validation = { required };
  
  switch (fieldType) {
    case 'email':
      validation.pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      validation.message = 'Ingrese un email válido';
      break;
    case 'tel':
      validation.pattern = /^[\+]?[0-9\s\-\(\)]{9,}$/;
      validation.message = 'Ingrese un teléfono válido';
      break;
    case 'date':
      validation.pattern = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
      validation.message = 'Ingrese una fecha válida (DD/MM/AAAA)';
      break;
    case 'number':
      validation.pattern = /^\d+$/;
      validation.message = 'Ingrese solo números';
      break;
  }
  
  return validation;
}