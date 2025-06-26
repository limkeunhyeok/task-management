import { Inject, Logger } from '@nestjs/common';
import { SlackMessageType } from 'src/modules/slack/slack.interface';
import { SlackService } from 'src/modules/slack/slack.service';

export function TrackTaskExecution(): MethodDecorator {
  return (
    target: object,
    propertyKey: string | symbol,
    propertyDescriptor: PropertyDescriptor,
  ) => {
    const injectSlackService = Inject(SlackService);
    injectSlackService(target, 'slackService');

    const originalMethod = propertyDescriptor.value;

    propertyDescriptor.value = async function (...args: any[]) {
      const that = this as { slackService: SlackService };
      const slackService: SlackService = that.slackService;

      const className = this.constructor?.name ?? 'UnknownClass';
      const logger = new Logger(className);

      try {
        logger.log(`${className} has started.`);
        const result = await originalMethod.apply(this, args);

        logger.log(`${className} has finished successfully.`);
        slackService.send({
          type: SlackMessageType.SCHEDULER_RESULT,
          options: {
            headerTitle: `${className} Task Completed`,
            taskDescription: `The \`${className}\` was completed successfully.`,
            target: className,
            data: args,
          },
        });

        return result;
      } catch (err: unknown) {
        const name = err instanceof Error ? err.name : 'UnhandledError';
        const message = err instanceof Error ? err.message : String(err);
        const stack = err instanceof Error ? err.stack : '';

        logger.error({
          message: `${className} failed with an error.`,
          error: {
            name,
            message,
            stack,
          },
        });

        slackService.send({
          type: SlackMessageType.SCHEDULER_ERROR,
          options: {
            headerTitle: `${className} Task Failed`,
            taskDescription: `An error occurred while running the \`${className}\`.`,
            target: className,
            errorStack: stack,
            data: args,
          },
        });
      }
    };
  };
}
