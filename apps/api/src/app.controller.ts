import { Controller, Get } from '@nestjs/common';
import type { ApiInfo } from '@kaukamed/shared';

import { AppService } from './app.service.js';

/**
 * Rota raiz da API — usada para smoke tests e para confirmar
 * que a aplicação está no ar após o bootstrap.
 */
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getApiInfo(): ApiInfo {
    return this.appService.getApiInfo();
  }
}
