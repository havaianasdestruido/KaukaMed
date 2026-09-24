#!/usr/bin/env node
/**
 * Executa o ESLint de um pacote do monorepo com `--fix`.
 *
 * Por que este script existe: o ESLint resolve as regras a partir do diretório
 * de execução (cwd). Se o hook de pré-commit rodasse o ESLint da raiz, as
 * configurações específicas de cada app seriam ignoradas — por exemplo, a API
 * teria imports reescritos para `import type`, o que quebra a injeção de
 * dependência do NestJS. Rodando com o cwd do pacote, o `eslint.config.mjs`
 * daquele pacote é aplicado.
 *
 * Uso: node scripts/eslint-no-pacote.mjs <pacote> <arquivos...>
 * (os arquivos podem vir em caminho absoluto ou relativo à raiz do monorepo)
 */
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';

const [pacote, ...arquivos] = process.argv.slice(2);

if (!pacote || arquivos.length === 0) {
  console.error('Uso: node scripts/eslint-no-pacote.mjs <pacote> <arquivos...>');
  process.exit(1);
}

const raiz = process.cwd();
const diretorioDoPacote = path.resolve(raiz, pacote);
const eslintBin = path.join(raiz, 'node_modules', 'eslint', 'bin', 'eslint.js');

if (!existsSync(eslintBin)) {
  console.error('ESLint não encontrado em node_modules. Rode `npm install` antes do commit.');
  process.exit(1);
}

const arquivosRelativos = arquivos.map((arquivo) =>
  path.relative(diretorioDoPacote, path.resolve(raiz, arquivo)),
);

const { status } = spawnSync(process.execPath, [eslintBin, '--fix', ...arquivosRelativos], {
  cwd: diretorioDoPacote,
  stdio: 'inherit',
});

process.exit(status ?? 1);
