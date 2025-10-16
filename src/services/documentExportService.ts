import { Document, Packer, Paragraph, TextRun, AlignmentType, BorderStyle, WidthType, Table, TableRow, TableCell } from 'docx';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';

export interface LegalDocumentData {
  title: string;
  content: string;
  date: string;
  caseType?: string;
  clientName?: string;
  lawyerName?: string;
}

export class DocumentExportService {
  
  /**
   * Detecta si el contenido es una resolución de caso legal
   */
  static isCaseResolution(content: string): boolean {
    const caseKeywords = [
      'resolución', 'sentencia', 'fallo', 'dictamen', 'veredicto',
      'conclusión legal', 'análisis jurídico', 'estrategia legal',
      'demanda', 'contestación', 'alegatos', 'fundamentos',
      'precedentes', 'jurisprudencia aplicable', 'normativa'
    ];
    
    const contentLower = content.toLowerCase();
    return caseKeywords.some(keyword => contentLower.includes(keyword));
  }

  /**
   * Exporta contenido a PDF con formato legal profesional
   */
  static async exportToPDF(content: string, fileName?: string): Promise<void> {
    try {
      const documentData: LegalDocumentData = {
        title: this.extractTitle(content) || 'Documento Legal',
        content: content,
        date: new Date().toLocaleDateString('es-ES'),
        caseType: this.detectCaseType(content)
      };

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const lineHeight = 7;
      let yPosition = margin;

      // Header
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('DOCUMENTO JURÍDICO', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += lineHeight * 2;

      // Case information table
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      
      const caseInfo = [
        ['Título:', documentData.title],
        ['Fecha:', documentData.date],
        ['Tipo de Caso:', documentData.caseType || 'General'],
        ['Generado por:', 'Asistente Jurídico IA']
      ];

      caseInfo.forEach(([label, value]) => {
        pdf.setFont('helvetica', 'bold');
        pdf.text(label, margin, yPosition);
        pdf.setFont('helvetica', 'normal');
        pdf.text(value, margin + 30, yPosition);
        yPosition += lineHeight;
      });

      yPosition += lineHeight;

      // Content
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('CONTENIDO DEL ANÁLISIS LEGAL', margin, yPosition);
      yPosition += lineHeight * 1.5;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      
      const lines = pdf.splitTextToSize(documentData.content, pageWidth - 2 * margin);
      
      lines.forEach((line: string) => {
        if (yPosition > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
        pdf.text(line, margin, yPosition);
        yPosition += lineHeight;
      });

      // Footer
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'italic');
        pdf.text(
          `Documento generado el ${documentData.date} por Asistente Jurídico IA - Página ${i} de ${totalPages}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }

      const finalFileName = fileName || this.generateFileName(documentData, 'pdf');
      pdf.save(finalFileName);

    } catch (error) {
      console.error('Error generando PDF:', error);
      throw new Error('No se pudo generar el documento PDF');
    }
  }

  /**
   * Exporta contenido a Word con formato legal profesional
   */
  static async exportToWord(content: string, fileName?: string): Promise<void> {
    try {
      const documentData: LegalDocumentData = {
        title: this.extractTitle(content) || 'Documento Legal',
        content: content,
        date: new Date().toLocaleDateString('es-ES'),
        caseType: this.detectCaseType(content)
      };

      const doc = new Document({
        sections: [
          {
            properties: {},
            children: [
              // Header
              new Paragraph({
                children: [
                  new TextRun({
                    text: "DOCUMENTO JURÍDICO",
                    bold: true,
                    size: 32,
                    font: "Times New Roman"
                  })
                ],
                alignment: AlignmentType.CENTER,
                spacing: { after: 400 }
              }),

              // Case information table
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: "Título:", bold: true })] })],
                        borders: { 
                          top: { style: BorderStyle.SINGLE, size: 1 }, 
                          bottom: { style: BorderStyle.SINGLE, size: 1 }, 
                          left: { style: BorderStyle.SINGLE, size: 1 }, 
                          right: { style: BorderStyle.SINGLE, size: 1 } 
                        }
                      }),
                      new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: documentData.title })] })],
                        borders: { 
                          top: { style: BorderStyle.SINGLE, size: 1 }, 
                          bottom: { style: BorderStyle.SINGLE, size: 1 }, 
                          left: { style: BorderStyle.SINGLE, size: 1 }, 
                          right: { style: BorderStyle.SINGLE, size: 1 } 
                        }
                      })
                    ]
                  }),
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: "Fecha:", bold: true })] })],
                        borders: { 
                          top: { style: BorderStyle.SINGLE, size: 1 }, 
                          bottom: { style: BorderStyle.SINGLE, size: 1 }, 
                          left: { style: BorderStyle.SINGLE, size: 1 }, 
                          right: { style: BorderStyle.SINGLE, size: 1 } 
                        }
                      }),
                      new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: documentData.date })] })],
                        borders: { 
                          top: { style: BorderStyle.SINGLE, size: 1 }, 
                          bottom: { style: BorderStyle.SINGLE, size: 1 }, 
                          left: { style: BorderStyle.SINGLE, size: 1 }, 
                          right: { style: BorderStyle.SINGLE, size: 1 } 
                        }
                      })
                    ]
                  }),
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: "Tipo de Caso:", bold: true })] })],
                        borders: { 
                          top: { style: BorderStyle.SINGLE, size: 1 }, 
                          bottom: { style: BorderStyle.SINGLE, size: 1 }, 
                          left: { style: BorderStyle.SINGLE, size: 1 }, 
                          right: { style: BorderStyle.SINGLE, size: 1 } 
                        }
                      }),
                      new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: documentData.caseType || 'General' })] })],
                        borders: { 
                          top: { style: BorderStyle.SINGLE, size: 1 }, 
                          bottom: { style: BorderStyle.SINGLE, size: 1 }, 
                          left: { style: BorderStyle.SINGLE, size: 1 }, 
                          right: { style: BorderStyle.SINGLE, size: 1 } 
                        }
                      })
                    ]
                  }),
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: "Generado por:", bold: true })] })],
                        borders: { 
                          top: { style: BorderStyle.SINGLE, size: 1 }, 
                          bottom: { style: BorderStyle.SINGLE, size: 1 }, 
                          left: { style: BorderStyle.SINGLE, size: 1 }, 
                          right: { style: BorderStyle.SINGLE, size: 1 } 
                        }
                      }),
                      new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: "Asistente Jurídico IA" })] })],
                        borders: { 
                          top: { style: BorderStyle.SINGLE, size: 1 }, 
                          bottom: { style: BorderStyle.SINGLE, size: 1 }, 
                          left: { style: BorderStyle.SINGLE, size: 1 }, 
                          right: { style: BorderStyle.SINGLE, size: 1 } 
                        }
                      })
                    ]
                  })
                ],
                margins: { top: 200, bottom: 200, left: 200, right: 200 }
              }),

              // Content header
              new Paragraph({
                children: [
                  new TextRun({
                    text: "CONTENIDO DEL ANÁLISIS LEGAL",
                    bold: true,
                    size: 24,
                    font: "Times New Roman"
                  })
                ],
                spacing: { before: 400, after: 200 }
              }),

              // Process content paragraphs
              ...this.processContentToParagraphs(documentData.content),

              // Footer
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Documento generado el ${documentData.date} por Asistente Jurídico IA`,
                    italics: true,
                    size: 18,
                    font: "Times New Roman"
                  })
                ],
                alignment: AlignmentType.CENTER,
                spacing: { before: 600 }
              })
            ]
          }
        ]
      });

      const blob = await Packer.toBlob(doc);
      const finalFileName = fileName || this.generateFileName(documentData, 'docx');
      saveAs(blob, finalFileName);

    } catch (error) {
      console.error('Error generando documento DOCX:', error);
      throw new Error('No se pudo generar el documento DOCX');
    }
  }

  /**
   * Exporta contenido a HTML con formato legal profesional
   */
  static async exportToHTML(content: string): Promise<void> {
    try {
      const isCase = this.isCaseResolution(content);
      const caseType = this.detectCaseType(content);
      const title = this.extractTitle(content) || 'Documento Legal';
      const fileName = this.generateFileName({ title, content, date: new Date().toLocaleDateString('es-ES'), caseType }, 'html');

      const htmlContent = this.generateHTMLDocument(content, title, isCase, caseType);
      
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log('Documento HTML exportado exitosamente');
    } catch (error) {
      console.error('Error al exportar HTML:', error);
      throw new Error('No se pudo generar el documento HTML');
    }
  }

  /**
   * Genera documento HTML con diseño minimalista y profesional
   */
  private static generateHTMLDocument(content: string, title: string, isCase: boolean, caseType: string): string {
    const currentDate = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const paragraphs = this.processContentIntoParagraphs(content);
    const contentHTML = paragraphs.map(p => `    <p>${p}</p>`).join('\n');

    return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Georgia', 'Times New Roman', serif;
            line-height: 1.6;
            color: #2c3e50;
            background-color: #ffffff;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
        }
        
        .document-header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 2px solid #34495e;
        }
        
        .document-title {
            font-size: 28px;
            font-weight: bold;
            color: #1a252f;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .document-subtitle {
            font-size: 16px;
            color: #7f8c8d;
            font-style: italic;
        }
        
        .document-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            padding: 15px;
            background-color: #f8f9fa;
            border-left: 4px solid #3498db;
            border-radius: 0 4px 4px 0;
        }
        
        .case-type {
            background-color: #3498db;
            color: white;
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
        }
        
        .document-date {
            color: #7f8c8d;
            font-size: 14px;
        }
        
        .document-content {
            margin-bottom: 40px;
        }
        
        .document-content p {
            margin-bottom: 16px;
            text-align: justify;
            font-size: 16px;
            line-height: 1.8;
        }
        
        .document-content p:first-child {
            font-size: 18px;
            font-weight: 500;
            color: #2c3e50;
        }
        
        .document-footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #bdc3c7;
            text-align: center;
            color: #7f8c8d;
            font-size: 12px;
        }
        
        .legal-notice {
            background-color: #ecf0f1;
            padding: 15px;
            border-radius: 4px;
            margin-top: 20px;
            font-size: 11px;
            line-height: 1.4;
        }
        
        @media print {
            body {
                padding: 20px;
                max-width: none;
            }
            
            .document-header {
                page-break-after: avoid;
            }
            
            .document-content p {
                page-break-inside: avoid;
            }
        }
        
        @media (max-width: 600px) {
            body {
                padding: 20px 15px;
            }
            
            .document-title {
                font-size: 22px;
            }
            
            .document-meta {
                flex-direction: column;
                gap: 10px;
                text-align: center;
            }
        }
    </style>
</head>
<body>
    <div class="document-header">
        <h1 class="document-title">${title}</h1>
        <p class="document-subtitle">Documento Legal Generado por IA</p>
    </div>
    
    <div class="document-meta">
        <span class="case-type">${this.getDocumentTypeLabel(caseType)}</span>
        <span class="document-date">Generado el ${currentDate}</span>
    </div>
    
    <div class="document-content">
${contentHTML}
    </div>
    
    <div class="document-footer">
        <p><strong>Documento generado automáticamente</strong></p>
        <div class="legal-notice">
            <p><strong>Aviso Legal:</strong> Este documento ha sido generado mediante inteligencia artificial y tiene fines informativos. 
            Se recomienda la revisión por parte de un profesional del derecho antes de su uso en procedimientos legales formales. 
            La información contenida no constituye asesoramiento jurídico profesional.</p>
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Procesa el contenido en párrafos para HTML
   */
  private static processContentIntoParagraphs(content: string): string[] {
    return content.split('\n').filter(line => line.trim() !== '').map(line => line.trim());
  }

  /**
   * Obtiene la etiqueta del tipo de documento
   */
  private static getDocumentTypeLabel(caseType: string): string {
    const labels: { [key: string]: string } = {
      'Civil': 'Derecho Civil',
      'Penal': 'Derecho Penal',
      'Laboral': 'Derecho Laboral',
      'Administrativo': 'Derecho Administrativo',
      'Constitucional': 'Derecho Constitucional',
      'Mercantil': 'Derecho Mercantil',
      'General': 'Documento General'
    };
    return labels[caseType] || 'Documento Legal';
  }

  /**
   * Copia el contenido al portapapeles
   */
  static async copyToClipboard(content: string): Promise<void> {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(content);
      } else {
        // Fallback para navegadores que no soportan clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = content;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      console.log('Contenido copiado al portapapeles');
    } catch (error) {
      console.error('Error al copiar al portapapeles:', error);
      throw error;
    }
  }

  /**
   * Procesa el contenido en párrafos para Word
   */
  private static processContentToParagraphs(content: string): Paragraph[] {
    const lines = content.split('\n').filter(line => line.trim() !== '');
    
    return lines.map(line => new Paragraph({
      children: [
        new TextRun({
          text: line,
          size: 22,
          font: "Times New Roman"
        })
      ],
      spacing: { after: 120 }
    }));
  }

  /**
   * Extrae el título del contenido
   */
  private static extractTitle(content: string): string | null {
    const lines = content.split('\n');
    const firstLine = lines[0]?.trim();
    
    if (firstLine && firstLine.length < 100) {
      return firstLine;
    }
    
    return null;
  }

  /**
   * Detecta el tipo de caso basado en el contenido
   */
  private static detectCaseType(content: string): string {
    const contentLower = content.toLowerCase();
    
    const caseTypes = {
      'Civil': ['civil', 'contrato', 'responsabilidad civil', 'daños', 'propiedad'],
      'Penal': ['penal', 'delito', 'criminal', 'acusación', 'fiscal'],
      'Laboral': ['laboral', 'trabajo', 'despido', 'salario', 'empleado'],
      'Administrativo': ['administrativo', 'administración', 'público', 'procedimiento administrativo'],
      'Constitucional': ['constitucional', 'derechos fundamentales', 'amparo', 'constitución'],
      'Mercantil': ['mercantil', 'comercial', 'empresa', 'sociedad', 'competencia']
    };

    for (const [type, keywords] of Object.entries(caseTypes)) {
      if (keywords.some(keyword => contentLower.includes(keyword))) {
        return type;
      }
    }

    return 'General';
  }

  /**
   * Genera un nombre de archivo único
   */
  private static generateFileName(documentData: LegalDocumentData, extension: string): string {
    const date = new Date().toISOString().split('T')[0];
    const time = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
    const caseType = documentData.caseType?.replace(/\s+/g, '_') || 'General';
    
    return `Documento_Legal_${caseType}_${date}_${time}.${extension}`;
  }
}