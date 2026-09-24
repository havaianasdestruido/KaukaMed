import { Injectable } from '@nestjs/common';
import { type ConfigService } from '@nestjs/config';
import type { ApiInfo } from '@kaukamed/shared';

import type { Environment } from './config/env.validation.js';

@Injectable()
export class AppService {
  constructor(private readonly config: ConfigService<Environment, true>) {}

  getApiInfo(): ApiInfo {
    return {
      name: 'KaukaMed API',
      version: process.env.npm_package_version ?? '0.1.0',
      environment: this.config.get('NODE_ENV', { infer: true }),
      timestamp: new Date().toISOString(),
    };
  }
}
