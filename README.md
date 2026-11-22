# Loja API — Docker, Compose e Kubernetes (N3)

API de produtos Node.js com MySQL e Redis.

## Requisitos
Docker Desktop (Compose), Kubernetes habilitado, `kubectl` e Metrics Server para HPA.

## Compose
Copie `.env.example` para `.env`, altere a senha e rode `docker compose up -d --build`. API em http://localhost:3000/; rotas `/health`, `/ready` e `/produtos`. Teste persistência cadastrando produto, recriando containers e consultando.

## Kubernetes
```bash
docker build -t loja-api:1.0 ./app
kubectl apply -f k8s/
kubectl get all -n n3-rafael
```
API via NodePort: http://localhost:30080/.

Parte 4: roteiro em `comandos.md`; execute e registre evidências reais.

Notas: MySQL usa uma réplica e PVC; `Recreate` evita sobreposição de Pods tentando montar o mesmo volume durante atualização. Redis não tem volume configurado. Secret tem senha de exemplo; substitua e não versione `.env`. HPA requer Metrics Server e carga de CPU adequada.
