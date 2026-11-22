# Parte 4 — roteiro de execução e evidências

Namespace: `n3-rafael`

> Execute e salve saídas reais. Não copie resultados fictícios. Confirme Docker Desktop com Kubernetes habilitado e `kubectl` no cluster correto.

## 0. Pré-verificação
```bash
docker version
docker compose version
kubectl config current-context
kubectl get nodes
kubectl get pods -A
```

## 1. Compose
```bash
cp .env.example .env
# Edite .env e altere a senha local
docker compose up -d --build
docker compose ps
curl http://localhost:3000/
curl http://localhost:3000/health
curl http://localhost:3000/ready
curl -X POST http://localhost:3000/produtos -H "Content-Type: application/json" -d '{"nome":"Caneta","preco":2.5}'
curl http://localhost:3000/produtos
docker compose down
docker compose up -d
curl http://localhost:3000/produtos
```
Evidência: serviços saudáveis, endpoints respondendo e produto persistindo após recriação. `docker compose down -v` remove volume e dados.

## 2. Kubernetes
```bash
docker build -t loja-api:1.0 ./app
kubectl apply -f k8s/
kubectl get all -n n3-rafael
kubectl get pvc -n n3-rafael
kubectl get pods -n n3-rafael -w
curl http://localhost:30080/
curl http://localhost:30080/health
curl http://localhost:30080/ready
```

## 3. Escalonamento manual
```bash
kubectl scale deployment api --replicas=4 -n n3-rafael
kubectl get deployment api -n n3-rafael
kubectl get pods -n n3-rafael
kubectl scale deployment api --replicas=2 -n n3-rafael
kubectl get deployment api -n n3-rafael
kubectl get pods -n n3-rafael
```
Capture a escala em quatro e depois duas réplicas.

## 4. Rolling update
Antes, altere `VERSAO` em `app/server.js` de `1.0` para `2.0`.
```bash
docker build -t loja-api:2.0 ./app
kubectl set image deployment/api api=loja-api:2.0 -n n3-rafael
kubectl rollout status deployment/api -n n3-rafael
kubectl rollout history deployment/api -n n3-rafael
curl http://localhost:30080/
```

## 5. Falha e recuperação
A imagem `loja-api:9.9` não foi construída; a falha esperada é pull da imagem.
```bash
kubectl set image deployment/api api=loja-api:9.9 -n n3-rafael
kubectl get pods -n n3-rafael
kubectl describe pod <pod-com-falha> -n n3-rafael
kubectl get events -n n3-rafael --sort-by=.lastTimestamp
kubectl rollout undo deployment/api -n n3-rafael
kubectl rollout status deployment/api -n n3-rafael
kubectl get pods -n n3-rafael
```
Substitua pelo nome real do Pod. Registre erro de pull e rollback.

## 6. Requests e limits
```bash
kubectl set resources deployment api --requests=cpu=100m,memory=128Mi --limits=cpu=300m,memory=256Mi -n n3-rafael
kubectl describe deployment api -n n3-rafael
kubectl describe pod <pod-api> -n n3-rafael
```

## 7. HPA
Verifique métricas: `kubectl top nodes` e `kubectl top pods -n n3-rafael`. Se Metrics Server estiver ausente, habilite/instale a versão compatível com seu cluster antes de continuar.
```bash
kubectl autoscale deployment api --min=2 --max=6 --cpu-percent=50 -n n3-rafael
kubectl get hpa -n n3-rafael
```
Terminal 1: `kubectl get hpa -n n3-rafael -w`
Terminal 2: `kubectl apply -f extras/carga.yaml`, depois observe `kubectl top pods -n n3-rafael` e `kubectl get hpa -n n3-rafael`.

Parar carga e acompanhar: `kubectl delete -f extras/carga.yaml`, `kubectl get hpa -n n3-rafael -w`, `kubectl get deployment api -n n3-rafael`. Registre antes/durante/depois. Escala depende de métricas e carga suficiente; redução pode levar minutos.

## 8. Node
```bash
kubectl describe node
kubectl get nodes -o wide
```

## 9. Persistência MySQL
```bash
curl -X POST http://localhost:30080/produtos -H "Content-Type: application/json" -d '{"nome":"Caneta Persistente","preco":2.5}'
kubectl get pvc -n n3-rafael
kubectl delete pod -l app=mysql -n n3-rafael
kubectl get pods -n n3-rafael -w
curl http://localhost:30080/produtos
```

## Checklist
- [ ] Compose: serviços e API
- [ ] Kubernetes: Pods Ready, PVC Bound, NodePort
- [ ] Escala manual 4 e 2 réplicas
- [ ] Rolling update 1.0 → 2.0
- [ ] Diagnóstico falha 9.9 e rollback
- [ ] Requests/limits
- [ ] HPA antes/durante/depois da carga
- [ ] Persistência comprovada
