import { INestApplication, Module } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { getPackageJson } from '../utils/package';
import { ApiDocsModuleOptions } from './api-docs.interface';

@Module({})
export class ApiDocsModule {
  static register(
    app: INestApplication,
    options: ApiDocsModuleOptions = {},
  ): void {
    const packageJson = getPackageJson();

    const config = new DocumentBuilder()
      .setTitle(options.title || packageJson.name)
      .setDescription(
        options.description || 'REST API Documentation for task scheduler',
      )
      .setVersion(options.version || packageJson.version)
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    const path = options.path || 'api-docs';

    SwaggerModule.setup(path, app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
      },
      customSiteTitle: options.title || packageJson.name,
    });
  }
}
