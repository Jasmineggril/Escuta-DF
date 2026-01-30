# 🔌 API Reference - Escuta DF

## Base URL

```
http://localhost:3000/api
```

## Autenticação

Atualmente não requer autenticação. Em versões futuras, será implementado JWT.

## Rate Limiting

- **Limite**: 100 requisições por 15 minutos por IP
- **Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

## Formatos

- **Request**: JSON ou multipart/form-data (para uploads)
- **Response**: JSON
- **Charset**: UTF-8

## Endpoints

### Health Check

#### `GET /health`

Verifica o status da API.

**Resposta**:
```json
{
  "status": "ok",
  "timestamp": "2024-01-30T12:00:00.000Z",
  "uptime": 3600
}
```

---

### Manifestações (Reports)

#### `POST /api/reports`

Cria uma nova manifestação.

**Body**:
```json
{
  "category": "complaint",
  "title": "Título opcional",
  "description": "Descrição da manifestação (10-5000 caracteres)",
  "citizenName": "Nome do cidadão (opcional se anônimo)",
  "citizenEmail": "email@example.com",
  "citizenPhone": "(61) 99999-9999",
  "isAnonymous": false,
  "primaryInputType": "audio",
  "location": {
    "latitude": -15.7942,
    "longitude": -47.8822,
    "accuracy": 10,
    "address": "Avenida W3 Sul, Brasília, DF"
  }
}
```

**Validações**:
- `category`: deve ser um de: `complaint`, `suggestion`, `compliment`, `request`, `information`
- `description`: obrigatório, 10-5000 caracteres
- `title`: opcional, máximo 200 caracteres
- `citizenEmail`: deve ser email válido (se fornecido)
- `location.latitude`: -90 a 90
- `location.longitude`: -180 a 180

**Resposta** (201 Created):
```json
{
  "success": true,
  "message": "Manifestação criada com sucesso",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "protocolNumber": "DF-2024-1706633456789-123",
    "status": "submitted",
    "createdAt": "2024-01-30T12:30:00.000Z"
  }
}
```

**Erros**:
- `400`: Validação falhou
- `500`: Erro interno

---

#### `GET /api/reports/:id`

Busca uma manifestação pelo ID.

**Parâmetros**:
- `id` (path): UUID da manifestação

**Resposta** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "protocolNumber": "DF-2024-1706633456789-123",
    "category": "complaint",
    "status": "submitted",
    "title": "Buraco na via pública",
    "description": "Há um grande buraco na Avenida W3 Sul",
    "citizenName": "João Silva",
    "citizenEmail": "joao@example.com",
    "citizenPhone": "(61) 99999-9999",
    "isAnonymous": false,
    "attachments": [],
    "primaryInputType": "audio",
    "location": {
      "latitude": -15.7942,
      "longitude": -47.8822,
      "accuracy": 10,
      "address": "Avenida W3 Sul, Brasília, DF"
    },
    "createdAt": "2024-01-30T12:30:00.000Z",
    "updatedAt": "2024-01-30T12:30:00.000Z"
  }
}
```

**Erros**:
- `404`: Manifestação não encontrada
- `500`: Erro interno

---

#### `GET /api/reports/protocol/:protocolNumber`

Busca uma manifestação pelo número de protocolo.

**Parâmetros**:
- `protocolNumber` (path): Número de protocolo (ex: DF-2024-1706633456789-123)

**Resposta**: Mesma estrutura do `GET /api/reports/:id`

**Erros**:
- `404`: Manifestação não encontrada
- `500`: Erro interno

---

#### `GET /api/reports`

Lista manifestações com filtros e paginação.

**Query Parameters**:
- `status` (opcional): Filtrar por status (`submitted`, `in_review`, `in_progress`, `resolved`, `closed`)
- `category` (opcional): Filtrar por categoria (`complaint`, `suggestion`, `compliment`, `request`, `information`)
- `isAnonymous` (opcional): `true` ou `false`
- `startDate` (opcional): Data inicial (ISO 8601)
- `endDate` (opcional): Data final (ISO 8601)
- `page` (opcional): Número da página (padrão: 1)
- `limit` (opcional): Itens por página (padrão: 10, máximo: 100)

**Exemplo**:
```
GET /api/reports?status=submitted&category=complaint&page=1&limit=10
```

**Resposta** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "protocolNumber": "DF-2024-1706633456789-123",
      "category": "complaint",
      "status": "submitted",
      "title": "Buraco na via pública",
      "description": "Há um grande buraco na Avenida W3 Sul",
      "createdAt": "2024-01-30T12:30:00.000Z"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 10,
  "totalPages": 10
}
```

**Erros**:
- `500`: Erro interno

---

#### `PATCH /api/reports/:id/status`

Atualiza o status de uma manifestação.

**Parâmetros**:
- `id` (path): UUID da manifestação

**Body**:
```json
{
  "status": "in_review"
}
```

**Valores válidos de status**:
- `submitted`
- `in_review`
- `in_progress`
- `resolved`
- `closed`

**Resposta** (200 OK):
```json
{
  "success": true,
  "message": "Status atualizado com sucesso",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "protocolNumber": "DF-2024-1706633456789-123",
    "status": "in_review",
    "updatedAt": "2024-01-30T12:35:00.000Z"
  }
}
```

**Erros**:
- `400`: Status inválido
- `404`: Manifestação não encontrada
- `500`: Erro interno

---

### Mídia (Media)

#### `POST /api/reports/:reportId/media`

Faz upload de arquivo de mídia (áudio, vídeo ou imagem) para uma manifestação.

**Parâmetros**:
- `reportId` (path): UUID da manifestação

**Body** (multipart/form-data):
- `file` (obrigatório): Arquivo de mídia
- `geolocation` (opcional): String JSON com dados de geolocalização
- `transcribe` (opcional): `"true"` para transcrever áudio/vídeo

**Tipos de arquivo permitidos**:
- **Áudio**: mp3, wav, ogg, webm, mp4
- **Vídeo**: mp4, webm, ogg, quicktime
- **Imagem**: jpeg, jpg, png, webp, gif

**Tamanho máximo**: 50MB

**Exemplo (cURL)**:
```bash
curl -X POST \
  http://localhost:3000/api/reports/550e8400-e29b-41d4-a716-446655440000/media \
  -F "file=@audio.mp3" \
  -F "transcribe=true" \
  -F 'geolocation={"latitude":-15.7942,"longitude":-47.8822}'
```

**Resposta** (201 Created):
```json
{
  "success": true,
  "message": "Mídia enviada com sucesso",
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "type": "audio",
    "filename": "audio.mp3",
    "mimeType": "audio/mpeg",
    "size": 524288,
    "url": "/uploads/audio-1706633456789-123.mp3",
    "uploadedAt": "2024-01-30T12:30:56.789Z",
    "transcription": "Transcrição do áudio...",
    "metadata": {
      "transcriptionConfidence": 0.95,
      "language": "pt-BR",
      "duration": 30
    }
  }
}
```

**Erros**:
- `400`: Arquivo não enviado ou tipo não suportado
- `404`: Manifestação não encontrada
- `413`: Arquivo muito grande
- `500`: Erro interno

---

#### `POST /api/transcribe`

Transcreve um arquivo de áudio ou vídeo usando IA IZA.

**Body** (multipart/form-data):
- `file` (obrigatório): Arquivo de áudio ou vídeo

**Tipos de arquivo permitidos**:
- **Áudio**: mp3, wav, ogg, webm, mp4
- **Vídeo**: mp4, webm, ogg, quicktime

**Tamanho máximo**: 50MB

**Exemplo (cURL)**:
```bash
curl -X POST \
  http://localhost:3000/api/transcribe \
  -F "file=@audio.mp3"
```

**Resposta** (200 OK):
```json
{
  "success": true,
  "data": {
    "text": "Transcrição do conteúdo de áudio...",
    "confidence": 0.95,
    "language": "pt-BR",
    "duration": 30
  }
}
```

**Erros**:
- `400`: Arquivo não enviado ou não é áudio/vídeo
- `413`: Arquivo muito grande
- `500`: Erro interno

---

## Códigos de Status HTTP

- `200 OK`: Requisição bem-sucedida
- `201 Created`: Recurso criado com sucesso
- `400 Bad Request`: Dados inválidos
- `404 Not Found`: Recurso não encontrado
- `413 Payload Too Large`: Arquivo muito grande
- `429 Too Many Requests`: Rate limit excedido
- `500 Internal Server Error`: Erro no servidor

## Estrutura de Erro

```json
{
  "success": false,
  "message": "Mensagem de erro",
  "errors": [
    {
      "field": "description",
      "message": "Descrição deve ter entre 10 e 5000 caracteres"
    }
  ]
}
```

## Exemplos de Uso

### Exemplo 1: Criar manifestação com áudio

```javascript
// 1. Criar manifestação
const response1 = await fetch('http://localhost:3000/api/reports', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    category: 'complaint',
    description: 'Descrição inicial',
    isAnonymous: false,
    citizenEmail: 'user@example.com',
    primaryInputType: 'audio'
  })
});

const { data } = await response1.json();
const reportId = data.id;

// 2. Upload de áudio
const formData = new FormData();
formData.append('file', audioBlob, 'audio.mp3');
formData.append('transcribe', 'true');

const response2 = await fetch(`http://localhost:3000/api/reports/${reportId}/media`, {
  method: 'POST',
  body: formData
});

const result = await response2.json();
console.log('Transcrição:', result.data.transcription);
```

### Exemplo 2: Consultar manifestação por protocolo

```javascript
const protocolNumber = 'DF-2024-1706633456789-123';

const response = await fetch(
  `http://localhost:3000/api/reports/protocol/${protocolNumber}`
);

const { data } = await response.json();
console.log('Status:', data.status);
console.log('Descrição:', data.description);
```

### Exemplo 3: Listar manifestações filtradas

```javascript
const params = new URLSearchParams({
  status: 'submitted',
  category: 'complaint',
  page: '1',
  limit: '20'
});

const response = await fetch(
  `http://localhost:3000/api/reports?${params}`
);

const result = await response.json();
console.log('Total:', result.total);
console.log('Manifestações:', result.data);
```

## Integração com IA IZA

### Configuração

Adicionar no arquivo `.env`:

```bash
IZA_API_URL=https://api.iza.example.com/v1/transcribe
IZA_API_KEY=your-api-key-here
```

### Fluxo de Transcrição

1. Usuário envia áudio/vídeo com `transcribe=true`
2. API salva arquivo no servidor
3. API envia arquivo para IA IZA
4. IZA retorna transcrição
5. API salva transcrição no anexo
6. API retorna resultado ao usuário

### Formato de Resposta da IZA (Esperado)

```json
{
  "text": "Transcrição do áudio...",
  "confidence": 0.95,
  "language": "pt-BR",
  "duration": 30,
  "segments": [
    {
      "start": 0,
      "end": 5,
      "text": "Olá, gostaria de fazer uma denúncia"
    }
  ]
}
```

## Boas Práticas

1. **Sempre valide os dados** antes de enviar
2. **Use HTTPS** em produção
3. **Implemente retry logic** para uploads grandes
4. **Comprima arquivos** antes de enviar
5. **Trate erros adequadamente**
6. **Respeite o rate limit**
7. **Use paginação** para listas grandes
8. **Cache respostas** quando apropriado

## Próximos Passos

- [ ] Autenticação JWT
- [ ] WebSockets para atualizações em tempo real
- [ ] GraphQL API
- [ ] Versionamento da API (v2)
- [ ] Documentação OpenAPI/Swagger
