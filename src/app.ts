import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { ensureUploadDir } from './middleware/upload';

// Importar rotas
import reportRoutes from './routes/reports';
import mediaRoutes from './routes/media';

/**
 * Configuração da aplicação Express
 */
export function createApp(): Application {
  const app = express();

  // Segurança com Helmet
  app.use(helmet({
    contentSecurityPolicy: false, // Desabilitar para PWA
    crossOriginEmbedderPolicy: false
  }));

  // CORS
  app.use(cors({
    origin: config.corsOrigin,
    credentials: true
  }));

  // Compressão de resposta
  app.use(compression());

  // Body parser
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Rate limiting para segurança
  const limiter = rateLimit({
    windowMs: config.rateLimitWindowMs,
    max: config.rateLimitMax,
    message: 'Muitas requisições deste IP, tente novamente mais tarde.',
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/', limiter);

  // Servir arquivos estáticos (uploads)
  app.use('/uploads', express.static('uploads'));

  // Garantir diretório de uploads existe
  ensureUploadDir();

  // Rotas da API
  app.use('/api/reports', reportRoutes);
  app.use('/api', mediaRoutes);

  // Rota de health check
  app.get('/health', (req: Request, res: Response) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });

  // Rota raiz - informações da API
  app.get('/', (req: Request, res: Response) => {
    res.json({
      name: 'Escuta DF API',
      version: '1.0.0',
      description: 'API de ouvidoria acessível e multicanal',
      endpoints: {
        reports: {
          create: 'POST /api/reports',
          list: 'GET /api/reports',
          getById: 'GET /api/reports/:id',
          getByProtocol: 'GET /api/reports/protocol/:protocolNumber',
          updateStatus: 'PATCH /api/reports/:id/status'
        },
        media: {
          upload: 'POST /api/reports/:reportId/media',
          transcribe: 'POST /api/transcribe'
        },
        health: 'GET /health'
      },
      features: [
        'Entrada multicanal (áudio, vídeo, imagem, texto)',
        'Transcrição via IA IZA',
        'Georreferenciamento de imagens',
        'Acessibilidade WCAG 2.1 AA',
        'Fluxo simplificado de 3 cliques'
      ]
    });
  });

  // Tratamento de rotas não encontradas
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: 'Rota não encontrada'
    });
  });

  // Tratamento de erros global
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Error:', err);
    res.status(500).json({
      success: false,
      message: config.nodeEnv === 'development' ? err.message : 'Erro interno do servidor'
    });
  });

  return app;
}
