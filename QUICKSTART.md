# ⚡ Quick Start - Deploy Automático

## 🎯 Setup em 5 Minutos

### 1. Docker Hub (1 min)
```bash
# Criar conta em: https://hub.docker.com/
# Username: cpsoares (já configurado!)
# Criar Access Token: Account Settings → Security → New Access Token
```

### 2. GitHub Secrets (1 min)
```bash
# No GitHub: Settings → Secrets → Actions → New secret

Secret 1:
  Name: DOCKERHUB_USERNAME
  Value: cpsoares

Secret 2:
  Name: DOCKERHUB_TOKEN
  Value: <cola_o_token_do_docker_hub>
```

### 3. No Servidor (3 min)
```bash
# SSH para o teu servidor
ssh user@teu-servidor.com

# Copiar ficheiros (escolhe uma opção):

# Opção A - Via Git (recomendado):
git clone https://github.com/teu-username/Website-N-cleo.git
cd Website-N-cleo
./server-setup.sh

# Opção B - Via SCP do teu PC local:
scp docker-compose.prod.yml user@servidor:~/docker-compose.yml
scp .env.production.example user@servidor:~/.env
# Depois no servidor:
cd ~
nano .env  # Edita as passwords
docker compose up -d
```

---

## 🚀 Usar Diariamente

```bash
# No teu PC, após fazer alterações:
git add .
git commit -m "feat: nova funcionalidade"
git push origin main

# Aguarda 2-3 minutos
# ✅ Deploy automático completo!
```

---

## 📊 Monitorizar

```bash
# No servidor
docker compose logs -f              # Todos os logs
docker compose logs -f app          # Só a aplicação
docker compose logs -f watchtower   # Só o watchtower
docker compose ps                   # Status dos containers
```

---

## 🔧 Comandos Úteis

```bash
# Restart manual
docker compose restart app

# Forçar update
docker compose pull && docker compose up -d

# Backup da BD
docker exec nucleo-postgres pg_dump -U nucleo_user nucleo_db > backup.sql

# Ver versão atual
docker image ls | grep nucleo-ei-ufp
```

---

## 📝 Ficheiros Criados

- ✅ `.github/workflows/docker-publish.yml` - GitHub Actions workflow
- ✅ `docker-compose.prod.yml` - Configuração para produção
- ✅ `.env.production.example` - Template de variáveis
- ✅ `DEPLOYMENT.md` - Documentação completa
- ✅ `server-setup.sh` - Script de setup automático
- ✅ `QUICKSTART.md` - Este ficheiro

---

## 🎯 Next Steps

1. [ ] Criar Access Token no Docker Hub
2. [ ] Adicionar secrets no GitHub
3. [ ] Fazer primeiro commit/push para testar
4. [ ] Configurar servidor com `server-setup.sh`
5. [ ] Verificar deploy automático funciona

**Documentação completa:** Ver `DEPLOYMENT.md`
