import { Router } from 'express';
import mediaController from '../controllers/MediaController';
import { upload } from '../middleware/upload';

const router = Router();

/**
 * Rotas de mídia multicanal
 */

// Upload de mídia para relatório específico
router.post('/reports/:reportId/media', 
  upload.single('file'), 
  mediaController.uploadMedia.bind(mediaController)
);

// Transcrição de áudio/vídeo via IA IZA
router.post('/transcribe', 
  upload.single('file'), 
  mediaController.transcribe.bind(mediaController)
);

export default router;
