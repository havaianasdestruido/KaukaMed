import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { validateEnvironment } from './config/env.validation.js';

const nodeEnv = process.env.NODE_ENV ?? 'development';

/**
 * Módulo raiz da API. Os módulos de domínio (Auth, Users, Doctors,
 * Appointments, Records e HealthPlans) serão registrados aqui nas próximas fases.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      // Arquivos carregados em ordem de prioridade (o primeiro valor encontrado vence):
      // .env.<ambiente>.local -> .env.local -> .env.<ambiente> -> .env
      envFilePath: [`.env.${nodeEnv}.local`, '.env.local', `.env.${nodeEnv}`, '.env'],
      validate: validateEnvironment,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
