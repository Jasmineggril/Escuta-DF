# 🎙️ Escuta DF

> Ouvidoria acessível e multicanal (PWA) para o 1º Hackathon Participa DF. Falar com o governo deve ser tão fácil quanto mandar um áudio.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![WCAG 2.1 AA](https://img.shields.io/badge/WCAG-2.1%20AA-green.svg)](https://www.w3.org/WAI/WCAG21/quickref/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue.svg)](https://www.typescriptlang.org/)

## 📋 Sobre o Projeto

Escuta DF é uma Progressive Web App (PWA) que democratiza o acesso à ouvidoria do Distrito Federal, permitindo que cidadãos façam manifestações através de múltiplos canais de comunicação de forma acessível e intuitiva.

### ✨ Características Principais

- 🎤 **Entrada Multicanal**: Áudio, vídeo (Libras), imagem georreferenciada e texto
- ♿ **Acessibilidade WCAG 2.1 AA**: Totalmente acessível para pessoas com deficiência
- 🚀 **Fluxo de 3 Cliques**: Interface simplificada para envio rápido
- 🤖 **IA IZA**: Transcrição automática de áudio e vídeo
- 📍 **Georreferenciamento**: Localização precisa de problemas urbanos
- 📱 **PWA**: Funciona offline e pode ser instalado no dispositivo
- 🔒 **Segurança**: Rate limiting, validação e proteção de dados
- ⚡ **Performance**: Otimizado para hardware simples

## 🏗️ Arquitetura

```
Frontend (PWA) ──► Backend (Node.js/TypeScript) ──► IA IZA
                            │
                            └──► Armazenamento
```

- **Frontend**: PWA com Service Worker para offline-first
- **Backend**: Express.js + TypeScript com arquitetura em camadas
- **IA**: Integração com IA IZA para transcrição
- **Dados**: Repository pattern (preparado para PostgreSQL)

📖 [Documentação de Arquitetura Completa](docs/ARCHITECTURE.md)

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 20+ 
- npm ou yarn

### Instalação

```bash
# Clone o repositório
git clone https://github.com/Jasmineggril/Escuta-DF.git
cd Escuta-DF

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas configurações

# Execute em desenvolvimento
npm run dev

# Ou compile e execute em produção
npm run build
npm start
```

A API estará disponível em `http://localhost:3000`

### Testes Rápidos

```bash
# Health check
curl http://localhost:3000/health

# Criar manifestação
curl -X POST http://localhost:3000/api/reports \
  -H "Content-Type: application/json" \
  -d '{
    "category": "complaint",
    "description": "Teste de manifestação",
    "isAnonymous": false,
    "primaryInputType": "text"
  }'
```

## 📚 Documentação

- [📐 Arquitetura](docs/ARCHITECTURE.md) - Visão geral da arquitetura do sistema
- [📊 Modelagem de Dados](docs/DATA_MODEL.md) - Estruturas de dados e relacionamentos
- [🔌 Referência da API](docs/API.md) - Documentação completa dos endpoints
- [🚀 Guia de Deploy](docs/DEPLOYMENT.md) - Como colocar em produção

## 🔌 Endpoints da API

### Manifestações

- `POST /api/reports` - Criar nova manifestação
- `GET /api/reports` - Listar manifestações (com filtros)
- `GET /api/reports/:id` - Buscar por ID
- `GET /api/reports/protocol/:number` - Buscar por protocolo
- `PATCH /api/reports/:id/status` - Atualizar status

### Mídia

- `POST /api/reports/:reportId/media` - Upload de mídia (áudio/vídeo/imagem)
- `POST /api/transcribe` - Transcrever áudio/vídeo com IA IZA

### Utilitários

- `GET /health` - Health check
- `GET /` - Informações da API

📖 [Documentação completa da API](docs/API.md)

## 🎨 Exemplo de Uso

### Criar Manifestação com Áudio

```javascript
// 1. Criar manifestação
const report = await fetch('http://localhost:3000/api/reports', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    category: 'complaint',
    description: 'Descrição inicial',
    primaryInputType: 'audio',
    isAnonymous: false
  })
}).then(r => r.json());

// 2. Upload de áudio com transcrição
const formData = new FormData();
formData.append('file', audioBlob, 'audio.mp3');
formData.append('transcribe', 'true');

const media = await fetch(
  `http://localhost:3000/api/reports/${report.data.id}/media`,
  { method: 'POST', body: formData }
).then(r => r.json());

console.log('Protocolo:', report.data.protocolNumber);
console.log('Transcrição:', media.data.transcription);
```

## 🎯 Fluxo de 3 Cliques

1. **Clique 1**: Selecione o tipo de manifestação (denúncia, sugestão, etc.)
2. **Clique 2**: Grave/envie seu conteúdo (áudio, vídeo, foto ou texto)
3. **Clique 3**: Confirme e envie - receba seu número de protocolo!

## ♿ Acessibilidade (WCAG 2.1 AA)

- ✅ Navegação completa por teclado
- ✅ Suporte a leitores de tela
- ✅ Contraste de cores adequado (4.5:1)
- ✅ Áreas de toque mínimas de 44x44px
- ✅ Indicadores de foco visíveis
- ✅ Suporte a Libras via vídeo
- ✅ Transcrição automática de áudio

## 🔒 Segurança

- HTTPS obrigatório em produção
- Rate limiting (100 req/15min)
- Validação de entrada com express-validator
- Headers de segurança com Helmet.js
- Proteção CORS configurável
- Logs de auditoria

## 🛠️ Stack Tecnológica

### Backend
- Node.js 20+
- TypeScript 5.3+
- Express.js
- Multer (upload de arquivos)
- express-validator
- Helmet.js (segurança)

### PWA
- Service Worker
- Web App Manifest
- Cache API
- IndexedDB (futuro)

### Futuro
- PostgreSQL (banco de dados)
- Redis (cache)
- AWS S3 (armazenamento)
- Docker (containerização)

## 📦 Scripts Disponíveis

```bash
npm run dev      # Desenvolvimento com hot reload
npm run build    # Compilar TypeScript
npm start        # Executar em produção
npm test         # Executar testes (futuro)
```

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Autores

- **Jasmine de Sá Araújo** - Desenvolvedora Principal

## 🙏 Agradecimentos

- 1º Hackathon Participa DF
- Comunidade de desenvolvedores de software livre
- Equipe da IA IZA

## 📧 Contato

Para dúvidas, sugestões ou reportar problemas, abra uma issue no GitHub.

---

**Escuta DF** - Falar com o governo deve ser tão fácil quanto mandar um áudio 🎙️
