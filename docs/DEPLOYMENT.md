# 🚀 Guia de Deploy - Escuta DF

## Visão Geral

Este guia cobre as diferentes formas de colocar o Escuta DF em produção, desde deploys simples até configurações mais avançadas.

## Pré-requisitos de Produção

- Node.js 20 LTS ou superior
- Domínio com SSL/TLS (HTTPS)
- Servidor com mínimo 1GB RAM
- Banco de dados PostgreSQL (recomendado para produção)
- Armazenamento para uploads (S3 ou similar)

## Opções de Deploy

### 1. Deploy Simples (VPS/Servidor Dedicado)

#### Preparação do Servidor

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar PM2 (gerenciador de processos)
sudo npm install -g pm2

# Criar usuário para a aplicação
sudo useradd -m -s /bin/bash escutadf
sudo su - escutadf
```

#### Clone e Configuração

```bash
# Clone o repositório
git clone https://github.com/Jasmineggril/Escuta-DF.git
cd Escuta-DF

# Instalar dependências
npm ci --production

# Configurar variáveis de ambiente
cp .env.example .env
nano .env
```

#### Configuração do .env para Produção

```bash
# Servidor
PORT=3000
NODE_ENV=production

# CORS (domínio da aplicação)
CORS_ORIGIN=https://escuta.df.gov.br

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# Uploads
UPLOAD_DIR=/var/escutadf/uploads
MAX_FILE_SIZE=52428800

# IA IZA
IZA_API_URL=https://api.iza.gov.br/v1/transcribe
IZA_API_KEY=seu-api-key-aqui

# JWT
JWT_SECRET=gere-um-secret-forte-aqui

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/escutadf
```

#### Build e Inicialização

```bash
# Compilar TypeScript
npm run build

# Criar diretório de uploads
sudo mkdir -p /var/escutadf/uploads
sudo chown escutadf:escutadf /var/escutadf/uploads

# Iniciar com PM2
pm2 start dist/server.js --name escutadf
pm2 save
pm2 startup
```

#### Configurar Nginx como Reverse Proxy

```nginx
# /etc/nginx/sites-available/escutadf
server {
    listen 80;
    server_name escuta.df.gov.br;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name escuta.df.gov.br;

    # SSL
    ssl_certificate /etc/letsencrypt/live/escuta.df.gov.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/escuta.df.gov.br/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Tamanho máximo de upload
    client_max_body_size 50M;

    # Headers de segurança
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy para a aplicação
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Cache para arquivos estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Service Worker (não cachear)
    location /service-worker.js {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # Logs
    access_log /var/log/nginx/escutadf_access.log;
    error_log /var/log/nginx/escutadf_error.log;
}
```

```bash
# Ativar site
sudo ln -s /etc/nginx/sites-available/escutadf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### SSL com Let's Encrypt

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obter certificado
sudo certbot --nginx -d escuta.df.gov.br

# Renovação automática já está configurada
```

---

### 2. Deploy com Docker

#### Dockerfile

```dockerfile
# Criar arquivo Dockerfile na raiz do projeto
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

# Criar diretório de uploads
RUN mkdir -p /app/uploads

EXPOSE 3000

CMD ["node", "dist/server.js"]
```

#### docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/escutadf
    volumes:
      - ./uploads:/app/uploads
      - ./.env:/app/.env
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=escutadf
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=change-me
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
```

#### Deploy

```bash
# Build e iniciar
docker-compose up -d

# Ver logs
docker-compose logs -f

# Atualizar
git pull
docker-compose build
docker-compose up -d
```

---

### 3. Deploy na Nuvem

#### Heroku

```bash
# Instalar Heroku CLI
curl https://cli-assets.heroku.com/install.sh | sh

# Login
heroku login

# Criar app
heroku create escutadf

# Adicionar PostgreSQL
heroku addons:create heroku-postgresql:mini

# Configurar variáveis de ambiente
heroku config:set NODE_ENV=production
heroku config:set IZA_API_KEY=sua-chave
heroku config:set JWT_SECRET=seu-secret

# Deploy
git push heroku main

# Abrir app
heroku open
```

#### AWS (EC2 + RDS + S3)

1. **EC2**: Seguir passos do "Deploy Simples"
2. **RDS**: Criar instância PostgreSQL
3. **S3**: Bucket para uploads
4. **CloudFront**: CDN para assets
5. **Route 53**: DNS
6. **Certificate Manager**: SSL

#### Google Cloud Platform (Cloud Run)

```bash
# Instalar gcloud CLI
curl https://sdk.cloud.google.com | bash

# Login
gcloud auth login

# Deploy
gcloud run deploy escutadf \
  --source . \
  --platform managed \
  --region southamerica-east1 \
  --allow-unauthenticated
```

#### Azure (App Service)

```bash
# Instalar Azure CLI
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Login
az login

# Criar resource group
az group create --name escutadf-rg --location brazilsouth

# Criar App Service plan
az appservice plan create \
  --name escutadf-plan \
  --resource-group escutadf-rg \
  --sku B1 \
  --is-linux

# Criar Web App
az webapp create \
  --resource-group escutadf-rg \
  --plan escutadf-plan \
  --name escutadf \
  --runtime "NODE:20-lts"

# Deploy
az webapp up --name escutadf
```

---

## Monitoramento

### PM2 Monitoring

```bash
# Ver status
pm2 status

# Ver logs
pm2 logs escutadf

# Monitoramento em tempo real
pm2 monit

# Dashboard web (opcional)
pm2 web
```

### Logs

```bash
# Logs da aplicação
tail -f /var/log/escutadf/app.log

# Logs do Nginx
tail -f /var/log/nginx/escutadf_access.log
tail -f /var/log/nginx/escutadf_error.log
```

### Health Checks

```bash
# Script de health check
curl -f http://localhost:3000/health || exit 1

# Adicionar ao cron para alertas
*/5 * * * * /usr/local/bin/check-escutadf.sh
```

---

## Backup

### Backup Automático

```bash
#!/bin/bash
# /usr/local/bin/backup-escutadf.sh

# Variáveis
BACKUP_DIR="/var/backups/escutadf"
DATE=$(date +%Y%m%d_%H%M%S)

# Criar diretório
mkdir -p $BACKUP_DIR

# Backup do banco de dados
pg_dump escutadf | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Backup dos uploads
tar czf $BACKUP_DIR/uploads_$DATE.tar.gz /var/escutadf/uploads

# Remover backups antigos (manter 30 dias)
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete

echo "Backup concluído: $DATE"
```

```bash
# Adicionar ao cron (diário às 2h)
0 2 * * * /usr/local/bin/backup-escutadf.sh
```

---

## Segurança em Produção

### Checklist de Segurança

- [ ] HTTPS configurado
- [ ] Firewall configurado (apenas 80, 443 e 22)
- [ ] Rate limiting ativo
- [ ] JWT secret forte
- [ ] Variáveis de ambiente protegidas
- [ ] Banco de dados com senha forte
- [ ] Backups automáticos
- [ ] Logs de auditoria
- [ ] Updates automáticos de segurança
- [ ] WAF configurado (CloudFlare, AWS WAF, etc.)

### Firewall (UFW)

```bash
# Configurar firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

## Otimização de Performance

### Caching com Redis (Futuro)

```bash
# Instalar Redis
sudo apt install redis-server

# Configurar no .env
REDIS_URL=redis://localhost:6379
```

### CDN para Assets

- CloudFlare
- AWS CloudFront
- Google Cloud CDN
- Azure CDN

### Compressão

- Gzip/Brotli já habilitado no Nginx
- Compressão de imagens antes do upload
- Minificação de assets

---

## Troubleshooting

### App não inicia

```bash
# Verificar logs
pm2 logs escutadf

# Verificar porta
sudo netstat -tlnp | grep 3000

# Reiniciar
pm2 restart escutadf
```

### Erros de Upload

```bash
# Verificar permissões
ls -la /var/escutadf/uploads
sudo chown -R escutadf:escutadf /var/escutadf/uploads
```

### Alto uso de memória

```bash
# Aumentar limite do PM2
pm2 restart escutadf --max-memory-restart 500M
```

---

## Checklist de Deploy

- [ ] Código testado localmente
- [ ] Variáveis de ambiente configuradas
- [ ] SSL/HTTPS configurado
- [ ] Banco de dados configurado
- [ ] Backups configurados
- [ ] Monitoramento configurado
- [ ] Firewall configurado
- [ ] DNS configurado
- [ ] Testes de carga realizados
- [ ] Documentação atualizada

---

## Suporte

Para problemas relacionados ao deploy, abra uma issue no GitHub com:
- Sistema operacional
- Versão do Node.js
- Logs de erro
- Passos para reproduzir

---

**Escuta DF** - Deploy com confiança 🚀
