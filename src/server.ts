import { createApp } from './app';
import { config } from './config';

/**
 * Inicialização do servidor
 */
const app = createApp();

const server = app.listen(config.port, () => {
  console.log('╔═══════════════════════════════════════════════╗');
  console.log('║          🎙️  Escuta DF API                    ║');
  console.log('╚═══════════════════════════════════════════════╝');
  console.log('');
  console.log(`🚀 Servidor rodando em: http://localhost:${config.port}`);
  console.log(`📝 Ambiente: ${config.nodeEnv}`);
  console.log(`⚡ Health check: http://localhost:${config.port}/health`);
  console.log(`📖 API info: http://localhost:${config.port}/`);
  console.log('');
  console.log('Recursos disponíveis:');
  console.log('  ✅ Entrada multicanal (áudio, vídeo, imagem, texto)');
  console.log('  ✅ Transcrição via IA IZA');
  console.log('  ✅ Georreferenciamento');
  console.log('  ✅ WCAG 2.1 AA');
  console.log('  ✅ Fluxo de 3 cliques');
  console.log('');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM recebido, encerrando servidor...');
  server.close(() => {
    console.log('Servidor encerrado');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT recebido, encerrando servidor...');
  server.close(() => {
    console.log('Servidor encerrado');
    process.exit(0);
  });
});
