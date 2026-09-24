import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module.js';
import type { Environment } from './config/env.validation.js';

/**
 * Ponto de entrada da API do KaukaMed.
 * Sobe o servidor HTTP do NestJS com o prefixo global de rotas `/api/v1`.
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');
  app.enableShutdownHooks();

  // As variáveis já foram validadas pelo ConfigModule (src/config/env.validation.ts),
  // portanto os valores abaixo existem e estão no tipo correto.
  const config = app.get<ConfigService<Environment, true>>(ConfigService);
  const port = config.get('PORT', { infer: true });
  const host = config.get('HOST', { infer: true });
  const environment = config.get('NODE_ENV', { infer: true });

  await app.listen(port, host);

  Logger.log(
    `API KaukaMed (${environment}) disponível em http://${host}:${port}/api/v1`,
    'Bootstrap',
  );
}

void bootstrap();
