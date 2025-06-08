import { HttpModule } from '@nestjs/axios';
import { DynamicModule, Module, Provider, Type } from '@nestjs/common';
import { SLACK_MODULE_OPTIONS } from './slack.constants';
import {
  SlackModuleAsyncOptions,
  SlackModuleOptions,
  SlackOptionsFactory,
} from './slack.interface';
import { SlackService } from './slack.service';

@Module({})
export class SlackModule {
  static forRoot(options: SlackModuleOptions): DynamicModule {
    return {
      module: SlackModule,
      imports: [HttpModule],
      providers: [
        {
          provide: SLACK_MODULE_OPTIONS,
          useValue: options,
        },
        SlackService,
      ],
      exports: [SlackService],
      global: true,
    };
  }

  static forRootAsync(options: SlackModuleAsyncOptions): DynamicModule {
    return {
      module: SlackModule,
      imports: [HttpModule, ...(options.imports || [])],
      providers: [this.createAsyncOptionsProvider(options), SlackService],
      exports: [SlackService],
      global: true,
    };
  }

  private static createAsyncOptionsProvider(
    options: SlackModuleAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: SLACK_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }

    const inject = [
      (options.useClass || options.useExisting) as Type<SlackOptionsFactory>,
    ];

    return {
      provide: SLACK_MODULE_OPTIONS,
      useFactory: async (optionsFactory: SlackOptionsFactory) =>
        await optionsFactory.createSlackOptions(),
      inject,
    };
  }
}
