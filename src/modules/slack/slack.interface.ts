import { ModuleMetadata, Type } from '@nestjs/common';

export interface SlackModuleOptions {
  webhookUrl?: string;
}

export interface SlackOptionsFactory {
  createSlackOptions(): Promise<SlackModuleOptions> | SlackModuleOptions;
}

export interface SlackModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  useFactory?: (
    ...args: any[]
  ) => Promise<SlackModuleOptions> | SlackModuleOptions;
  inject?: any[];
  useClass?: Type<SlackOptionsFactory>;
  useExisting?: Type<SlackOptionsFactory>;
}

export interface SchedulerResultTemplateOptions {
  username?: string;
  iconUrl?: string;
  headerTitle: string;
  taskDescription: string;
  target: string;
  data?: Record<string, any>;
}

export type SlackTemplateOptions = {
  type: 'schedulerResult';
  options: SchedulerResultTemplateOptions;
};
