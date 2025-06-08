import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ServerConfig } from 'src/configurations/server.config';
import { SLACK_MODULE_OPTIONS } from './slack.constants';
import { SlackModuleOptions, SlackTemplateOptions } from './slack.interface';
import { createSchedulerResultMessage } from './templates/scheduler-result.template';

// 공식문서: https://api.slack.com/messaging/sending
// 디자인(슬랙 로그인 필수): https://app.slack.com/block-kit-builder/
@Injectable()
export class SlackService {
  private readonly webhookUrl: string;

  constructor(
    private readonly httpService: HttpService,
    @Inject(SLACK_MODULE_OPTIONS) private readonly options: SlackModuleOptions,
    private readonly configService: ConfigService<ServerConfig>,
  ) {
    this.webhookUrl =
      this.options.webhookUrl ||
      this.configService.getOrThrow<string>('slackWebhookUrl');

    if (!this.webhookUrl) {
      throw new Error('A webhook url is required.');
    }
  }

  async send(templateOrPayload: SlackTemplateOptions) {
    let payload: unknown;

    switch (templateOrPayload.type) {
      case 'schedulerResult':
        payload = createSchedulerResultMessage(templateOrPayload.options);
        break;
      default:
        throw new Error(
          `Unsupported Slack message template type: ${templateOrPayload['type']}`,
        );
    }

    return await this.httpService.axiosRef.post(this.webhookUrl, payload);
  }
}
