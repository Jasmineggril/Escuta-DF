import { v4 as uuidv4 } from 'uuid';
import {
  Report,
  ReportStatus,
  CreateReportDto,
  MediaAttachment,
  ReportFilters,
  PaginatedResponse
} from '../types';

/**
 * Repositório de relatórios em memória (para demonstração)
 * Em produção, usar banco de dados (PostgreSQL, MongoDB, etc.)
 */
class ReportRepository {
  private reports: Map<string, Report> = new Map();

  /**
   * Cria um novo relatório
   */
  create(dto: CreateReportDto, metadata: { ipAddress?: string; userAgent?: string }): Report {
    const report: Report = {
      id: uuidv4(),
      protocolNumber: this.generateProtocolNumber(),
      category: dto.category,
      status: ReportStatus.SUBMITTED,
      title: dto.title,
      description: dto.description,
      citizenName: dto.isAnonymous ? undefined : dto.citizenName,
      citizenEmail: dto.isAnonymous ? undefined : dto.citizenEmail,
      citizenPhone: dto.isAnonymous ? undefined : dto.citizenPhone,
      isAnonymous: dto.isAnonymous,
      attachments: [],
      primaryInputType: dto.primaryInputType,
      location: dto.location,
      createdAt: new Date(),
      updatedAt: new Date(),
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent
    };

    this.reports.set(report.id, report);
    return report;
  }

  /**
   * Busca relatório por ID
   */
  findById(id: string): Report | undefined {
    return this.reports.get(id);
  }

  /**
   * Busca relatório por número de protocolo
   */
  findByProtocol(protocolNumber: string): Report | undefined {
    return Array.from(this.reports.values()).find(
      r => r.protocolNumber === protocolNumber
    );
  }

  /**
   * Adiciona anexo de mídia a um relatório
   */
  addAttachment(reportId: string, attachment: MediaAttachment): Report | undefined {
    const report = this.reports.get(reportId);
    if (!report) return undefined;

    report.attachments.push(attachment);
    report.updatedAt = new Date();
    
    return report;
  }

  /**
   * Atualiza status do relatório
   */
  updateStatus(reportId: string, status: ReportStatus): Report | undefined {
    const report = this.reports.get(reportId);
    if (!report) return undefined;

    report.status = status;
    report.updatedAt = new Date();
    
    if (status === ReportStatus.RESOLVED || status === ReportStatus.CLOSED) {
      report.resolvedAt = new Date();
    }

    return report;
  }

  /**
   * Lista relatórios com filtros e paginação
   */
  findAll(filters: ReportFilters): PaginatedResponse<Report> {
    let reports = Array.from(this.reports.values());

    // Aplicar filtros
    if (filters.status) {
      reports = reports.filter(r => r.status === filters.status);
    }
    if (filters.category) {
      reports = reports.filter(r => r.category === filters.category);
    }
    if (filters.isAnonymous !== undefined) {
      reports = reports.filter(r => r.isAnonymous === filters.isAnonymous);
    }
    if (filters.startDate) {
      reports = reports.filter(r => r.createdAt >= filters.startDate!);
    }
    if (filters.endDate) {
      reports = reports.filter(r => r.createdAt <= filters.endDate!);
    }

    // Ordenar por data de criação (mais recente primeiro)
    reports.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Paginação
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedReports = reports.slice(startIndex, endIndex);

    return {
      data: paginatedReports,
      total: reports.length,
      page,
      limit,
      totalPages: Math.ceil(reports.length / limit)
    };
  }

  /**
   * Gera número de protocolo único
   */
  private generateProtocolNumber(): string {
    const year = new Date().getFullYear();
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `DF-${year}-${timestamp}-${random}`;
  }
}

export default new ReportRepository();
