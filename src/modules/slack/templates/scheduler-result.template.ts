export function createSchedulerResultMessage(
  params: {
    username?: string;
    iconUrl?: string;
    headerTitle?: string;
    taskDescription?: string;
    target?: string;
    data?: Record<string, any>;
  } = {},
) {
  const {
    username = 'notification',
    iconUrl = 'https://slack.com/img/icons/app-57.png',
    headerTitle,
    taskDescription,
    target,
    data,
  } = params;

  const now = new Date().toISOString();

  const dataSet = Object.entries(data ?? {}).map(([key, value]) => ({
    type: 'mrkdwn',
    text: `*${key}:* ${value}`,
  }));

  const shouldShowDetailSection = dataSet && dataSet.length > 0;

  return {
    username,
    icon_url: iconUrl,
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: headerTitle,
        },
      },
      {
        type: 'divider',
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: taskDescription,
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*타겟:*\n${target}`,
          },
          {
            type: 'mrkdwn',
            text: `*완료 시간:*\n${now}`,
          },
        ],
      },
      ...(shouldShowDetailSection
        ? [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: '*상세 내용*',
              },
            },
            {
              type: 'section',
              fields: dataSet,
            },
          ]
        : []),
    ],
  };
}
