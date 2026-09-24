import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module.js';

/**
 * Ponto de entrada da API do KaukaMed.
 * Sobe o servidor HTTP do NestJS com o prefixo global de rotas `/api/v1`.
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');
  app.enableShutdownHooks();

  const port = Number(process.env.PORT ?? 3333);
  const host = process.env.HOST ?? '0.0.0.0';

  await app.listen(port, host);

  Logger.log(`API KaukaMed disponível em http://${host}:${port}/api/v1`, 'Bootstrap');
}

void bootstrap();
