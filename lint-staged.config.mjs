import path from 'node:path';

/**
 * Configuração do lint-staged (executada pelo hook de pré-commit do Husky).
 *
 * Os arquivos são agrupados por pacote e o ESLint roda dentro de cada um deles
 * (via scripts/eslint-no-pacote.mjs), para que as configurações específicas de
 * cada app sejam respeitadas. O Prettier resolve a configuração a partir de cada
 * arquivo, então roda normalmente a partir da raiz.
 *
 * O lint-staged entrega caminhos absolutos: eles são convertidos para relativos
 * à raiz do monorepo antes de serem agrupados.
 */
const RAIZ = process.cwd();
const PACOTES = ['apps/api', 'apps/web', 'packages/shared'];

function eslintPorPacote(arquivos) {
  const porPacote = new Map(PACOTES.map((pacote) => [pacote, []]));
  const naRaiz = [];

  for (const arquivo of arquivos) {
    const relativo = path.relative(RAIZ, path.resolve(RAIZ, arquivo));
    const pacote = PACOTES.find(
      (candidato) => relativo === candidato || relativo.startsWith(`${candidato}${path.sep}`),
    );

    if (pacote) {
      porPacote.get(pacote).push(path.resolve(RAIZ, relativo));
    } else {
      naRaiz.push(relativo);
    }
  }

  const comandos = [...porPacote]
    .filter(([, arquivosDoPacote]) => arquivosDoPacote.length > 0)
    .map(
      ([pacote, arquivosDoPacote]) =>
        `node scripts/eslint-no-pacote.mjs ${pacote} ${arquivosDoPacote.join(' ')}`,
    );

  if (naRaiz.length > 0) {
    comandos.push(`node scripts/eslint-no-pacote.mjs . ${naRaiz.join(' ')}`);
  }

  return comandos;
}

export default {
  '*.{ts,tsx,mts,cts}': [eslintPorPacote, 'prettier --write'],
  '*.{js,mjs,cjs,json,md,css,yml,yaml}': ['prettier --write'],
};
