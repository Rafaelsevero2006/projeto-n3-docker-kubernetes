# Sequência sugerida de commits

Faça commits conforme etapas concluídas e testadas; não simule histórico.
1. `chore: estrutura inicial do projeto` — diretórios, README, gitignore
2. `feat: adicionar API Node e Dockerfile` — código, dependências e imagem
3. `feat: configurar serviços Docker Compose` — Compose e `.env.example`
4. `feat: adicionar manifests Kubernetes` — namespace, config/secret, MySQL/PVC, Redis, API
5. `docs: documentar testes da parte 4` — roteiro de execução
6. `docs: adicionar relatório e evidências` — PDF final com capturas verdadeiras

Exemplo: `git add app && git commit -m "feat: adicionar API Node e Dockerfile"`.
