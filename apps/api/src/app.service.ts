import { Injectable } from '@nestjs/common';

/** Informações básicas expostas pela rota raiz da API. */
export interface ApiInfo {
  name: string;
  version: string;
  environment: string;
  timestamp: string;
}

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
