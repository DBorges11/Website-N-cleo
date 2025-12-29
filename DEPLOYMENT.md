# 🚀 Deployment Guide - CI/CD com GitHub Actions e Watchtower

Este guia explica como configurar o deployment automático para o servidor usando GitHub Actions + Docker Hub + Watchtower.

## 📋 Visão Geral

**Fluxo de Deploy Automático:**
1. Fazes `git push` para a branch `main`
2. GitHub Actions constrói a imagem Docker
3. GitHub Actions faz push da imagem para o Docker Hub
4. Watchtower (no servidor) detecta a nova imagem
5. Watchtower faz pull e reinicia automaticamente a aplicação
6. **Total: ~2-3 minutos do commit ao deploy!**

---

## 🔧 Setup Inicial (só precisas fazer uma vez)

### 1️⃣ Configurar Docker Hub

1. **Criar conta no Docker Hub** (se ainda não tens):
   - Vai a https://hub.docker.com/
   - Cria uma conta gratuita

2. **Criar Access Token**:
   - Login no Docker Hub
   - Vai a **Account Settings** → **Security** → **New Access Token**
   - Nome: `github-actions-nucleo-ei`
   - Permissions: **Read, Write, Delete**
   - Copia o token (só aparece uma vez!)

### 2️⃣ Configurar GitHub Secrets

1. Vai ao teu repositório no GitHub
2. **Settings** → **Secrets and variables** → **Actions**
3. Clica em **New repository secret** e adiciona:

   **Secret 1:**
   - Name: `DOCKERHUB_USERNAME`
   - Value: `teu_username_do_dockerhub`

   **Secret 2:**
   - Name: `DOCKERHUB_TOKEN`
   - Value: `cola_aqui_o_token_que_copiaste`

### 3️⃣ Configurar o Servidor

#### A. Instalar Docker no Servidor (se ainda não tens)

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

Re-login para aplicar as permissões.

#### B. Criar Estrutura de Pastas

```bash
# Criar diretório para a aplicação
mkdir -p ~/nucleo-ei-ufp
cd ~/nucleo-ei-ufp
```

#### C. Criar Ficheiro .env

```bash
# Copiar o template e editar
cat > .env << 'EOF'
# Database Configuration
POSTGRES_USER=nucleo_user
POSTGRES_PASSWORD=MUDA_ESTA_PASSWORD_FORTE
POSTGRES_DB=nucleo_db

# Docker Hub Configuration
DOCKERHUB_USERNAME=teu_username_dockerhub

# Watchtower Notifications (opcional)
WATCHTOWER_NOTIFICATION_URL=
EOF
```

**⚠️ IMPORTANTE:** Edita o `.env` e muda a password!

```bash
nano .env
```

#### D. Copiar docker-compose.prod.yml para o Servidor

Opção 1 - Via Git (recomendado):
```bash
git clone https://github.com/teu-username/Website-N-cleo.git
cd Website-N-cleo
cp docker-compose.prod.yml ~/nucleo-ei-ufp/docker-compose.yml
cp .env.production.example ~/nucleo-ei-ufp/.env
```

Opção 2 - Via SCP:
```bash
# No teu computador local
scp docker-compose.prod.yml user@servidor:~/nucleo-ei-ufp/docker-compose.yml
```

#### E. Iniciar os Serviços

```bash
cd ~/nucleo-ei-ufp
docker compose up -d
```

Verifica os logs:
```bash
docker compose logs -f
```

---

## 🎯 Como Usar (Workflow Diário)

### Deploy Automático

1. **Fazer alterações ao código**:
   ```bash
   git add .
   git commit -m "feat: nova funcionalidade"
   git push origin main
   ```

2. **Acompanhar o build**:
   - Vai ao GitHub → Actions tab
   - Vê o progresso do build em tempo real

3. **Aguardar deploy automático**:
   - Watchtower verifica a cada 30 segundos
   - Quando detecta nova imagem, faz deploy automático
   - Total: ~2-3 minutos

### Verificar Status no Servidor

```bash
# Ver containers a correr
docker compose ps

# Ver logs da aplicação
docker compose logs -f app

# Ver logs do Watchtower
docker compose logs -f watchtower

# Ver logs da base de dados
docker compose logs -f postgres
```

---

## 🔍 Monitorização

### Ver Logs do Watchtower

```bash
docker compose logs -f watchtower
```

Vais ver mensagens como:
```
watchtower  | Found new image for nucleo-app
watchtower  | Stopping nucleo-app
watchtower  | Removing nucleo-app
watchtower  | Creating nucleo-app
watchtower  | nucleo-app restarted
```

### Verificar Saúde da Aplicação

```bash
# Health check manual
curl http://localhost:3000

# Ver health check automático
docker inspect nucleo-app | grep -A 10 Health
```

---

## 🛠️ Comandos Úteis

### Restart Manual (se necessário)

```bash
cd ~/nucleo-ei-ufp
docker compose restart app
```

### Forçar Pull de Nova Imagem

```bash
docker compose pull app
docker compose up -d app
```

### Ver Versão Atual

```bash
docker inspect nucleo-app | grep 'Created'
docker image ls | grep nucleo-ei-ufp
```

### Limpar Imagens Antigas

```bash
# Watchtower já faz isto automaticamente, mas se quiseres manual:
docker image prune -a --filter "until=24h"
```

### Backup da Base de Dados

```bash
# Criar backup
docker exec nucleo-postgres pg_dump -U nucleo_user nucleo_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar backup
docker exec -i nucleo-postgres psql -U nucleo_user nucleo_db < backup_20250129_160000.sql
```

---

## 🔔 Notificações do Watchtower (Opcional)

### Configurar Notificações Discord

1. Cria um Webhook no Discord:
   - Server Settings → Integrations → Webhooks → New Webhook

2. Edita `.env`:
   ```bash
   WATCHTOWER_NOTIFICATION_URL=discord://token@webhookid
   ```

3. Reinicia Watchtower:
   ```bash
   docker compose up -d watchtower
   ```

### Outras Notificações Suportadas

- **Slack**: `slack://token@channel`
- **Email**: `smtp://username:password@host:port/?from=sender&to=receiver`
- **Telegram**: `telegram://token@telegram`
- Vê mais em: https://containrrr.dev/shoutrrr/

---

## 🐛 Troubleshooting

### Problema: GitHub Action falha no build

**Solução:**
1. Verifica se os secrets estão corretos: Settings → Secrets
2. Verifica os logs no GitHub Actions
3. Testa o build localmente:
   ```bash
   docker build -t test-image .
   ```

### Problema: Watchtower não deteta novas imagens

**Solução:**
1. Verifica se a imagem tem a label correta:
   ```bash
   docker inspect nucleo-app | grep watchtower
   ```

2. Verifica os logs do Watchtower:
   ```bash
   docker compose logs watchtower
   ```

3. Força uma verificação manual:
   ```bash
   docker exec nucleo-watchtower /watchtower --run-once
   ```

### Problema: Aplicação não inicia após deploy

**Solução:**
1. Vê os logs:
   ```bash
   docker compose logs -f app
   ```

2. Verifica a base de dados:
   ```bash
   docker compose logs postgres
   docker exec nucleo-postgres psql -U nucleo_user -d nucleo_db -c "\l"
   ```

3. Verifica as variáveis de ambiente:
   ```bash
   docker exec nucleo-app env | grep DATABASE
   ```

---

## 📊 Configurações Avançadas

### Alterar Intervalo do Watchtower

Edita `docker-compose.prod.yml`:
```yaml
environment:
  - WATCHTOWER_POLL_INTERVAL=60  # 60 segundos (padrão: 30)
```

### Deploy apenas em horários específicos

Edita `docker-compose.prod.yml`:
```yaml
environment:
  - WATCHTOWER_SCHEDULE=0 0 2 * * *  # Apenas às 2h da manhã
```

### Rollback para Versão Anterior

```bash
# Listar tags disponíveis no Docker Hub
docker image ls

# Deploy de versão específica
docker pull teu_username/nucleo-ei-ufp:master-abc123
docker tag teu_username/nucleo-ei-ufp:master-abc123 teu_username/nucleo-ei-ufp:latest
docker compose up -d app
```

---

## 🔒 Segurança

### Recomendações

1. **Nunca commites secrets no Git**
   - Usa sempre variáveis de ambiente
   - `.env` deve estar no `.gitignore`

2. **Usa passwords fortes**
   - Gera passwords seguras: `openssl rand -base64 32`

3. **Limita acessos**
   - Usa firewall para expor apenas portas necessárias
   - Considera usar nginx como reverse proxy

4. **Backups regulares**
   - Configura backups automáticos da base de dados
   - Usa cron jobs no servidor

---

## 📝 Checklist de Deploy

- [ ] Docker Hub account criada
- [ ] Access token gerado
- [ ] GitHub Secrets configurados
- [ ] Docker instalado no servidor
- [ ] `.env` criado e configurado no servidor
- [ ] `docker-compose.yml` copiado para o servidor
- [ ] Serviços iniciados: `docker compose up -d`
- [ ] Aplicação acessível: `curl http://localhost:3000`
- [ ] Primeiro commit testado e deployado com sucesso
- [ ] Watchtower a monitorizar correctamente

---

## 🎉 Pronto!

Agora sempre que fizeres `git push origin main`, o deploy acontece automaticamente!

**Questões?** Verifica os logs ou consulta a documentação do Watchtower: https://containrrr.dev/watchtower/
