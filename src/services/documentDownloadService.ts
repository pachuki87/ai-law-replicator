import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';
import type { GeneratedDocument } from './aiDocumentService';

// Configuración de fuentes para PDF
const PDF_CONFIG = {
  margin: 20,
  fontSize: {
    title: 16,
    subtitle: 14,
    body: 11,
    small: 9
  },
  lineHeight: {
    title: 20,
    subtitle: 18,
    body: 14,
    small: 12
  },
  colors: {
    primary: '#1a365d',
    secondary: '#2d3748',
    text: '#2d3748'
  }
};

// Utilidad para dividir texto en líneas que caben en el PDF
function splitTextToLines(text: string, maxWidth: number, fontSize: number, pdf: jsPDF): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const textWidth = pdf.getTextWidth(testLine);
    
    if (textWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines;
}

// Utilidad para limpiar texto markdown básico
function cleanMarkdownText(text: string): string {
  return text
    .replace(/^#{1,6}\s+/gm, '') // Remover headers markdown
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remover bold
    .replace(/\*(.*?)\*/g, '$1') // Remover italic
    .replace(/`(.*?)`/g, '$1') // Remover code
    .replace(/^[-*+]\s+/gm, '• ') // Convertir listas
    .replace(/^\d+\.\s+/gm, '') // Remover numeración
    .trim();
}

// Utilidad para extraer secciones del contenido
function parseDocumentContent(content: string): {
  title: string;
  sections: Array<{ title: string; content: string }>;
} {
  const lines = content.split('\n').filter(line => line.trim());
  let title = 'Documento Legal';
  const sections: Array<{ title: string; content: string }> = [];
  let currentSection: { title: string; content: string } | null = null;

  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Detectar título principal
    if (trimmedLine.startsWith('# ')) {
      title = cleanMarkdownText(trimmedLine);
      continue;
    }
    
    // Detectar subtítulos
    if (trimmedLine.startsWith('## ')) {
      if (currentSection) {
        sections.push(currentSection);
      }
      currentSection = {
        title: cleanMarkdownText(trimmedLine),
        content: ''
      };
      continue;
    }
    
    // Agregar contenido a la sección actual
    if (currentSection) {
      currentSection.content += (currentSection.content ? '\n' : '') + cleanMarkdownText(trimmedLine);
    } else {
      // Si no hay sección actual, crear una sección general
      if (!sections.length) {
        currentSection = {
          title: 'Contenido Principal',
          content: cleanMarkdownText(trimmedLine)
        };
      }
    }
  }
  
  if (currentSection) {
    sections.push(currentSection);
  }
  
  return { title, sections };
}

class DocumentDownloadService {
  // Generar y descargar documento PDF
  async downloadAsPDF(document: GeneratedDocument): Promise<void> {
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const maxWidth = pageWidth - (PDF_CONFIG.margin * 2);
      let yPosition = PDF_CONFIG.margin;

      // Parsear contenido
      const { title, sections } = parseDocumentContent(document.content);

      // Función para agregar nueva página si es necesario
      const checkPageBreak = (requiredHeight: number) => {
        if (yPosition + requiredHeight > pageHeight - PDF_CONFIG.margin) {
          pdf.addPage();
          yPosition = PDF_CONFIG.margin;
        }
      };

      // Título principal
      pdf.setFontSize(PDF_CONFIG.fontSize.title);
      pdf.setTextColor(PDF_CONFIG.colors.primary);
      const titleLines = splitTextToLines(title, maxWidth, PDF_CONFIG.fontSize.title, pdf);
      
      for (const line of titleLines) {
        checkPageBreak(PDF_CONFIG.lineHeight.title);
        pdf.text(line, PDF_CONFIG.margin, yPosition);
        yPosition += PDF_CONFIG.lineHeight.title;
      }
      
      yPosition += 10; // Espacio después del título

      // Información del documento
      pdf.setFontSize(PDF_CONFIG.fontSize.small);
      pdf.setTextColor(PDF_CONFIG.colors.secondary);
      
      const infoLines = [
        `Cliente: ${document.clientName}`,
        `Número de Caso: ${document.caseNumber}`,
        `Tipo: ${document.typeName}`,
        `Fecha: ${new Date(document.createdAt).toLocaleDateString('es-ES')}`,
        `Urgencia: ${document.urgency.toUpperCase()}`
      ];
      
      for (const info of infoLines) {
        checkPageBreak(PDF_CONFIG.lineHeight.small);
        pdf.text(info, PDF_CONFIG.margin, yPosition);
        yPosition += PDF_CONFIG.lineHeight.small;
      }
      
      yPosition += 15; // Espacio antes del contenido

      // Contenido por secciones
      for (const section of sections) {
        // Título de sección
        pdf.setFontSize(PDF_CONFIG.fontSize.subtitle);
        pdf.setTextColor(PDF_CONFIG.colors.primary);
        
        checkPageBreak(PDF_CONFIG.lineHeight.subtitle + 5);
        pdf.text(section.title, PDF_CONFIG.margin, yPosition);
        yPosition += PDF_CONFIG.lineHeight.subtitle + 5;
        
        // Contenido de sección
        pdf.setFontSize(PDF_CONFIG.fontSize.body);
        pdf.setTextColor(PDF_CONFIG.colors.text);
        
        const contentLines = splitTextToLines(section.content, maxWidth, PDF_CONFIG.fontSize.body, pdf);
        
        for (const line of contentLines) {
          checkPageBreak(PDF_CONFIG.lineHeight.body);
          pdf.text(line, PDF_CONFIG.margin, yPosition);
          yPosition += PDF_CONFIG.lineHeight.body;
        }
        
        yPosition += 10; // Espacio entre secciones
      }

      // Pie de página en todas las páginas
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(PDF_CONFIG.fontSize.small);
        pdf.setTextColor(PDF_CONFIG.colors.secondary);
        
        const footerText = `Página ${i} de ${totalPages} - Generado por Sistema de Automatización Legal`;
        const footerWidth = pdf.getTextWidth(footerText);
        const footerX = (pageWidth - footerWidth) / 2;
        
        pdf.text(footerText, footerX, pageHeight - 10);
      }

      // Descargar archivo
      const fileName = `${document.typeName.replace(/\s+/g, '_')}_${document.clientName.replace(/\s+/g, '_')}_${document.caseNumber}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Error al generar PDF:', error);
      throw new Error('No se pudo generar el archivo PDF. Por favor, inténtelo de nuevo.');
    }
  }

  // Generar y descargar documento Word
  async downloadAsWord(document: GeneratedDocument): Promise<void> {
    try {
      // Parsear contenido
      const { title, sections } = parseDocumentContent(document.content);
      
      // Crear documento Word
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: [
              // Título principal
              new Paragraph({
                children: [
                  new TextRun({
                    text: title,
                    bold: true,
                    size: 32, // 16pt
                    color: '1a365d'
                  })
                ],
                heading: HeadingLevel.TITLE,
                alignment: AlignmentType.CENTER,
                spacing: { after: 400 }
              }),
              
              // Información del documento
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'INFORMACIÓN DEL DOCUMENTO',
                    bold: true,
                    size: 24, // 12pt
                    color: '2d3748'
                  })
                ],
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 200, after: 200 }
              }),
              
              new Paragraph({
                children: [
                  new TextRun({ text: 'Cliente: ', bold: true }),
                  new TextRun({ text: document.clientName })
                ],
                spacing: { after: 100 }
              }),
              
              new Paragraph({
                children: [
                  new TextRun({ text: 'Número de Caso: ', bold: true }),
                  new TextRun({ text: document.caseNumber })
                ],
                spacing: { after: 100 }
              }),
              
              new Paragraph({
                children: [
                  new TextRun({ text: 'Tipo de Documento: ', bold: true }),
                  new TextRun({ text: document.typeName })
                ],
                spacing: { after: 100 }
              }),
              
              new Paragraph({
                children: [
                  new TextRun({ text: 'Fecha de Creación: ', bold: true }),
                  new TextRun({ text: new Date(document.createdAt).toLocaleDateString('es-ES') })
                ],
                spacing: { after: 100 }
              }),
              
              new Paragraph({
                children: [
                  new TextRun({ text: 'Nivel de Urgencia: ', bold: true }),
                  new TextRun({ text: document.urgency.toUpperCase() })
                ],
                spacing: { after: 400 }
              }),
              
              // Contenido por secciones
              ...sections.flatMap(section => [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: section.title,
                      bold: true,
                      size: 28, // 14pt
                      color: '1a365d'
                    })
                  ],
                  heading: HeadingLevel.HEADING_2,
                  spacing: { before: 300, after: 200 }
                }),
                
                ...section.content.split('\n').filter(line => line.trim()).map(line => 
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: line.trim(),
                        size: 22 // 11pt
                      })
                    ],
                    spacing: { after: 150 }
                  })
                )
              ]),
              
              // Pie de documento
              new Paragraph({
                children: [
                  new TextRun({
                    text: '\n\n---\n\nDocumento generado automáticamente por el Sistema de Automatización Legal',
                    italics: true,
                    size: 18, // 9pt
                    color: '718096'
                  })
                ],
                alignment: AlignmentType.CENTER,
                spacing: { before: 600 }
              })
            ]
          }
        ]
      });

      // Generar y descargar archivo
      const buffer = await Packer.toBuffer(doc);
      const fileName = `${document.typeName.replace(/\s+/g, '_')}_${document.clientName.replace(/\s+/g, '_')}_${document.caseNumber}.docx`;
      
      saveAs(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }), fileName);
      
    } catch (error) {
      console.error('Error al generar Word:', error);
      throw new Error('No se pudo generar el archivo Word. Por favor, inténtelo de nuevo.');
    }
  }

  // Método de conveniencia para descargar en cualquier formato
  async downloadDocument(document: GeneratedDocument, format: 'pdf' | 'word'): Promise<void> {
    if (format === 'pdf') {
      await this.downloadAsPDF(document);
    } else if (format === 'word') {
      await this.downloadAsWord(document);
    } else {
      throw new Error(`Formato no soportado: ${format}`);
    }
  }
}

// Exportar instancia singleton
export const documentDownloadService = new DocumentDownloadService();
export default documentDownloadService;