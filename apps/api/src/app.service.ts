import { Injectable } from '@nestjs/common';
import type { ApiInfo } from '@kaukamed/shared';

@Injectable()
export class AppService {
  getApiInfo(): ApiInfo {
    return {
      name: 'KaukaMed API',
      version: process.env.npm_package_version ?? '0.1.0',
      environment: process.env.NODE_ENV ?? 'development',
      timestamp: new Date().toISOString(),
    };
  }
}
