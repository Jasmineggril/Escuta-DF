import { Router } from 'express';
import reportController from '../controllers/ReportController';
import { createReportValidation } from '../middleware/validation';

const router = Router();

/**
 * Rotas de relatórios/manifestações
 */

// Criar novo relatório
router.post('/', createReportValidation, reportController.create.bind(reportController));

// Listar relatórios com filtros
router.get('/', reportController.list.bind(reportController));

// Buscar relatório por ID
router.get('/:id', reportController.getById.bind(reportController));

// Buscar relatório por número de protocolo
router.get('/protocol/:protocolNumber', reportController.getByProtocol.bind(reportController));

// Atualizar status do relatório
router.patch('/:id/status', reportController.updateStatus.bind(reportController));

export default router;
