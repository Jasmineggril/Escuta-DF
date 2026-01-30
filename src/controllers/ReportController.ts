import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import reportRepository from '../models/ReportRepository';
import {
  CreateReportDto,
  InputType,
  ReportFilters,
  ReportStatus,
  ReportCategory
} from '../types';

/**
 * Controller para operações de relatórios/manifestações
 */
export class ReportController {
  /**
   * POST /api/reports - Criar novo relatório
   * Fluxo simplificado de 3 cliques
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const dto: CreateReportDto = {
        category: req.body.category,
        title: req.body.title,
        description: req.body.description,
        citizenName: req.body.citizenName,
        citizenEmail: req.body.citizenEmail,
        citizenPhone: req.body.citizenPhone,
        isAnonymous: req.body.isAnonymous || false,
        primaryInputType: req.body.primaryInputType || InputType.TEXT,
        location: req.body.location
      };

      const metadata = {
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      };

      const report = reportRepository.create(dto, metadata);

      res.status(201).json({
        success: true,
        message: 'Manifestação criada com sucesso',
        data: {
          id: report.id,
          protocolNumber: report.protocolNumber,
          status: report.status,
          createdAt: report.createdAt
        }
      });
    } catch (error) {
      console.error('Error creating report:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao criar manifestação'
      });
    }
  }

  /**
   * GET /api/reports/:id - Buscar relatório por ID
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const report = reportRepository.findById(id);

      if (!report) {
        res.status(404).json({
          success: false,
          message: 'Manifestação não encontrada'
        });
        return;
      }

      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      console.error('Error fetching report:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar manifestação'
      });
    }
  }

  /**
   * GET /api/reports/protocol/:protocolNumber - Buscar por protocolo
   */
  async getByProtocol(req: Request, res: Response): Promise<void> {
    try {
      const { protocolNumber } = req.params;
      const report = reportRepository.findByProtocol(protocolNumber);

      if (!report) {
        res.status(404).json({
          success: false,
          message: 'Manifestação não encontrada'
        });
        return;
      }

      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      console.error('Error fetching report by protocol:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar manifestação'
      });
    }
  }

  /**
   * GET /api/reports - Listar relatórios com filtros
   */
  async list(req: Request, res: Response): Promise<void> {
    try {
      const filters: ReportFilters = {
        status: req.query.status as ReportStatus,
        category: req.query.category as ReportCategory,
        isAnonymous: req.query.isAnonymous === 'true' ? true : 
                     req.query.isAnonymous === 'false' ? false : undefined,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10
      };

      const result = reportRepository.findAll(filters);

      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      console.error('Error listing reports:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao listar manifestações'
      });
    }
  }

  /**
   * PATCH /api/reports/:id/status - Atualizar status
   */
  async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!Object.values(ReportStatus).includes(status)) {
        res.status(400).json({
          success: false,
          message: 'Status inválido'
        });
        return;
      }

      const report = reportRepository.updateStatus(id, status);

      if (!report) {
        res.status(404).json({
          success: false,
          message: 'Manifestação não encontrada'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Status atualizado com sucesso',
        data: report
      });
    } catch (error) {
      console.error('Error updating report status:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao atualizar status'
      });
    }
  }
}

export default new ReportController();
