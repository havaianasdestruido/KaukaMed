import { Module } from '@nestjs/common';

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

/**
 * Módulo raiz da API. Os módulos de domínio (Auth, Users, Doctors,
 * Appointments, Records e HealthPlans) serão registrados aqui nas próximas fases.
 */
@Module({
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
