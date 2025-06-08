import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { readFileSync } from 'fs';
import { join } from 'path';
import { ServerConfig } from './configurations/server.config';

@Controller('/')
export class AppController {
  constructor(private readonly configService: ConfigService<ServerConfig>) {}

  @Get('/version.json')
  async getVersionInfo() {
    const path =
      this.configService.get('nodeEnv') === 'prod'
        ? join(__dirname, 'version.json')
        : join(__dirname, '../', 'version.json');

    const version = readFileSync(path, 'utf-8');

    return JSON.parse(version) as {
      branch: string;
      version: string;
      hash: string;
      date: string;
    };
  }
}
