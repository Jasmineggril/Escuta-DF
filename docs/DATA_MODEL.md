# 📊 Modelagem de Dados - Escuta DF

## Visão Geral

Este documento descreve a modelagem de dados do sistema Escuta DF, incluindo entidades, relacionamentos e estruturas de dados.

## Entidades Principais

### 1. Report (Manifestação)

Representa uma manifestação/denúncia/solicitação feita por um cidadão.

```typescript
interface Report {
  // Identificação
  id: string;                    // UUID único
  protocolNumber: string;        // Número de protocolo legível (ex: DF-2024-1706633456789-123)
  
  // Classificação
  category: ReportCategory;      // Tipo da manifestação
  status: ReportStatus;          // Status atual
  
  // Conteúdo
  title?: string;                // Título opcional (max 200 chars)
  description: string;           // Descrição/conteúdo (10-5000 chars)
  
  // Dados do cidadão (opcionais para manifestações anônimas)
  citizenName?: string;
  citizenEmail?: string;
  citizenPhone?: string;
  isAnonymous: boolean;
  
  // Mídia
  attachments: MediaAttachment[]; // Lista de anexos
  primaryInputType: InputType;    // Canal principal usado
  
  // Localização
  location?: Geolocation;
  
  // Temporal
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  
  // Auditoria
  ipAddress?: string;
  userAgent?: string;
}
```

**Índices sugeridos (para DB futuro)**:
- `id` (Primary Key)
- `protocolNumber` (Unique)
- `status` (para filtros)
- `category` (para filtros)
- `createdAt` (para ordenação)

### 2. MediaAttachment (Anexo de Mídia)

Representa um arquivo de mídia anexado a uma manifestação.

```typescript
interface MediaAttachment {
  // Identificação
  id: string;                    // UUID único
  
  // Arquivo
  type: InputType;               // audio, video, image, text
  filename: string;              // Nome original
  mimeType: string;              // ex: audio/mpeg, video/mp4
  size: number;                  // Tamanho em bytes
  url: string;                   // Caminho/URL para acesso
  
  // Temporal
  uploadedAt: Date;
  
  // Processamento
  transcription?: string;        // Transcrição de áudio/vídeo (IA IZA)
  geolocation?: Geolocation;     // Geolocalização (para imagens)
  metadata?: Record<string, any>; // Metadados adicionais
}
```

### 3. Geolocation (Geolocalização)

Dados de localização geográfica.

```typescript
interface Geolocation {
  latitude: number;              // -90 a 90
  longitude: number;             // -180 a 180
  accuracy?: number;             // Precisão em metros
  address?: string;              // Endereço legível (geocoding)
}
```

## Enumerações

### ReportCategory (Categoria)

```typescript
enum ReportCategory {
  COMPLAINT = 'complaint',         // Denúncia/reclamação
  SUGGESTION = 'suggestion',       // Sugestão
  COMPLIMENT = 'compliment',       // Elogio
  REQUEST = 'request',             // Solicitação
  INFORMATION = 'information'      // Pedido de informação
}
```

### ReportStatus (Status)

```typescript
enum ReportStatus {
  SUBMITTED = 'submitted',         // Enviado
  IN_REVIEW = 'in_review',        // Em análise
  IN_PROGRESS = 'in_progress',    // Em andamento
  RESOLVED = 'resolved',          // Resolvido
  CLOSED = 'closed'               // Fechado
}
```

### InputType (Tipo de Entrada)

```typescript
enum InputType {
  AUDIO = 'audio',     // Áudio gravado
  VIDEO = 'video',     // Vídeo (Libras)
  IMAGE = 'image',     // Imagem georreferenciada
  TEXT = 'text'        // Texto digitado
}
```

## Relacionamentos

```
Report (1) ──── (N) MediaAttachment
   │
   └──── (0..1) Geolocation

MediaAttachment ──── (0..1) Geolocation
```

## DTOs (Data Transfer Objects)

### CreateReportDto

DTO para criação de nova manifestação.

```typescript
interface CreateReportDto {
  category: ReportCategory;
  title?: string;
  description: string;
  citizenName?: string;
  citizenEmail?: string;
  citizenPhone?: string;
  isAnonymous: boolean;
  primaryInputType: InputType;
  location?: Geolocation;
}
```

**Validações**:
- `category`: deve ser valor válido de ReportCategory
- `description`: 10-5000 caracteres
- `title`: máximo 200 caracteres (opcional)
- `citizenEmail`: formato de email válido (se fornecido)
- `citizenPhone`: formato de telefone (se fornecido)
- `location.latitude`: -90 a 90
- `location.longitude`: -180 a 180

### MediaUploadDto

DTO para upload de mídia.

```typescript
interface MediaUploadDto {
  reportId: string;              // ID da manifestação
  type: InputType;
  file: File;                    // Arquivo multipart
  geolocation?: Geolocation;     // Opcional para imagens
  transcribe?: boolean;          // Se deve transcrever (áudio/vídeo)
}
```

### ReportFilters

Filtros para busca de manifestações.

```typescript
interface ReportFilters {
  status?: ReportStatus;
  category?: ReportCategory;
  startDate?: Date;
  endDate?: Date;
  isAnonymous?: boolean;
  page?: number;                 // Paginação
  limit?: number;                // Itens por página
}
```

## Resposta de API

### Resposta Padrão

```typescript
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: ValidationError[];
}
```

### Resposta Paginada

```typescript
interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

## Exemplos de Dados

### Exemplo 1: Manifestação com Áudio

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "protocolNumber": "DF-2024-1706633456789-123",
  "category": "complaint",
  "status": "submitted",
  "title": "Buraco na via pública",
  "description": "Há um grande buraco na Avenida W3 Sul que está causando acidentes",
  "citizenName": "João Silva",
  "citizenEmail": "joao@example.com",
  "citizenPhone": "(61) 99999-9999",
  "isAnonymous": false,
  "attachments": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "type": "audio",
      "filename": "audio-gravacao.mp3",
      "mimeType": "audio/mpeg",
      "size": 524288,
      "url": "/uploads/audio-1706633456789-123.mp3",
      "uploadedAt": "2024-01-30T12:30:56.789Z",
      "transcription": "Há um grande buraco na Avenida W3 Sul que está causando acidentes",
      "metadata": {
        "transcriptionConfidence": 0.95,
        "language": "pt-BR",
        "duration": 15
      }
    }
  ],
  "primaryInputType": "audio",
  "location": {
    "latitude": -15.7942,
    "longitude": -47.8822,
    "accuracy": 10,
    "address": "Avenida W3 Sul, Brasília, DF"
  },
  "createdAt": "2024-01-30T12:30:00.000Z",
  "updatedAt": "2024-01-30T12:30:56.789Z",
  "ipAddress": "192.168.1.1",
  "userAgent": "Mozilla/5.0 ..."
}
```

### Exemplo 2: Manifestação Anônima com Vídeo (Libras)

```json
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "protocolNumber": "DF-2024-1706633500000-456",
  "category": "suggestion",
  "status": "submitted",
  "description": "Sugestão para melhorar a acessibilidade no parque",
  "isAnonymous": true,
  "attachments": [
    {
      "id": "880e8400-e29b-41d4-a716-446655440003",
      "type": "video",
      "filename": "video-libras.mp4",
      "mimeType": "video/mp4",
      "size": 2097152,
      "url": "/uploads/video-1706633500000-456.mp4",
      "uploadedAt": "2024-01-30T12:35:00.000Z",
      "transcription": "Gostaria de sugerir a instalação de mais rampas de acessibilidade no parque da cidade",
      "metadata": {
        "transcriptionConfidence": 0.88,
        "language": "pt-BR",
        "duration": 30
      }
    }
  ],
  "primaryInputType": "video",
  "createdAt": "2024-01-30T12:35:00.000Z",
  "updatedAt": "2024-01-30T12:35:00.000Z"
}
```

### Exemplo 3: Manifestação com Imagem Georreferenciada

```json
{
  "id": "990e8400-e29b-41d4-a716-446655440004",
  "protocolNumber": "DF-2024-1706633600000-789",
  "category": "complaint",
  "status": "submitted",
  "title": "Lixo acumulado",
  "description": "Lixo acumulado na esquina",
  "citizenEmail": "maria@example.com",
  "isAnonymous": false,
  "attachments": [
    {
      "id": "aa0e8400-e29b-41d4-a716-446655440005",
      "type": "image",
      "filename": "foto-lixo.jpg",
      "mimeType": "image/jpeg",
      "size": 1048576,
      "url": "/uploads/image-1706633600000-789.jpg",
      "uploadedAt": "2024-01-30T12:40:00.000Z",
      "geolocation": {
        "latitude": -15.7801,
        "longitude": -47.9292,
        "accuracy": 5,
        "address": "Quadra 102 Sul, Brasília, DF"
      }
    }
  ],
  "primaryInputType": "image",
  "location": {
    "latitude": -15.7801,
    "longitude": -47.9292,
    "accuracy": 5,
    "address": "Quadra 102 Sul, Brasília, DF"
  },
  "createdAt": "2024-01-30T12:40:00.000Z",
  "updatedAt": "2024-01-30T12:40:00.000Z"
}
```

## Migração para Banco de Dados

### Schema PostgreSQL (Futuro)

```sql
-- Tabela de manifestações
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  protocol_number VARCHAR(100) UNIQUE NOT NULL,
  category VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'submitted',
  title VARCHAR(200),
  description TEXT NOT NULL,
  citizen_name VARCHAR(200),
  citizen_email VARCHAR(200),
  citizen_phone VARCHAR(50),
  is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
  primary_input_type VARCHAR(20) NOT NULL,
  location_latitude DECIMAL(10, 8),
  location_longitude DECIMAL(11, 8),
  location_accuracy DECIMAL(10, 2),
  location_address TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMP,
  ip_address INET,
  user_agent TEXT
);

-- Tabela de anexos
CREATE TABLE media_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL,
  filename VARCHAR(500) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  size INTEGER NOT NULL,
  url VARCHAR(500) NOT NULL,
  uploaded_at TIMESTAMP NOT NULL DEFAULT NOW(),
  transcription TEXT,
  geo_latitude DECIMAL(10, 8),
  geo_longitude DECIMAL(11, 8),
  geo_accuracy DECIMAL(10, 2),
  geo_address TEXT,
  metadata JSONB
);

-- Índices
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_category ON reports(category);
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX idx_reports_protocol ON reports(protocol_number);
CREATE INDEX idx_media_report_id ON media_attachments(report_id);
```

## Considerações de Performance

1. **Paginação**: Sempre paginar listas de manifestações
2. **Índices**: Criar índices em campos de busca frequente
3. **Cache**: Cachear dados de relatórios não modificados
4. **Lazy Loading**: Carregar anexos sob demanda
5. **Compressão**: Comprimir imagens e vídeos grandes

## Considerações de Segurança

1. **LGPD**: Dados pessoais devem ser protegidos
2. **Anonimização**: Opção de manifestação anônima
3. **Auditoria**: Logs de todas as operações
4. **Validação**: Validar todos os inputs
5. **Encriptação**: Dados sensíveis encriptados em repouso
