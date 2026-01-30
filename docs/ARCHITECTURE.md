# 🏛️ Arquitetura - Escuta DF

## Visão Geral

Escuta DF é uma PWA (Progressive Web App) de ouvidoria acessível que segue os padrões WCAG 2.1 AA e suporta entradas multicanais.

## Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend PWA                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Interface Acessível (WCAG 2.1 AA)                   │  │
│  │  - Fluxo de 3 cliques                                │  │
│  │  - Suporte a leitores de tela                        │  │
│  │  - Alto contraste                                    │  │
│  │  - Navegação por teclado                             │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Componentes de Entrada Multicanal                   │  │
│  │  ┌────────────┬────────────┬─────────┬─────────────┐ │  │
│  │  │   Áudio    │   Vídeo    │ Imagem  │    Texto    │ │  │
│  │  │ (Gravação) │  (Libras)  │  (Geo)  │  (Teclado)  │ │  │
│  │  └────────────┴────────────┴─────────┴─────────────┘ │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Service Worker (Offline First)                      │  │
│  │  - Cache de recursos                                 │  │
│  │  - Background sync                                   │  │
│  │  - Push notifications                                │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS/REST
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Backend API (Node.js)                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Camada de Segurança                                 │  │
│  │  - Helmet.js                                         │  │
│  │  - Rate Limiting                                     │  │
│  │  - CORS                                              │  │
│  │  - Input Validation                                  │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Controllers                                         │  │
│  │  - ReportController (CRUD de manifestações)          │  │
│  │  - MediaController (Upload e processamento)          │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Models/Repository                                   │  │
│  │  - ReportRepository (Lógica de negócio)             │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴──────────┐
                    ▼                    ▼
        ┌────────────────────┐  ┌──────────────────┐
        │  IA IZA (Externo)  │  │  Armazenamento   │
        │   Transcrição      │  │    de Mídia      │
        │  Áudio/Vídeo       │  │  (Sistema Arq.)  │
        └────────────────────┘  └──────────────────┘
```

## Princípios de Design

### 1. Acessibilidade em Primeiro Lugar (WCAG 2.1 AA)
- **Navegação por teclado**: Todos os componentes acessíveis via Tab
- **ARIA labels**: Descrições semânticas para leitores de tela
- **Contraste**: Razão mínima de 4.5:1 para texto
- **Tamanhos de toque**: Mínimo 44x44px para áreas clicáveis
- **Foco visível**: Indicadores claros de foco

### 2. Fluxo de 3 Cliques
Usuário deve conseguir criar uma manifestação em 3 passos:
1. **Clique 1**: Selecionar tipo de manifestação
2. **Clique 2**: Gravar/enviar conteúdo (áudio/vídeo/imagem/texto)
3. **Clique 3**: Confirmar e enviar

### 3. Performance para Hardware Simples
- **Otimização de assets**: Compressão de imagens e mídia
- **Lazy loading**: Carregar componentes sob demanda
- **Service Worker**: Cache agressivo de recursos estáticos
- **Código minificado**: Bundle otimizado
- **Sem dependências pesadas**: Apenas bibliotecas essenciais

### 4. Segurança
- **HTTPS obrigatório**: Todas as comunicações criptografadas
- **Rate limiting**: Proteção contra abuso
- **Validação de entrada**: Sanitização de todos os inputs
- **Headers de segurança**: Helmet.js para proteção
- **Sem exposição de dados sensíveis**: Logs e erros sanitizados

## Camadas da Aplicação

### Frontend (PWA)
- **Framework**: HTML5 + CSS3 + JavaScript (Vanilla ou React/Vue)
- **Manifest**: PWA manifest para instalação
- **Service Worker**: Offline-first strategy
- **Inputs multicanal**:
  - MediaRecorder API (áudio/vídeo)
  - Geolocation API (coordenadas)
  - File API (upload de imagens)

### Backend (Node.js + TypeScript)
- **Framework**: Express.js
- **Linguagem**: TypeScript
- **Validação**: express-validator
- **Upload**: Multer
- **Segurança**: Helmet, CORS, Rate Limiting

### Dados
- **Estrutura atual**: In-memory (Map)
- **Futuro**: PostgreSQL ou MongoDB
- **Armazenamento de mídia**: Sistema de arquivos (futuro: S3/Cloud Storage)

## Fluxo de Dados

### Criação de Manifestação com Áudio
```
1. Usuário → Grava áudio no navegador
2. Frontend → POST /api/reports (cria manifestação)
3. Backend → Retorna ID + protocolo
4. Frontend → POST /api/reports/:id/media (upload áudio)
5. Backend → Chama IA IZA para transcrição
6. Backend → Salva transcrição + áudio
7. Backend → Retorna sucesso
8. Frontend → Exibe protocolo ao usuário
```

### Consulta de Manifestação
```
1. Usuário → Informa número de protocolo
2. Frontend → GET /api/reports/protocol/:number
3. Backend → Busca no repositório
4. Backend → Retorna dados completos
5. Frontend → Exibe status e detalhes
```

## Integração com IA IZA

A transcrição de áudio/vídeo é feita através da IA IZA:

```typescript
// Pseudo-código da integração
async function transcribeMedia(audioFile: File): Promise<string> {
  const response = await fetch(IZA_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${IZA_API_KEY}`,
      'Content-Type': 'multipart/form-data'
    },
    body: audioFile
  });
  
  const { text } = await response.json();
  return text;
}
```

## Escalabilidade

### Fase 1 (Atual - MVP)
- Backend único
- Armazenamento em memória
- Arquivos em sistema local

### Fase 2 (Produção Inicial)
- Banco de dados PostgreSQL
- Armazenamento em S3/Cloud Storage
- Cache com Redis

### Fase 3 (Escala)
- Múltiplas instâncias (Load Balancer)
- CDN para assets estáticos
- Filas para processamento assíncrono
- Microserviços (se necessário)

## Segurança

### Camadas de Proteção
1. **HTTPS**: Comunicação criptografada
2. **Helmet.js**: Headers de segurança HTTP
3. **Rate Limiting**: Limite de requisições por IP
4. **CORS**: Controle de origens permitidas
5. **Validação**: Sanitização de todos os inputs
6. **Logs**: Auditoria de ações críticas

### Dados Sensíveis
- IPs armazenados para auditoria (LGPD compliant)
- Dados de cidadãos criptografados em repouso
- Opção de anonimato total
- Não armazenar senhas (autenticação futura via OAuth)

## Monitoramento

### Métricas Importantes
- Taxa de criação de manifestações
- Tempo de resposta da API
- Taxa de erro
- Uso de cada canal (áudio/vídeo/imagem/texto)
- Taxa de transcrição bem-sucedida
- Dispositivos e navegadores usados

### Logs
- Requisições HTTP
- Erros e exceções
- Uploads de mídia
- Transcrições
- Mudanças de status

## Próximos Passos

1. ✅ Arquitetura definida
2. ✅ Modelos de dados criados
3. ✅ API endpoints implementados
4. ⏳ Frontend PWA
5. ⏳ Integração real com IA IZA
6. ⏳ Banco de dados persistente
7. ⏳ Testes automatizados
8. ⏳ Deploy em produção
