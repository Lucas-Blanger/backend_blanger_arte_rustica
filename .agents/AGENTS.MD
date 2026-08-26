# Contexto do Projeto

A Blanger Arte Rústica é uma plataforma de e-commerce.
Este repositório contém a API REST (Backend) da aplicação, desenvolvida com Node.js, Express, PostgreSQL (Neon Serverless) e Docker.

Antes de iniciar qualquer tarefa, leia os arquivos relacionados ao módulo que será alterado na pasta `src/modules/`.

# Regras de Trabalho e Arquitetura

- Trabalhar em etapas pequenas e verificáveis.
- Implementar SOMENTE o que foi solicitado. Não adicionar funcionalidades extras.
- Maximizar a reutilização de código existente. Não reescrever soluções funcionais.
- Não alterar módulos ou arquivos que não estejam diretamente relacionados à tarefa.
- Seguir rigorosamente o Design Modular:
  - `*.routes.js`: Apenas mapeamento de rotas HTTP. Sem regra de negócio.
  - `*.controller.js`: Apenas extração de dados (`req`, `res`) e chamadas ao Service.
  - `*.service.js`: Todas as regras de negócio e banco de dados. Nunca deve importar o Express.
- O Express deve ser configurado apenas em `src/app.js` e inicializado em `src/server.js`.
- Utilizar JavaScript moderno (ES6+): `async/await`, desestruturação. NUNCA usar `.then()/.catch()`.
- Não expor dados sensíveis do banco (ex: senhas) diretamente pela API. Limpar os _payloads_ de saída.
- Escrever mensagens de erro e documentação em português.

# Fluxo Antes de Alterar Código

1. Ler o código relacionado à tarefa.
2. Identificar os padrões existentes.
3. Apresentar um plano curto da implementação.
4. Aguardar autorização do usuário.
5. Implementar somente a etapa solicitada.
6. Revisar o diff e informar os arquivos alterados.

# Testes e Qualidade

- Toda nova regra de negócio deve possuir teste automatizado quando aplicável.
- Dar preferência a testes simples e focados (Testes Unitários nos Services).
- Não remover ou enfraquecer testes existentes para fazer a implementação passar.
- Antes de concluir uma etapa, se houver suíte de testes configurada, executar: `npm run test`

# Git e Commits

- Não utilizar comandos git

# Limites de Autonomia do Agente

**O Agente PODE:**

- Ler arquivos e analisar a base de código;
- Alterar arquivos relacionados à tarefa atual;
- Criar testes automatizados;
- Executar comandos locais de build e testes (`npm run dev`, `npm test`);
- Apresentar sugestões técnicas.

**O Agente NÃO PODE (sem autorização explícita):**

- Fazer push para o repositório remoto;
- Criar ou enviar commits;
- Apagar migrações de banco de dados;
- Adicionar novas bibliotecas (`npm install`) sem necessidade comprovada;
- Fazer grandes refatorações estruturais;
- Sugerir comandos que quebrem o ambiente Docker.

# Finalização de Cada Tarefa

Ao concluir uma instrução, o agente deve obrigatoriamente informar:

1. O que foi implementado.
2. Quais arquivos foram criados ou alterados.
3. Quais decisões técnicas foram tomadas (se houver).
4. Se existe alguma pendência.

Depois disso, parar imediatamente e aguardar novas instruções do usuário.
