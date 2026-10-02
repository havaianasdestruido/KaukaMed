# Frontend

`apps/web` usa Next.js App Router. `src/app/layout.tsx` define o documento, `page.tsx` é a rota `/` e os estilos atuais usam CSS Modules. O alias `@/*` aponta para `src/*`.

`src/config/env.ts` é o único ponto de leitura das variáveis públicas. A página atual demonstra o consumo direto de enums, labels e descrições de `@kaukamed/shared`.

## Ao adicionar uma funcionalidade

- prefira Server Components, usando `'use client'` apenas quando houver estado/eventos;
- mantenha chamadas HTTP em uma camada de serviços;
- valide entrada na fronteira e modele respostas com tipos de `shared`;
- forneça loading, erro, estado vazio e acessibilidade por teclado;
- nunca importe código server-only nem segredos em componentes do cliente.
