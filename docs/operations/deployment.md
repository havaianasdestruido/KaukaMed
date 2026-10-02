# Build e implantação

```bash
npm ci
npm run build
npm run docs:build
```

O build Docusaurus é gerado em `apps/docs/build` e é inteiramente estático. Configure `DOCS_URL` e `DOCS_BASE_URL` conforme o host; no GitHub Pages deste repositório, a base padrão é `/KaukaMed/`.

A web, API e documentação têm ciclos distintos: a web é um aplicativo Next.js, a API requer runtime Node e serviços de dados, e a documentação pode ser servida por CDN. Injete configurações pelo ambiente de deploy e nunca copie `.env` local para artefatos.
