import { composeService } from '@gaman/core';

export const AppService = composeService((r: string) => ({
  Welcome() {
    return 'Welcome';
  },
}));

export type AppServiceType = ReturnType<typeof AppService>;
