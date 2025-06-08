import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config/dist/config.service';
import {
  MongooseModuleOptions,
  MongooseOptionsFactory,
} from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { LogLevel } from 'src/common/logger/logger';

@Injectable()
export class MongodbConfigService implements MongooseOptionsFactory {
  private readonly logger: Logger;

  constructor(private readonly configService: ConfigService) {
    this.logger = new Logger(this.constructor.name);
  }

  public createMongooseOptions(): MongooseModuleOptions {
    const mongoDB = this.getMongoDB();
    return {
      uri: mongoDB,
      user: this.configService.get(`MONGO_USER`),
      pass: this.configService.get(`MONGO_PASS`),
      autoIndex: false,
      connectionFactory: (connection: Connection) => {
        this.logger.log({
          level: LogLevel.INFO,
          message: `MongoDB connected: ${mongoDB}`,
        });

        connection.on('disconnected', () => {
          this.logger.warn(`MongoDB disconnected: ${mongoDB}`);
        });

        connection.on('reconnected', () => {
          this.logger.log(`MongoDB reconnected: ${mongoDB}`);
        });

        connection.on('error', (error) => {
          this.logger.error(
            `MongoDB connection error: ${error}, uri: ${mongoDB}`,
          );
        });

        connection.on('close', () => {
          this.logger.log('MongoDB connection closed');
        });

        return connection;
      },
    };
  }

  private getMongoDB() {
    return (
      'mongodb://' +
      this.configService.get(`MONGO_URI`) +
      '/' +
      this.configService.get(`MONGO_DATABASE`)
    );
  }
}

// @Injectable()
// export class MongodbConfigService implements MongooseOptionsFactory {
//   constructor(
//     private readonly config: NestConfigService,
//     private readonly logger: Logger = new Logger(MongodbConfigService.name),
//     private readonly prefix: string = 'MONGO_MAIN', // 기본값
//   ) {}

//   createMongooseOptions(): MongooseModuleOptions {
//     const mongoDB = this.getMongoDB();

//     return {
//       uri: mongoDB,
//       user: this.config.get(`${this.prefix}_USERNAME`),
//       pass: this.config.get(`${this.prefix}_PASSWORD`),
//       autoIndex: false,
//       connectionFactory: (connection: Connection) => {
//         connection.plugin(mongoosePaginate);
//         this.setupListeners(connection, mongoDB);
//         return connection;
//       },
//     };
//   }

//   private getMongoDB(): string {
//     const uri = this.config.get<string>(`${this.prefix}_URI`);
//     const db = this.config.get<string>(`${this.prefix}_DB`);
//     return `mongodb://${uri}/${db}`;
//   }

//   private setupListeners(connection: Connection, uri: string) {
//     this.logger.log(`MongoDB connected: ${uri}`);
//     connection.on('disconnected', () => {
//       this.logger.warn(`MongoDB disconnected: ${uri}`);
//     });
//     connection.on('reconnected', () => {
//       this.logger.log(`MongoDB reconnected: ${uri}`);
//     });
//     connection.on('error', (error) => {
//       this.logger.error(`MongoDB error: ${error}, uri: ${uri}`);
//     });
//     connection.on('close', () => {
//       this.logger.log(`MongoDB closed: ${uri}`);
//     });
//   }
// }
