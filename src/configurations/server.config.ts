export interface ServerConfig {
  nodeEnv: string;
  port: number;

  // mongo
  mongoUser: string;
  mongoPass: string;
  mongoUri: string;
  mongoDatabase: string;

  // Teams
  teamsWebhookUrl: string;

  // Slack
  slackWebhookUrl: string;
}

export const serverConfig = (): ServerConfig => ({
  // server
  nodeEnv: process.env.NODE_ENV || 'dev',
  port: Number(process.env.PORT) || 3000,

  // mongo
  mongoUser: process.env.MONGO_USER || 'user',
  mongoPass: process.env.MONGO_PASS || 'password',
  mongoUri: process.env.MONGO_URI || 'localhost',
  mongoDatabase: process.env.MONGO_DATABASE || 'database',

  // Teams
  teamsWebhookUrl: process.env.TEAMS_WEBHOOK_URL || 'teamsUrl',

  // Slack
  slackWebhookUrl: process.env.SLACK_WEBHOOK_URL || 'slackUrl',
});
