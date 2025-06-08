import { HttpModule } from '@nestjs/axios';
import { DynamicModule, Module, Provider, Type } from '@nestjs/common';
import { TEAMS_MODULE_OPTIONS } from './teams.constants';
import {
  TeamsModuleAsyncOptions,
  TeamsModuleOptions,
  TeamsOptionsFactory,
} from './teams.interface';
import { TeamsService } from './teams.service';

@Module({})
export class TeamsModule {
  static register(options: TeamsModuleOptions): DynamicModule {
    return {
      module: TeamsModule,
      imports: [HttpModule],
      providers: [
        {
          provide: TEAMS_MODULE_OPTIONS,
          useValue: options,
        },
        TeamsService,
      ],
      exports: [TeamsService],
    };
  }

  static registerAsync(options: TeamsModuleAsyncOptions): DynamicModule {
    return {
      module: TeamsModule,
      imports: [HttpModule, ...(options.imports || [])],
      providers: [this.createAsyncOptionsProvider(options), TeamsService],
      exports: [TeamsService],
    };
  }

  private static createAsyncOptionsProvider(
    options: TeamsModuleAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: TEAMS_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }

    const inject = [
      (options.useClass || options.useExisting) as Type<TeamsOptionsFactory>,
    ];

    return {
      provide: TEAMS_MODULE_OPTIONS,
      useFactory: async (optionsFactory: TeamsOptionsFactory) =>
        await optionsFactory.createTeamsOptions(),
      inject,
    };
  }
}
