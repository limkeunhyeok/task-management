export function createSchedulerErrorMessage(
  params: {
    username?: string;
    iconUrl?: string;
    headerTitle?: string;
    taskDescription?: string;
    target?: string;
    errorStack?: string;
    data?: Record<string, any>;
  } = {},
) {
  const {
    username = 'notification',
    iconUrl = 'https://slack.com/img/icons/app-57.png',
    headerTitle,
    taskDescription,
    target,
    errorStack,
    data,
  } = params;

  const now = new Date().toISOString();

  const taskParamBlock = data
    ? [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*실행 파라미터:*',
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `\`\`\`\n${JSON.stringify(data, null, 2)}\n\`\`\``,
          },
        },
      ]
    : [];

  const errorStackBlock =
    typeof errorStack === 'string'
      ? [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Error Message:*\n\`\`\`\n${errorStack}\n\`\`\``,
            },
          },
        ]
      : [];

  return {
    username,
    icon_url: iconUrl,
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: headerTitle ?? 'Task Failed',
        },
      },
      {
        type: 'divider',
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: taskDescription ?? 'An error occurred during task execution.',
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*타겟:*\n${target ?? 'unknown'}`,
          },
          {
            type: 'mrkdwn',
            text: `*실패 시간:*\n${now}`,
          },
        ],
      },
      ...taskParamBlock,
      ...errorStackBlock,
    ],
  };
}
