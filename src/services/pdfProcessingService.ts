import * as pdfjsLib from 'pdfjs-dist';
import { fileService } from './fileService';
import { CaseDocument } from '../types/database';

// Configure PDF.js worker - using static file from public directory
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

export interface PDFContent {
  documentId: string;
  fileName: string;
  text: string;
  pageCount: number;
  extractedAt: Date;
}

export interface SearchResult {
  documentId: string;
  fileName: string;
  matchedText: string;
  pageNumber?: number;
  relevanceScore: number;
}

class PDFProcessingService {
  private processedDocuments: Map<string, PDFContent> = new Map();

  /**
   * Extrae texto de un archivo PDF
   */
  async extractTextFromPDF(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += `\n--- Página ${pageNum} ---\n${pageText}\n`;
      }

      return fullText.trim();
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      throw new Error('No se pudo extraer el texto del PDF');
    }
  }

  /**
   * Extrae texto de un PDF desde una URL
   */
  async extractTextFromURL(url: string): Promise<string> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += `\n--- Página ${pageNum} ---\n${pageText}\n`;
      }

      return fullText.trim();
    } catch (error) {
      console.error('Error extracting text from PDF URL:', error);
      throw new Error('No se pudo extraer el texto del PDF desde la URL');
    }
  }

  /**
   * Procesa todos los documentos de un caso y extrae su contenido
   */
  async processCaseDocuments(caseId: string): Promise<PDFContent[]> {
    try {
      const documents = await fileService.getCaseDocuments(caseId);
      const processedDocs: PDFContent[] = [];

      for (const document of documents) {
        try {
          // Verificar si ya está procesado
          if (this.processedDocuments.has(document.id)) {
            processedDocs.push(this.processedDocuments.get(document.id)!);
            continue;
          }

          // Obtener URL del documento
          const url = await fileService.getDocumentUrl(document.file_path);
          if (!url) {
            console.warn(`No se pudo obtener URL para documento: ${document.file_name}`);
            continue;
          }

          // Extraer texto
          const text = await this.extractTextFromURL(url);
          const pageCount = this.countPages(text);

          const pdfContent: PDFContent = {
            documentId: document.id,
            fileName: document.file_name,
            text,
            pageCount,
            extractedAt: new Date()
          };

          // Guardar en caché
          this.processedDocuments.set(document.id, pdfContent);
          processedDocs.push(pdfContent);

        } catch (error) {
          console.error(`Error procesando documento ${document.file_name}:`, error);
        }
      }

      return processedDocs;
    } catch (error) {
      console.error('Error processing case documents:', error);
      throw new Error('No se pudieron procesar los documentos del caso');
    }
  }

  /**
   * Busca texto en los documentos procesados
   */
  searchInDocuments(query: string, documents: PDFContent[]): SearchResult[] {
    const results: SearchResult[] = [];
    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 2);

    for (const doc of documents) {
      const text = doc.text.toLowerCase();
      let relevanceScore = 0;
      const matchedParts: string[] = [];

      for (const term of searchTerms) {
        const regex = new RegExp(term, 'gi');
        const matches = text.match(regex);
        if (matches) {
          relevanceScore += matches.length;
          
          // Extraer contexto alrededor de la coincidencia
          const index = text.indexOf(term);
          if (index !== -1) {
            const start = Math.max(0, index - 100);
            const end = Math.min(text.length, index + term.length + 100);
            const context = doc.text.substring(start, end);
            matchedParts.push(`...${context}...`);
          }
        }
      }

      if (relevanceScore > 0) {
        results.push({
          documentId: doc.documentId,
          fileName: doc.fileName,
          matchedText: matchedParts.join('\n\n'),
          relevanceScore
        });
      }
    }

    // Ordenar por relevancia
    return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  /**
   * Busca información específica en los documentos de un caso
   */
  async searchInCaseDocuments(caseId: string, query: string): Promise<SearchResult[]> {
    try {
      const processedDocs = await this.processCaseDocuments(caseId);
      return this.searchInDocuments(query, processedDocs);
    } catch (error) {
      console.error('Error searching in case documents:', error);
      throw new Error('No se pudo realizar la búsqueda en los documentos');
    }
  }

  /**
   * Obtiene un resumen del contenido de todos los documentos de un caso
   */
  async getCaseDocumentsSummary(caseId: string): Promise<string> {
    try {
      const processedDocs = await this.processCaseDocuments(caseId);
      
      if (processedDocs.length === 0) {
        return 'No hay documentos PDF disponibles para este caso.';
      }

      let summary = `Documentos disponibles para análisis (${processedDocs.length} documentos):\n\n`;
      
      for (const doc of processedDocs) {
        const preview = doc.text.substring(0, 300).replace(/\n/g, ' ');
        summary += `📄 **${doc.fileName}** (${doc.pageCount} páginas)\n`;
        summary += `Contenido: ${preview}...\n\n`;
      }

      return summary;
    } catch (error) {
      console.error('Error getting case documents summary:', error);
      return 'Error al obtener el resumen de los documentos.';
    }
  }

  /**
   * Limpia la caché de documentos procesados
   */
  clearCache(): void {
    this.processedDocuments.clear();
  }

  /**
   * Cuenta las páginas en el texto extraído
   */
  private countPages(text: string): number {
    const pageMarkers = text.match(/--- Página \d+ ---/g);
    return pageMarkers ? pageMarkers.length : 1;
  }

  /**
   * Verifica si un documento ya está procesado
   */
  isDocumentProcessed(documentId: string): boolean {
    return this.processedDocuments.has(documentId);
  }

  /**
   * Obtiene el contenido procesado de un documento específico
   */
  getProcessedDocument(documentId: string): PDFContent | null {
    return this.processedDocuments.get(documentId) || null;
  }
}

// Exportar instancia singleton
export const pdfProcessingService = new PDFProcessingService();
export default pdfProcessingService;