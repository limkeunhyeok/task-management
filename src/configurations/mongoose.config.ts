import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config/dist/config.service';
import {
  MongooseModuleOptions,
  MongooseOptionsFactory,
} from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { LogLevel } from 'src/common/logger/logger'; // LogLevel 경로를 실제 프로젝트에 맞게 확인하세요.
import { ServerConfig } from './server.config';

export const SAMPLE_AIRBNB = 'sample_airbnb';
export const SAMPLE_ANALYTICS = 'sample_analytics';
export const SAMPLE_GEOSPATIAL = 'sample_geospatial';
export const SAMPLE_MFLIX = 'sample_mflix';
export const SAMPLE_SUPPLIES = 'sample_supplies';
export const SAMPLE_TRAINING = 'sample_training';
export const SAMPLE_WEATHERDATA = 'sample_weatherdata';

@Injectable()
export class MongodbConfigService implements MongooseOptionsFactory {
  private readonly logger: Logger;
  private readonly dbName: string;

  constructor(
    private readonly configService: ConfigService<ServerConfig>,
    dbName: string,
  ) {
    this.logger = new Logger(this.constructor.name);
    this.dbName = dbName;
  }

  public createMongooseOptions(): MongooseModuleOptions {
    const mongoDBUri = this.getMongoDBUri(this.dbName);

    return {
      uri: mongoDBUri,
      user: this.configService.get<string>('mongoUser'),
      pass: this.configService.get<string>('mongoPass'),
      autoIndex: false,
      authSource: 'admin',
      connectionFactory: (connection: Connection) => {
        this.logger.log({
          level: LogLevel.INFO,
          message: `MongoDB connected: ${mongoDBUri}`,
        });

        connection.on('disconnected', () => {
          this.logger.warn(`MongoDB disconnected: ${mongoDBUri}`);
        });

        connection.on('reconnected', () => {
          this.logger.log(`MongoDB reconnected: ${mongoDBUri}`);
        });

        connection.on('error', (error) => {
          this.logger.error(
            `MongoDB connection error: ${error.message}, uri: ${mongoDBUri}`,
          );
        });

        connection.on('close', () => {
          this.logger.log(`MongoDB connection closed: ${mongoDBUri}`);
        });

        return connection;
      },
    };
  }

  private getMongoDBUri(dbName: string): string {
    const mongoUri = this.configService.get<string>('mongoUri');
    return `mongodb://${mongoUri}/${dbName}`;
  }
}
