/**
 * Tipos de entrada multicanal suportados
 */
export enum InputType {
  AUDIO = 'audio',
  VIDEO = 'video',
  IMAGE = 'image',
  TEXT = 'text'
}

/**
 * Status do relatório de ouvidoria
 */
export enum ReportStatus {
  SUBMITTED = 'submitted',
  IN_REVIEW = 'in_review',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}

/**
 * Categorias de denúncias/manifestações
 */
export enum ReportCategory {
  COMPLAINT = 'complaint',           // Denúncia
  SUGGESTION = 'suggestion',         // Sugestão
  COMPLIMENT = 'compliment',         // Elogio
  REQUEST = 'request',               // Solicitação
  INFORMATION = 'information'        // Informação
}

/**
 * Anexo de mídia com metadados
 */
export interface MediaAttachment {
  id: string;
  type: InputType;
  filename: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedAt: Date;
  transcription?: string;        // Para áudio/vídeo transcrito pela IA IZA
  geolocation?: Geolocation;     // Para imagens georreferenciadas
  metadata?: Record<string, any>;
}

/**
 * Dados de geolocalização
 */
export interface Geolocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  address?: string;
}

/**
 * Modelo de relatório/manifestação
 */
export interface Report {
  id: string;
  protocolNumber: string;        // Número de protocolo único
  category: ReportCategory;
  status: ReportStatus;
  
  // Conteúdo da manifestação
  title?: string;
  description: string;           // Pode vir de texto direto ou transcrição
  
  // Dados do cidadão (opcional para anonimato)
  citizenName?: string;
  citizenEmail?: string;
  citizenPhone?: string;
  isAnonymous: boolean;
  
  // Anexos multicanal
  attachments: MediaAttachment[];
  primaryInputType: InputType;   // Tipo de entrada principal usado
  
  // Localização (se fornecida)
  location?: Geolocation;
  
  // Metadados
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  
  // Segurança
  ipAddress?: string;
  userAgent?: string;
}

/**
 * DTO para criação de novo relatório
 */
export interface CreateReportDto {
  category: ReportCategory;
  title?: string;
  description: string;
  citizenName?: string;
  citizenEmail?: string;
  citizenPhone?: string;
  isAnonymous: boolean;
  primaryInputType: InputType;
  location?: Geolocation;
}

/**
 * DTO para upload de mídia
 */
export interface MediaUploadDto {
  reportId: string;
  type: InputType;
  file: Express.Multer.File;
  geolocation?: Geolocation;
  transcribe?: boolean;          // Se deve transcrever áudio/vídeo
}

/**
 * Resposta de transcrição da IA IZA
 */
export interface TranscriptionResponse {
  text: string;
  confidence: number;
  language: string;
  duration?: number;
}

/**
 * Filtros para listagem de relatórios
 */
export interface ReportFilters {
  status?: ReportStatus;
  category?: ReportCategory;
  startDate?: Date;
  endDate?: Date;
  isAnonymous?: boolean;
  page?: number;
  limit?: number;
}

/**
 * Resposta paginada
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
