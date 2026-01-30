import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

export const config = {
  // Servidor
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // CORS
  corsOrigin: process.env.CORS_ORIGIN || '*',
  
  // Rate limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 min
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100'), // 100 requests
  
  // Uploads
  uploadDir: process.env.UPLOAD_DIR || 'uploads',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '52428800'), // 50MB
  
  // IZA AI (para integração futura)
  izaApiUrl: process.env.IZA_API_URL || '',
  izaApiKey: process.env.IZA_API_KEY || '',
  
  // Segurança
  jwtSecret: process.env.JWT_SECRET || 'change-me-in-production',
  
  // Base de dados (para implementação futura)
  databaseUrl: process.env.DATABASE_URL || ''
};
