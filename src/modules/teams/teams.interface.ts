import { ModuleMetadata, Type } from '@nestjs/common';

export interface TeamsModuleOptions {
  webhookUrl?: string;
}

export interface TeamsOptionsFactory {
  createTeamsOptions(): Promise<TeamsModuleOptions> | TeamsModuleOptions;
}

export interface TeamsModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  useFactory?: (
    ...args: any[]
  ) => Promise<TeamsModuleOptions> | TeamsModuleOptions;
  inject?: any[];
  useClass?: Type<TeamsOptionsFactory>;
  useExisting?: Type<TeamsOptionsFactory>;
}

export interface TeamsPayload {
  title: string;
  name: string;
  description: string;
  data?: Record<string, string>;
}
