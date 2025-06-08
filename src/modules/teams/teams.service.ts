import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ServerConfig } from 'src/configurations/server.config';
import { TEAMS_MODULE_OPTIONS } from './teams.constants';
import { TeamsModuleOptions, TeamsPayload } from './teams.interface';

// 공식문서: https://learn.microsoft.com/en-us/adaptive-cards/getting-started/bots
// 디자인: https://adaptivecards.io/designer
@Injectable()
export class TeamsService {
  private readonly webhookUrl: string;

  constructor(
    private readonly httpService: HttpService,
    @Inject(TEAMS_MODULE_OPTIONS) private readonly options: TeamsModuleOptions,
    private readonly configService: ConfigService<ServerConfig>,
  ) {
    this.webhookUrl =
      this.options.webhookUrl ||
      this.configService.getOrThrow<string>('teamsWebhookUrl');

    if (!this.webhookUrl) {
      throw new Error('A webhook url is required.');
    }
  }

  async send({ title, name, description, data }: TeamsPayload) {
    const now = new Date().toISOString().slice(0, 19) + 'Z'; // Teams에서 밀리세컨드 허용안됨

    const dataSet = Object.entries(data ?? {}).map(([title, value]) => ({
      title,
      value,
    }));

    return await this.httpService.axiosRef.post(this.webhookUrl, {
      type: 'message',
      attachments: [
        {
          contentType: 'application/vnd.microsoft.card.adaptive',
          contentUrl: null,
          content: {
            $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
            type: 'AdaptiveCard',
            version: '1.2',
            body: [
              {
                type: 'TextBlock',
                size: 'Medium',
                weight: 'Bolder',
                text: title,
              },
              {
                type: 'ColumnSet',
                columns: [
                  {
                    type: 'Column',
                    items: [
                      {
                        type: 'Image',
                        style: 'person',
                        url: 'https://picsum.photos/id/357/200/200',
                        altText: name,
                        size: 'Small',
                      },
                    ],
                    width: 'auto',
                  },
                  {
                    type: 'Column',
                    items: [
                      {
                        type: 'TextBlock',
                        weight: 'Bolder',
                        text: name,
                        wrap: true,
                      },
                      {
                        type: 'TextBlock',
                        spacing: 'None',
                        text: `Created {{DATE(${now},SHORT)}} at {{TIME(${now})}}`,
                        isSubtle: true,
                        wrap: true,
                      },
                    ],
                    width: 'stretch',
                  },
                ],
              },
              {
                type: 'TextBlock',
                text: description,
                wrap: true,
              },
              ...(data
                ? [
                    {
                      type: 'FactSet',
                      facts: dataSet,
                    },
                  ]
                : []),
            ],
          },
        },
      ],
    });
  }
}
