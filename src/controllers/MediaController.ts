import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import reportRepository from '../models/ReportRepository';
import { MediaAttachment, InputType, TranscriptionResponse } from '../types';

/**
 * Controller para upload e processamento de mídia multicanal
 */
export class MediaController {
  /**
   * POST /api/reports/:reportId/media - Upload de mídia (áudio/vídeo/imagem)
   */
  async uploadMedia(req: Request, res: Response): Promise<void> {
    try {
      const { reportId } = req.params;
      const file = req.file;

      if (!file) {
        res.status(400).json({
          success: false,
          message: 'Nenhum arquivo enviado'
        });
        return;
      }

      const report = reportRepository.findById(reportId);
      if (!report) {
        res.status(404).json({
          success: false,
          message: 'Manifestação não encontrada'
        });
        return;
      }

      // Determinar tipo de mídia
      const type = this.getMediaType(file.mimetype);
      if (!type) {
        res.status(400).json({
          success: false,
          message: 'Tipo de arquivo não suportado'
        });
        return;
      }

      // Criar anexo
      const attachment: MediaAttachment = {
        id: uuidv4(),
        type,
        filename: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        url: `/uploads/${file.filename}`,
        uploadedAt: new Date(),
        geolocation: req.body.geolocation ? JSON.parse(req.body.geolocation) : undefined
      };

      // Transcrever se for áudio/vídeo e solicitado
      if ((type === InputType.AUDIO || type === InputType.VIDEO) && req.body.transcribe === 'true') {
        const transcription = await this.transcribeMedia(file);
        attachment.transcription = transcription.text;
        attachment.metadata = {
          transcriptionConfidence: transcription.confidence,
          language: transcription.language,
          duration: transcription.duration
        };
      }

      // Adicionar anexo ao relatório
      reportRepository.addAttachment(reportId, attachment);

      res.status(201).json({
        success: true,
        message: 'Mídia enviada com sucesso',
        data: attachment
      });
    } catch (error) {
      console.error('Error uploading media:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao enviar mídia'
      });
    }
  }

  /**
   * POST /api/transcribe - Transcrição de áudio/vídeo via IA IZA
   */
  async transcribe(req: Request, res: Response): Promise<void> {
    try {
      const file = req.file;

      if (!file) {
        res.status(400).json({
          success: false,
          message: 'Nenhum arquivo enviado'
        });
        return;
      }

      const type = this.getMediaType(file.mimetype);
      if (type !== InputType.AUDIO && type !== InputType.VIDEO) {
        res.status(400).json({
          success: false,
          message: 'Arquivo deve ser áudio ou vídeo'
        });
        return;
      }

      const transcription = await this.transcribeMedia(file);

      res.json({
        success: true,
        data: transcription
      });
    } catch (error) {
      console.error('Error transcribing media:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao transcrever mídia'
      });
    }
  }

  /**
   * Determina tipo de mídia pelo MIME type
   */
  private getMediaType(mimeType: string): InputType | null {
    if (mimeType.startsWith('audio/')) {
      return InputType.AUDIO;
    } else if (mimeType.startsWith('video/')) {
      return InputType.VIDEO;
    } else if (mimeType.startsWith('image/')) {
      return InputType.IMAGE;
    }
    return null;
  }

  /**
   * Transcreve áudio/vídeo usando IA IZA (simulado)
   * Em produção, integrar com API real da IZA
   */
  private async transcribeMedia(file: Express.Multer.File): Promise<TranscriptionResponse> {
    // Simulação de transcrição
    // Em produção, fazer chamada à API IZA:
    // const response = await izaClient.transcribe(file);
    
    return {
      text: 'Transcrição simulada do conteúdo de áudio/vídeo. Em produção, integrar com IA IZA.',
      confidence: 0.95,
      language: 'pt-BR',
      duration: 30
    };
  }
}

export default new MediaController();
