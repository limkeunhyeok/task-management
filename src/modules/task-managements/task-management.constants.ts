export const TaskRegistrationStatus = {
  REGISTERED: 'registered',
  NOT_REGISTERED: 'not_registered',
} as const;

export type TaskRegistrationStatus =
  (typeof TaskRegistrationStatus)[keyof typeof TaskRegistrationStatus];
